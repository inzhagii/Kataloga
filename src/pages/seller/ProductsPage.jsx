import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSellerProducts } from '../../hooks/useSellerProducts'
import { listCategories } from '../../services/categoryService'
import {
  archiveProduct,
  markSoldOut,
  publishProduct,
  reactivateProduct,
  toggleFeatured,
} from '../../services/productService'
import { recordProductPublished } from '../../services/activityService'
import { validateProductForPublish } from '../../utils/productValidation'
import ProductsToolbar from '../../components/seller/products/ProductsToolbar'
import StatusTabs from '../../components/seller/products/StatusTabs'
import ProductTable from '../../components/seller/products/ProductTable'
import ProductCardList from '../../components/seller/products/ProductCardList'
import EmptyProducts from '../../components/seller/products/EmptyProducts'
import EmptyState from '../../components/shared/EmptyState'
import Toast from '../../components/shared/Toast'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

/**
 * Seller Products: seller-management list (PUBLISHED, DRAFT and SOLD_OUT)
 * with per-row actions (edit, publish, sold-out, reactivate, featured,
 * archive), search/filter/sort and the Active/Draft/Sold Out tabs.
 * Archived products live on /seller/products/archived. Active Products =
 * PUBLISHED only.
 */
function ProductsPage() {
  const navigate = useNavigate()
  const location = useLocation()
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
    sort,
    setSort,
    hasActiveFilters,
    resetFilters,
  } = useSellerProducts()

  const [categories, setCategories] = useState([])
  const [toast, setToast] = useState(location.state?.feedback ?? null)
  const [productToArchive, setProductToArchive] = useState(null)
  const [archiveSubmitting, setArchiveSubmitting] = useState(false)
  const [productToSoldOut, setProductToSoldOut] = useState(null)
  const [soldOutSubmitting, setSoldOutSubmitting] = useState(false)

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
    if (location.state?.feedback) {
      navigate(location.pathname, { replace: true, state: null })
    }
    // Only consume the feedback from a previous route once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      await recordProductPublished(product.name)
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
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Products</h1>
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-secondary">Kelola produk dan katalog kamu.</p>
        </div>
        <Link
          to="/seller/products/new"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
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
        resetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        sort={sort}
        onSort={setSort}
        categories={categories}
      />

      <StatusTabs
        tab={tab}
        onTabChange={setTab}
        counts={counts}
        archivedCount={archivedCount}
      />

      {products.length === 0 ? (
        hasActiveFilters ? (
          <EmptyProducts variant="search" />
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
        description="Produk akan tidak tampil di katalog aktif dan hanya terlihat di area Sold Out. Kamu bisa mengaktifkannya kembali kapan saja."
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