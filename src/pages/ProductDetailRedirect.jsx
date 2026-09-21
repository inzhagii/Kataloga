import { Link, Navigate, useParams } from 'react-router-dom'
import { useProductDetail } from '../hooks/useProductDetail'
import { buildStoreProductUrl, resolveProductSlug } from '../utils/storefrontUrl'
import EmptyState from '../components/shared/EmptyState'

/**
 * One-time redirect for the legacy product-detail URL
 * (/{storeId}/products/{productId}) to the canonical route
 * (/{storeId}/product/{productId}/{slug}).
 *
 * The product is resolved first so the canonical slug is the real product
 * slug (API slug when available, otherwise the deterministic from-name
 * fallback). Resolves exactly once — the canonical route does not retain
 * this route, so no redirect loop is possible.
 */
function ProductDetailRedirect() {
  const { storeId, productId } = useParams()
  const { status, store, product } = useProductDetail(storeId, productId)

  if (status === 'loading') {
    return null
  }

  if (status === 'ready' && store && product) {
    return (
      <Navigate
        to={buildStoreProductUrl(store.storeId, product.id, resolveProductSlug(product))}
        replace
      />
    )
  }

  if (status === 'storeNotFound') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface px-6">
        <EmptyState
          icon="storefront"
          title="Toko tidak ditemukan"
          description="Toko yang Anda cari tidak tersedia atau sudah tidak aktif."
          action={
            <Link
              to="/"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700"
            >
              Kembali ke Beranda
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface px-6">
      <EmptyState
        icon="search_off"
        title="Produk tidak ditemukan"
        description="Produk yang Anda cari tidak tersedia atau sudah tidak aktif."
        action={
          <Link
            to={`/${storeId ?? ''}`}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700"
          >
            Kembali ke Toko
          </Link>
        }
      />
    </div>
  )
}

export default ProductDetailRedirect