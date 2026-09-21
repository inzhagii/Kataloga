import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStoreCatalog } from '../hooks/useStoreCatalog'
import StoreNavbar from '../components/storefront/StoreNavbar'
import CatalogSection from '../components/storefront/CatalogSection'
import StoreFooter from '../components/storefront/StoreFooter'
import ShareSheet from '../components/storefront/ShareSheet'
import StoreLandingSkeleton from '../components/storefront/StoreLandingSkeleton'
import EmptyState from '../components/shared/EmptyState'
import {
  buildStoreProductUrl,
  buildStoreUrl,
  resolveProductSlug,
} from '../utils/storefrontUrl'

/**
 * Public product listing for a store (/{storeId}/products).
 * Reuses the storefront catalog block (search / filter / sort / grid) from
 * the Store Landing so customer behavior stays identical. Viewing and
 * sharing are the only actions here; WhatsApp/Marketplace interest actions
 * belong to the Store Landing and Product Detail. Share URLs use the
 * canonical product-detail route.
 */
function ProductListingPage() {
  const { storeId } = useParams()
  const { status, store, products, categories, error, reload } = useStoreCatalog(storeId)
  const [shareTarget, setShareTarget] = useState(null)

  function handleShareProduct(product) {
    if (!store) {
      return
    }
    const url = `${window.location.origin}${buildStoreProductUrl(
      store.storeId,
      product.id,
      resolveProductSlug(product),
    )}`
    setShareTarget({
      title: 'Bagikan Produk',
      description: product.name,
      url,
      whatsappText: `Lihat produk ini di ${store.name}:\n\n${product.name}\n${url}`,
    })
  }

  if (status === 'loading') {
    return <StoreLandingSkeleton />
  }

  if (status === 'notFound') {
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

  if (status === 'error') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface px-6">
        <EmptyState
          icon="cloud_off"
          title="Gagal memuat toko"
          description={error || 'Terjadi kesalahan. Silakan coba lagi.'}
          action={
            <button
              type="button"
              onClick={reload}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-surface">
      <StoreNavbar store={store} />

      <main className="mx-auto w-full max-w-[1140px] px-4 pb-16 pt-20 md:px-6 md:pt-24">
        <div className="pt-2 sm:pt-4">
          <Link
            to={buildStoreUrl(store.storeId)}
            className="group inline-flex items-center gap-2 text-xs font-medium text-secondary transition-colors hover:text-primary sm:text-sm"
          >
            <span
              className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            >
              arrow_back
            </span>
            Kembali ke Toko
          </Link>

          <div className="mt-5">
            <CatalogSection
              storeId={store.storeId}
              storeName={store.name}
              products={products}
              categories={categories}
              onShare={handleShareProduct}
            />
          </div>
        </div>
      </main>

      <StoreFooter store={store} />

      <ShareSheet
        open={Boolean(shareTarget)}
        onClose={() => setShareTarget(null)}
        title={shareTarget?.title}
        description={shareTarget?.description}
        url={shareTarget?.url}
        whatsappText={shareTarget?.whatsappText}
      />
    </div>
  )
}

export default ProductListingPage