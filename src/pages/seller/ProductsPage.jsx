import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useSellerProducts } from '../../hooks/useSellerProducts'
import { listCategories } from '../../services/categoryService'
import { listBrands } from '../../services/brandService'
import {
  archiveProduct,
  markSoldOut,
  publishProduct,
  reactivateProduct,
  toggleFeatured,
} from '../../services/productService'
import {
  recordProductPublished,
  recordProductArchived,
  recordProductSoldOut,
  recordProductReactivated,
} from '../../services/activityService'
import { validateProductForPublish } from '../../utils/productValidation'
import ProductsToolbar from '../../components/seller/products/ProductsToolbar'
import StatusTabs from '../../components/seller/products/StatusTabs'
import ProductTable from '../../components/seller/products/ProductTable'
import ProductCardList from '../../components/seller/products/ProductCardList'
import EmptyProducts from '../../components/seller/products/EmptyProducts'
import ArchivedProductsLink from '../../components/seller/products/ArchivedProductsLink'
import EmptyState from '../../components/shared/EmptyState'
import Toast from '../../components/shared/Toast'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

/**
 * Seller Products: seller-management list (PUBLISHED, DRAFT and SOLD_OUT)
 * with per-row actions (edit, publish, sold-out, reactivate, featured,
 * archive), search/filter and the Active/Draft/Sold Out tabs. The locked
 * layout has no Sort on the seller Products list.
 * Archived products live on /seller/products/archived. Active Products =
 * PUBLISHED only.
 */
function ProductsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryIdFromUrl = searchParams.get('category') || ''
  const brandIdFromUrl = searchParams.get('brand') || ''

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [toast, setToast] = useState(location.state?.feedback ?? null)
  const [productToArchive, setProductToArchive] = useState(null)
  const [archiveSubmitting, setArchiveSubmitting] = useState(false)
  const [productToSoldOut, setProductToSoldOut] = useState(null)
  const [soldOutSubmitting, setSoldOutSubmitting] = useState(false)

  // ?category= carries the category ID; the filter itself works on the category
  // NAME (the product join key), mirroring the M7 brand filter.
  const categoryFromUrl = useMemo(() => {
    if (!categoryIdFromUrl) {
      return ''
    }
    const match = categories.find((category) => String(category.id) === categoryIdFromUrl)
    return match ? match.name : ''
  }, [categoryIdFromUrl, categories])

  const brandFromUrl = useMemo(() => {
    if (!brandIdFromUrl) {
      return ''
    }
    const match = brands.find((brand) => String(brand.id) === brandIdFromUrl)
    return match ? match.name : ''
  }, [brandIdFromUrl, brands])

  const {
    status,
    products,
    counts,
    archivedCount,
    error,
    reload,
    tab,
    setTab,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
  } = useSellerProducts({ initialCategory: categoryFromUrl, categories })

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
    if (location.state?.feedback) {
      navigate(location.pathname, { replace: true, state: null })
    }
    // Only consume the feedback from a previous route once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ?category=... and ?brand=... are the source of truth for the deep-linked
  // filters (from the Categories / Brand Management pages). Keep local filter
  // state in sync with the URL. `?brand=` carries the brand ID; the brand
  // filter itself works on the brand NAME (the product join key).
  useEffect(() => {
    setFilters((current) =>
      current.category === categoryFromUrl ? current : { ...current, category: categoryFromUrl },
    )
  }, [categoryFromUrl, setFilters])

  useEffect(() => {
    setFilters((current) =>
      current.brand === brandFromUrl ? current : { ...current, brand: brandFromUrl },
    )
  }, [brandFromUrl, setFilters])

  function handleResetFilters() {
    resetFilters()
    if (categoryIdFromUrl || brandIdFromUrl) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('category')
      nextParams.delete('brand')
      setSearchParams(nextParams, { replace: true })
    }
  }

  async function handlePublish(product) {
    const { valid } = validateProductForPublish(product)
    if (!valid) {
      navigate(`/seller/products/${product.id}/edit`, {
        state: {
          feedback: {
            type: 'error',
            message: 'Produk belum lengkap untuk dipublikasi. Lengkapi data di form.',
          },
        },
      })
      return
    }
    try {
      await publishProduct(product.id)
      await recordProductPublished(product.name, { productId: product.id })
      reload()
      setToast({ type: 'success', message: `${product.name} berhasil dipublikasi.` })
    } catch (publishError) {
      setToast({
        type: 'error',
        message:
          publishError instanceof Error
            ? publishError.message
            : 'Gagal mempublikasi produk. Silakan coba lagi.',
      })
    }
  }

  async function handleToggleFeatured(product) {
    try {
      const updated = await toggleFeatured(product.id)
      reload()
      setToast({
        type: 'success',
        message: updated.featured
          ? `${product.name} ditambahkan sebagai Featured.`
          : `${product.name} dihapus dari Featured.`,
      })
    } catch (toggleError) {
      setToast({
        type: 'error',
        message:
          toggleError instanceof Error
            ? toggleError.message
            : 'Gagal mengubah status featured. Silakan coba lagi.',
      })
    }
  }

  async function confirmArchive() {
    if (!productToArchive) {
      return
    }
    setArchiveSubmitting(true)
    try {
      await archiveProduct(productToArchive.id)
      await recordProductArchived(productToArchive.name, { productId: productToArchive.id })
      setToast({ type: 'success', message: `${productToArchive.name} diarsipkan.` })
      setProductToArchive(null)
      reload()
    } catch (archiveError) {
      setToast({
        type: 'error',
        message:
          archiveError instanceof Error
            ? archiveError.message
            : 'Gagal mengarsipkan produk. Silakan coba lagi.',
      })
    } finally {
      setArchiveSubmitting(false)
    }
  }

  async function confirmSoldOut() {
    if (!productToSoldOut) {
      return
    }
    setSoldOutSubmitting(true)
    try {
      await markSoldOut(productToSoldOut.id)
      await recordProductSoldOut(productToSoldOut.name, { productId: productToSoldOut.id })
      setToast({ type: 'success', message: `${productToSoldOut.name} ditandai Sold Out.` })
      setProductToSoldOut(null)
      reload()
    } catch (soldOutError) {
      setToast({
        type: 'error',
        message:
          soldOutError instanceof Error
            ? soldOutError.message
            : 'Gagal menandai Sold Out. Silakan coba lagi.',
      })
    } finally {
      setSoldOutSubmitting(false)
    }
  }

  async function handleReactivate(product) {
    try {
      const updated = await reactivateProduct(product.id)
      await recordProductReactivated(updated.name, { productId: updated.id })
      setToast({
        type: 'success',
        message: `${updated.name} diaktifkan kembali sebagai Published.`,
      })
      reload()
    } catch (reactivateError) {
      setToast({
        type: 'error',
        message:
          reactivateError instanceof Error
            ? reactivateError.message
            : 'Gagal mengaktifkan kembali produk. Silakan coba lagi.',
      })
    }
  }

  const filteredEmptyAction = (
    <button
      type="button"
      onClick={handleResetFilters}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
        refresh
      </span>
      Reset Filter
    </button>
  )

  if (status === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-surface-container-high/60" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Products
          </h1>
        </div>
        <EmptyState
          icon="error"
          title="Gagal memuat produk"
          description={error}
          action={
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-secondary">Kelola produk dan katalog kamu.</p>
        </div>
        <Link
          to="/seller/products/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            add
          </span>
          Tambah Produk
        </Link>
      </div>

      <ProductsToolbar
        search={search}
        onSearch={setSearch}
        filters={filters}
        onFilterChange={setFilters}
        resetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
        brands={brands}
        archiveLink={<ArchivedProductsLink count={archivedCount} className="lg:hidden" />}
      />

      <StatusTabs
        tab={tab}
        onTabChange={setTab}
        counts={counts}
        archivedCount={archivedCount}
      />

      {products.length === 0 ? (
        hasActiveFilters ? (
          <EmptyProducts variant="search" action={filteredEmptyAction} />
        ) : (
          <EmptyProducts variant={tab === 'draft' ? 'draft' : 'none'} />
        )
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
          <ProductTable
            products={products}
            onPublish={handlePublish}
            onToggleFeatured={handleToggleFeatured}
            onArchive={setProductToArchive}
            onMarkSoldOut={setProductToSoldOut}
            onReactivate={handleReactivate}
            onRestore={() => {}}
          />
          <ProductCardList
            products={products}
            onPublish={handlePublish}
            onToggleFeatured={handleToggleFeatured}
            onArchive={setProductToArchive}
            onMarkSoldOut={setProductToSoldOut}
            onReactivate={handleReactivate}
            onRestore={() => {}}
          />
        </div>
      )}

      <ConfirmDialog
        open={Boolean(productToArchive)}
        title={`Arsipkan "${productToArchive?.name}"?`}
        description="Produk yang diarsipkan tidak tampil di toko. Kamu bisa restore ke draft kapan saja."
        confirmLabel="Arsipkan"
        cancelLabel="Batal"
        tone="danger"
        isSubmitting={archiveSubmitting}
        onConfirm={confirmArchive}
        onCancel={() => setProductToArchive(null)}
      />

      <ConfirmDialog
        open={Boolean(productToSoldOut)}
        title={`Tandai "${productToSoldOut?.name}" sebagai Sold Out?`}
        description="Produk ditandai Sold Out dan tetap tampil di katalog (dengan indikasi Sold Out) selama masih dalam jendela Auto Archive toko. Kamu bisa mengaktifkannya kembali kapan saja."
        confirmLabel="Sold Out"
        cancelLabel="Batal"
        tone="danger"
        isSubmitting={soldOutSubmitting}
        onConfirm={confirmSoldOut}
        onCancel={() => setProductToSoldOut(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default ProductsPage