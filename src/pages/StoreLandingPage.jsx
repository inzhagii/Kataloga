import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStoreCatalog } from '../hooks/useStoreCatalog'
import { useAuth } from '../hooks/useAuth'
import { INTEREST_TYPE } from '../constants/enums'
import { recordInterest } from '../services/customerInterestService'
import { consumePendingAction, setPendingAction } from '../utils/pendingAction'
import StoreNavbar from '../components/storefront/StoreNavbar'
import StoreHeader from '../components/storefront/StoreHeader'
import AnnouncementBanner from '../components/storefront/AnnouncementBanner'
import FeaturedProducts from '../components/storefront/FeaturedProducts'
import CatalogSection from '../components/storefront/CatalogSection'
import StoreFooter from '../components/storefront/StoreFooter'
import ShareSheet from '../components/storefront/ShareSheet'
import StoreLandingSkeleton from '../components/storefront/StoreLandingSkeleton'
import EmptyState from '../components/shared/EmptyState'

/**
 * Public storefront for a seller store (/{storeId}). Catalog (search /
 * filter / sort), featured products, announcement and the WhatsApp /
 * Marketplace / Share actions. WhatsApp and Marketplace clicks are the only
 * actions that record Customer Interest; guests are routed through Login
 * first and the action auto-continues after they return.
 */
function StoreLandingPage() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const { user, authLoaded } = useAuth()
  const { status, store, products, categories, error, reload } = useStoreCatalog(storeId)
  const [shareTarget, setShareTarget] = useState(null)

  const returnPath = `/${storeId}`

  function buildWhatsAppUrl() {
    return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
      `Halo ${store.name}, saya tertarik dengan katalog produk Anda.`,
    )}`
  }

  function recordAndOpen(action) {
    recordInterest(action)
      .catch(() => {})
      .finally(() => {
        if (action.channelType === INTEREST_TYPE.WHATSAPP_CLICK) {
          window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer')
        } else {
          window.open(action.externalUrl, '_blank', 'noopener,noreferrer')
        }
      })
  }

  function handleWhatsApp() {
    if (!user) {
      setPendingAction(returnPath, { type: 'whatsapp' })
      navigate(`/login?returnUrl=${encodeURIComponent(returnPath)}`)
      return
    }
    recordAndOpen({
      storeId,
      customerName: user.name,
      customerId: user.id,
      productId: null,
      productName: null,
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
  }

  function handleSelectChannel(channel) {
    if (!user) {
      setPendingAction(returnPath, {
        type: 'marketplace',
        channel: channel.name,
        externalUrl: channel.url,
      })
      navigate(`/login?returnUrl=${encodeURIComponent(returnPath)}`)
      return
    }
    recordAndOpen({
      storeId,
      customerName: user.name,
      customerId: user.id,
      productId: null,
      productName: null,
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: channel.name,
      externalUrl: channel.url,
    })
  }

  /**
   * After a guest completes login/register with a stored pending action,
   * auto-continue the WhatsApp/marketplace intent exactly once.
   */
  useEffect(() => {
    if (status !== 'ready' || !authLoaded || !user) {
      return
    }
    const action = consumePendingAction(returnPath)
    if (!action) {
      return
    }
    if (action.type === 'whatsapp') {
      recordAndOpen({
        storeId,
        customerName: user.name,
        customerId: user.id,
        productId: null,
        productName: null,
        channelType: INTEREST_TYPE.WHATSAPP_CLICK,
        channel: 'WhatsApp',
      })
    } else if (action.type === 'marketplace') {
      recordAndOpen({
        storeId,
        customerName: user.name,
        customerId: user.id,
        productId: null,
        productName: null,
        channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
        channel: action.channel,
        externalUrl: action.externalUrl,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, authLoaded, user, returnPath])

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
    const url = `${window.location.origin}${returnPath}/products/${product.id}`
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
        <StoreHeader
          store={store}
          onWhatsApp={handleWhatsApp}
          onSelectChannel={handleSelectChannel}
          onShareStore={handleShareStore}
        />

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
        />
      </main>

      <StoreFooter
        store={store}
        onWhatsApp={handleWhatsApp}
        onSelectChannel={handleSelectChannel}
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