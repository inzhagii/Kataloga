import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSellerProducts } from '../../hooks/useSellerProducts'
import { useMyStore } from '../../hooks/useMyStore'
import { listCategories } from '../../services/categoryService'
import { restoreProduct } from '../../services/productService'
import { updateStore } from '../../services/storeService'
import { recordProductRestored, recordStoreUpdated } from '../../services/activityService'
import ProductsToolbar from '../../components/seller/products/ProductsToolbar'
import AutoArchivePopover from '../../components/seller/products/AutoArchivePopover'
import ArchivedProductDetail from '../../components/seller/products/ArchivedProductDetail'
import ProductTable from '../../components/seller/products/ProductTable'
import ProductCardList from '../../components/seller/products/ProductCardList'
import EmptyProducts from '../../components/seller/products/EmptyProducts'
import EmptyState from '../../components/shared/EmptyState'
import Toast from '../../components/shared/Toast'

/**
 * Archived Products: list of ARCHIVED products on their own route
 * (/seller/products/archived). Hosts the store-level Auto Archive setting
 * (store-level, not per product). Restore always returns a product to DRAFT
 * and navigates back to the active products list. "Detail Product" opens a
 * read-only internal product detail (no customer-facing actions).
 */
function ArchivedProductsPage() {
  const navigate = useNavigate()
  const {
    status,
    products,
    error,
    reload,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
  } = useSellerProducts({ archived: true })

  const { store, reload: reloadStore } = useMyStore()
  const [categories, setCategories] = useState([])
  const [toast, setToast] = useState(null)
  const [detailProduct, setDetailProduct] = useState(null)
  const [savingAutoArchive, setSavingAutoArchive] = useState(false)

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

  async function handleAutoArchiveSave(autoArchiveDays) {
    if (!store) {
      return
    }
    setSavingAutoArchive(true)
    try {
      await updateStore(store.storeId, { autoArchiveDays })
      await recordStoreUpdated()
      await reloadStore()
      setToast({ type: 'success', message: 'Setelan Auto Archive berhasil disimpan.' })
    } catch (saveError) {
      setToast({
        type: 'error',
        message:
          saveError instanceof Error
            ? saveError.message
            : 'Gagal menyimpan setelan Auto Archive. Silakan coba lagi.',
      })
    } finally {
      setSavingAutoArchive(false)
    }
  }

  async function handleRestore(product) {
    try {
      const restored = await restoreProduct(product.id)
      await recordProductRestored(restored.name, { productId: restored.id })
      setDetailProduct(null)
      navigate('/seller/products', {
        state: {
          feedback: {
            type: 'success',
            message: `${restored.name} direstore ke draft.`,
          },
        },
      })
    } catch (restoreError) {
      setToast({
        type: 'error',
        message:
          restoreError instanceof Error
            ? restoreError.message
            : 'Gagal me-restore produk. Silakan coba lagi.',
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
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Archived Products
        </h1>
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

  if (detailProduct) {
    return (
      <div>
        <ArchivedProductDetail
          product={detailProduct}
          storeName={store?.name}
          onBack={() => setDetailProduct(null)}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Archived Products
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Produk yang diarsipkan. Restore selalu kembali ke draft.
          </p>
        </div>
        <Link
          to="/seller/products"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            arrow_back
          </span>
          Kembali
        </Link>
      </div>

      <ProductsToolbar
        search={search}
        onSearch={setSearch}
        filters={filters}
        onFilterChange={setFilters}
        resetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
        autoArchive={
          <AutoArchivePopover
            autoArchiveDays={store?.autoArchiveDays ?? null}
            onSave={handleAutoArchiveSave}
            disabled={savingAutoArchive}
          />
        }
      />

      {products.length === 0 ? (
        hasActiveFilters ? (
          <EmptyProducts
            variant="search"
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  refresh
                </span>
                Reset Filter
              </button>
            }
          />
        ) : (
          <EmptyProducts variant="archived" />
        )
      ) : (
        <div className="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
          <ProductTable
            products={products}
            onPublish={() => {}}
            onToggleFeatured={() => {}}
            onArchive={() => {}}
            onMarkSoldOut={() => {}}
            onReactivate={() => {}}
            onRestore={handleRestore}
            onDetail={setDetailProduct}
          />
          <ProductCardList
            products={products}
            onPublish={() => {}}
            onToggleFeatured={() => {}}
            onArchive={() => {}}
            onMarkSoldOut={() => {}}
            onReactivate={() => {}}
            onRestore={handleRestore}
            onDetail={setDetailProduct}
          />
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default ArchivedProductsPage