import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProductDetail } from '../hooks/useProductDetail'
import { useAuth } from '../hooks/useAuth'
import { INTEREST_TYPE } from '../constants/enums'
import { recordInterest } from '../services/customerInterestService'
import { consumePendingAction, setPendingAction } from '../utils/pendingAction'
import StoreNavbar from '../components/storefront/StoreNavbar'
import StoreFooter from '../components/storefront/StoreFooter'
import ProductGallery from '../components/storefront/ProductGallery'
import ProductInfo from '../components/storefront/ProductInfo'
import ProductDetailsSection from '../components/storefront/ProductDetailsSection'
import ProductDescription from '../components/storefront/ProductDescription'
import ProductDetailSkeleton from '../components/storefront/ProductDetailSkeleton'
import ShareSheet from '../components/storefront/ShareSheet'
import EmptyState from '../components/shared/EmptyState'

/**
 * Public product detail for a store (/{storeId}/products/{productId}).
 * Route enforces store context. WhatsApp and Marketplace are the only actions
 * that record Customer Interest (product-scoped); guests are routed through
 * Login/Register first and the intended action auto-continues on return.
 * Product viewing and sharing are NOT tracked.
 */
function ProductDetailPage() {
  const { storeId, productId } = useParams()
  const navigate = useNavigate()
  const { user, authLoaded } = useAuth()
  const { status, store, product, error, reload } = useProductDetail(storeId, productId)
  const [shareTarget, setShareTarget] = useState(null)

  const returnPath = `/${storeId}/products/${productId}`

  function buildWhatsAppUrl() {
    return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
      `Halo ${store.name}, saya tertarik dengan produk ini: ${product.name}`,
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

  function guardGuest(action) {
    if (!user) {
      setPendingAction(returnPath, action)
      navigate(`/login?returnUrl=${encodeURIComponent(returnPath)}`)
      return true
    }
    return false
  }

  function handleWhatsApp() {
    if (guardGuest({ type: 'whatsapp' })) {
      return
    }
    recordAndOpen({
      storeId,
      customerName: user.name,
      customerId: user.id,
      productId: product.id,
      productName: product.name,
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
  }

  function handleSelectChannel(channel) {
    if (guardGuest({ type: 'marketplace', channel: channel.name, externalUrl: channel.url })) {
      return
    }
    recordAndOpen({
      storeId,
      customerName: user.name,
      customerId: user.id,
      productId: product.id,
      productName: product.name,
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: channel.name,
      externalUrl: channel.url,
    })
  }

  /**
   * After a guest completes login/register with a stored pending action for
   * this product path, auto-continue the WhatsApp/marketplace intent once.
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
        productId: product.id,
        productName: product.name,
        channelType: INTEREST_TYPE.WHATSAPP_CLICK,
        channel: 'WhatsApp',
      })
    } else if (action.type === 'marketplace') {
      recordAndOpen({
        storeId,
        customerName: user.name,
        customerId: user.id,
        productId: product.id,
        productName: product.name,
        channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
        channel: action.channel,
        externalUrl: action.externalUrl,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, authLoaded, user, returnPath])

  function handleShare() {
    if (!product) {
      return
    }
    const url = `${window.location.origin}${returnPath}`
    setShareTarget({
      title: 'Bagikan Produk',
      description: product.name,
      url,
      whatsappText: `Lihat produk ini di ${store.name}:\n\n${product.name}\n${url}`,
    })
  }

  if (status === 'loading') {
    return <ProductDetailSkeleton />
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

  if (status === 'productNotFound') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface px-6">
        <EmptyState
          icon="search_off"
          title="Produk tidak ditemukan"
          description="Produk yang Anda cari tidak tersedia atau sudah tidak aktif."
          action={
            <Link
              to={`/${storeId}`}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700"
            >
              Kembali ke Toko
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
          title="Gagal memuat produk"
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
      <StoreNavbar store={store} returnPath={returnPath} />

      <main className="mx-auto w-full max-w-[1140px] px-4 pt-16 md:px-6">
        <div className="pt-5 sm:pt-7">
          <Link
            to={`/${store.storeId}`}
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

          <div className="mt-5 grid w-full grid-cols-1 items-start gap-6 lg:mt-5 lg:grid-cols-2 lg:items-stretch lg:gap-10 lg:overflow-hidden lg:h-[calc(100svh-8rem)]">
            <div className="min-w-0 lg:h-full lg:overflow-hidden">
              <ProductGallery product={product} storeName={store.name} />
            </div>

            <div className="flex min-w-0 flex-col gap-5 sm:gap-6 lg:h-full lg:min-h-0 lg:gap-0 lg:overflow-y-auto lg:overflow-x-hidden lg:pb-8 lg:pr-1">
              <ProductInfo
                product={product}
                store={store}
                onWhatsApp={handleWhatsApp}
                onSelectChannel={handleSelectChannel}
                onShare={handleShare}
              />
              <div className="lg:pt-6">
                <ProductDetailsSection product={product} />
              </div>
              <div className="lg:pt-6">
                <ProductDescription description={product.description} />
              </div>
            </div>
          </div>
        </div>
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

export default ProductDetailPage