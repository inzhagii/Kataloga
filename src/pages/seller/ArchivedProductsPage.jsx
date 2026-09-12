import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSellerProducts } from '../../hooks/useSellerProducts'
import { listCategories } from '../../services/categoryService'
import { restoreProduct } from '../../services/productService'
import ProductsToolbar from '../../components/seller/products/ProductsToolbar'
import ProductTable from '../../components/seller/products/ProductTable'
import ProductCardList from '../../components/seller/products/ProductCardList'
import EmptyProducts from '../../components/seller/products/EmptyProducts'
import EmptyState from '../../components/shared/EmptyState'
import Toast from '../../components/shared/Toast'

/**
 * Archived Products: list of ARCHIVED products on their own route
 * (/seller/products/archived). Restore always returns a product to DRAFT and
 * navigates back to the active products list.
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
    sort,
    setSort,
    hasActiveFilters,
    resetFilters,
  } = useSellerProducts({ archived: true })

  const [categories, setCategories] = useState([])
  const [toast, setToast] = useState(null)

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

  async function handleRestore(product) {
    try {
      const restored = await restoreProduct(product.id)
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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Archived Products
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Produk yang diarsipkan. Restore selalu kembali ke draft.
          </p>
        </div>
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

      {products.length === 0 ? (
        hasActiveFilters ? (
          <EmptyProducts variant="search" />
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
          />
          <ProductCardList
            products={products}
            onPublish={() => {}}
            onToggleFeatured={() => {}}
            onArchive={() => {}}
            onMarkSoldOut={() => {}}
            onReactivate={() => {}}
            onRestore={handleRestore}
          />
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default ArchivedProductsPage