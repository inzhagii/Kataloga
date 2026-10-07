import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStoreCatalog } from '../hooks/useStoreCatalog'
import { useFloatingActionBar } from '../hooks/useFloatingActionBar'
import { useStorefrontContactActions } from '../hooks/useStorefrontContactActions'
import {
  buildStoreListingUrl,
  buildStoreProductUrl,
  buildStoreUrl,
  resolveProductSlug,
} from '../../../utils/storefrontUrl'
import StoreNavbar from '../components/StoreNavbar'
import StoreHeader from '../components/StoreHeader'
import StoreActions from '../components/StoreActions'
import AnnouncementBanner from '../components/AnnouncementBanner'
import FeaturedProducts from '../components/FeaturedProducts'
import CatalogSection from '../components/CatalogSection'
import StoreFooter from '../components/StoreFooter'
import ShareSheet from '../components/ShareSheet'
import StoreLandingSkeleton from '../components/StoreLandingSkeleton'
import EmptyState from '../../../components/ui/EmptyState'
import Toast from '../../../components/ui/Toast'

/**
 * Public storefront for a seller store (/{storeId}). Catalog (search /
 * filter / sort), featured products, announcement, a compact footer, and a
 * floating action bar (WhatsApp / Marketplace / Share) that reveals once the
 * Store Information header scrolls out of view and hides while the footer is
 * visible. Share lives only in that bar on desktop AND mobile — never in the
 * navbar. WhatsApp and Marketplace clicks are the only actions that record
 * Customer Interest; the destination opens only after the interest is recorded
 * successfully. Guests are routed through Login first and the action
 * auto-continues after they return.
 */
function StoreLandingPage() {
  const { storeId } = useParams()
  const { status, store, products, categories, error, reload } = useStoreCatalog(storeId)
  const [shareTarget, setShareTarget] = useState(null)
  const headerRef = useRef(null)
  const footerRef = useRef(null)

  const returnPath = buildStoreUrl(storeId)
  const { handleWhatsApp, handleSelectChannel, actionError, dismissActionError } =
    useStorefrontContactActions({ store, storeId, returnPath })
  const actionBarVisible = useFloatingActionBar({
    headerRef,
    footerRef,
    enabled: status === 'ready',
  })

  function handleShareStore() {
    if (!store) {
      return
    }
    const url = `${window.location.origin}${returnPath}`
    setShareTarget({
      title: 'Bagikan Toko',
      description: `Kunjungi katalog ${store.name} di Kataloga.`,
      url,
      whatsappText: `Lihat toko ini di Kataloga:\n\n${store.name}\n${url}`,
    })
  }

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

      <main className="mx-auto max-w-[1140px] px-4 pb-16 pt-20 md:px-6 md:pt-24">
        <StoreHeader store={store} innerRef={headerRef} />

        <AnnouncementBanner announcement={store.announcement} />

        <FeaturedProducts
          products={products}
          storeId={store.storeId}
          storeName={store.name}
          onShare={handleShareProduct}
        />

        <CatalogSection
          storeId={store.storeId}
          storeName={store.name}
          products={products}
          categories={categories}
          onShare={handleShareProduct}
          listingHref={buildStoreListingUrl(store.storeId)}
        />
      </main>

      <StoreFooter
        store={store}
        innerRef={footerRef}
        onWhatsApp={handleWhatsApp}
        onSelectChannel={handleSelectChannel}
      />

      <StoreActions
        store={store}
        visible={actionBarVisible}
        onWhatsApp={handleWhatsApp}
        onSelectChannel={handleSelectChannel}
        onShareStore={handleShareStore}
      />

      <Toast
        toast={actionError ? { type: 'error', message: actionError } : null}
        onClose={dismissActionError}
      />

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

export default StoreLandingPage
