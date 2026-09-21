import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductForm } from '../../../hooks/useProductForm'
import { listCategories } from '../../../services/categoryService'
import { listBrands } from '../../../services/brandService'
import ProductPhotosSection from './form/ProductPhotosSection'
import ProductBasicInfoSection from './form/ProductBasicInfoSection'
import ProductDetailsSection from './form/ProductDetailsSection'
import ProductDescriptionSection from './form/ProductDescriptionSection'
import ProductConditionSection from './form/ProductConditionSection'
import ProductExternalLinksSection from './form/ProductExternalLinksSection'
import ProductCatalogSettingsSection from './form/ProductCatalogSettingsSection'
import FormActionsBar from './form/FormActionsBar'
import ConfirmDialog from '../../shared/ConfirmDialog'

/**
 * Reusable product form shared by Add Product (mode 'create') and
 * Edit Product (mode 'edit', with existing data prefilled). Section order
 * follows the locked UI_RULES: Photos, Product Name, Category, Brand,
 * Product Details, Description, Condition, Price, External Product Links,
 * Featured.
 *
 * Create mode actions: Batal / Save Draft / Publish Product (with a
 * confirmation dialog before publishing). Edit mode actions: Batal / Simpan
 * only — no status buttons — and Simpan keeps the current product status.
 *
 * @param {{
 *   mode: 'create'|'edit',
 *   initialProduct?: import('../../../data/models.js').Product|null,
 * }} props
 */
function ProductForm({ mode = 'create', initialProduct = null }) {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false)

  const {
    form,
    errors,
    formError,
    submitting,
    setField,
    setPrice,
    addImage,
    removeImage,
    setPrimaryImage,
    addDetail,
    updateDetail,
    removeDetail,
    addExternalLink,
    updateExternalLink,
    removeExternalLink,
    saveDraft,
    publish,
  } = useProductForm({ mode, initialProduct })

  useEffect(() => {
    let active = true
    listCategories().then((value) => {
      if (active) {
        setCategories(value)
      }
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    listBrands().then((value) => {
      if (active) {
        setBrands(value)
      }
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      document
        .querySelector('[data-error="true"]')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [errors])

  const isEdit = mode === 'edit'

  async function handleSaveDraft() {
    const result = await saveDraft()
    if (result.ok) {
      navigate('/seller/products', { state: { feedback: result.feedback } })
    }
  }

  async function handlePublish() {
    setPublishConfirmOpen(false)
    const result = await publish()
    if (result.ok) {
      navigate('/seller/products', { state: { feedback: result.feedback } })
    }
  }

  return (
    <div className="pb-40 lg:pb-24">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate('/seller/products')}
          className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            arrow_back
          </span>
          Kembali ke Daftar Produk
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          {isEdit ? 'Edit Produk' : 'Tambah Produk'}
        </h1>
        <p className="mt-1 text-sm text-secondary">
          {isEdit
            ? 'Perbarui informasi produk di katalog kamu.'
            : 'Buat produk baru untuk katalog kamu.'}
        </p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-error/20 bg-error-container p-4"
        >
          <span
            className="material-symbols-outlined mt-0.5 text-[20px] text-error"
            aria-hidden="true"
          >
            error
          </span>
          <p className="text-sm font-semibold text-on-error-container">{formError}</p>
        </div>
      ) : null}

      <form
        className="flex flex-col gap-8"
        noValidate
        onSubmit={(event) => event.preventDefault()}
      >
        <ProductPhotosSection
          form={form}
          errors={errors}
          addImage={addImage}
          removeImage={removeImage}
          setPrimaryImage={setPrimaryImage}
        />
        <ProductBasicInfoSection
          form={form}
          errors={errors}
          categories={categories}
          brands={brands}
          setField={setField}
        />
        <ProductDetailsSection
          form={form}
          errors={errors}
          addDetail={addDetail}
          updateDetail={updateDetail}
          removeDetail={removeDetail}
        />
        <ProductDescriptionSection
          form={form}
          errors={errors}
          setField={setField}
        />
        <ProductConditionSection
          form={form}
          errors={errors}
          setField={setField}
          setPrice={setPrice}
        />
        <ProductExternalLinksSection
          form={form}
          addExternalLink={addExternalLink}
          updateExternalLink={updateExternalLink}
          removeExternalLink={removeExternalLink}
        />
        <ProductCatalogSettingsSection form={form} setField={setField} />
      </form>

      <FormActionsBar
        mode={mode}
        submitting={submitting}
        onCancel={() => navigate('/seller/products')}
        onSaveDraft={handleSaveDraft}
        onPublish={() => setPublishConfirmOpen(true)}
      />

      {!isEdit ? (
        <ConfirmDialog
          open={publishConfirmOpen}
          title="Publikasikan produk?"
          description="Produk akan langsung tampil di toko kamu setelah melewati validasi field wajib (foto, kategori, detail, deskripsi, kondisi, dan harga)."
          confirmLabel="Publish Produk"
          cancelLabel="Batal"
          isSubmitting={submitting}
          onConfirm={handlePublish}
          onCancel={() => setPublishConfirmOpen(false)}
        />
      ) : null}
    </div>
  )
}

export default ProductForm