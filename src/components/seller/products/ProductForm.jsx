import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProductForm } from '../../../hooks/useProductForm'
import { listCategories } from '../../../services/categoryService'
import ProductPhotosSection from './form/ProductPhotosSection'
import ProductBasicInfoSection from './form/ProductBasicInfoSection'
import ProductDetailsSection from './form/ProductDetailsSection'
import ProductDescriptionSection from './form/ProductDescriptionSection'
import ProductConditionSection from './form/ProductConditionSection'
import ProductExternalLinksSection from './form/ProductExternalLinksSection'
import ProductCatalogSettingsSection from './form/ProductCatalogSettingsSection'
import FormActionsBar from './form/FormActionsBar'

/**
 * Reusable product form shared by Add Product (mode 'create') and
 * Edit Product (mode 'edit', with existing data prefilled). Section order
 * follows the locked UI_RULES: Photos, Product Name, Category, Brand,
 * Product Details, Description, Condition, Price, External Product Links,
 * Featured.
 *
 * @param {{
 *   mode: 'create'|'edit',
 *   initialProduct?: import('../../../data/models.js').Product|null,
 * }} props
 */
function ProductForm({ mode = 'create', initialProduct = null }) {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

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
        submitting={submitting}
        onCancel={() => navigate('/seller/products')}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
    </div>
  )
}

export default ProductForm