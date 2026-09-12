import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import MarketplaceSelector from './MarketplaceSelector'
import WhatsAppIcon from '../ui/WhatsAppIcon'

/**
 * Storefront navbar: store logo + name on the left; contact (WhatsApp),
 * marketplace, address (compact, when set) and the account controls on the
 * right. Guest sees Masuk/Daftar; logged-in customers see a generic
 * user-circle icon (no uploaded photo). returnPath lets pages (e.g. Product
 * Detail) keep the guest on the current page after login; it defaults to the
 * Store Landing URL.
 *
 * @param {{
 *   store: import('../../data/models.js').Store,
 *   returnPath?: string,
 *   onWhatsApp?: () => void,
 *   onSelectChannel?: (channel: import('../../data/models.js').ExternalChannel) => void,
 * }} props
 */
function StoreNavbar({ store, returnPath, onWhatsApp, onSelectChannel }) {
  const { user } = useAuth()
  const returnUrl = returnPath ?? `/${store.storeId}`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-outline-variant/30 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-on-primary shadow-sm">
            {(store.name ?? 'K').trim().charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-sm font-semibold text-on-surface md:text-base">
            {store.name}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
          {store.fullAddress ? (
            <span
              className="hidden min-w-0 items-center gap-1.5 px-1 text-xs text-on-surface-variant lg:flex"
              title={store.fullAddress}
            >
              <span className="material-symbols-outlined shrink-0 text-[16px] text-secondary" aria-hidden="true">
                location_on
              </span>
              <span className="max-w-[10rem] truncate">{store.fullAddress}</span>
            </span>
          ) : null}

          <MarketplaceSelector store={store} onSelectChannel={onSelectChannel} compact />

          <button
            type="button"
            onClick={onWhatsApp}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-whatsapp px-2.5 py-1.5 text-xs font-semibold text-on-whatsapp shadow-sm transition-colors hover:brightness-95 sm:px-3"
            aria-label="Hubungi via WhatsApp"
          >
            <WhatsAppIcon size={15} />
            <span className="hidden whitespace-nowrap md:inline">WhatsApp</span>
          </button>

          {user ? (
            <span
              className="material-symbols-outlined text-[28px] text-on-surface-variant"
              aria-label="Akun"
              role="img"
              title="Akun"
            >
              account_circle
            </span>
          ) : (
            <>
              <Link
                to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container hover:text-primary sm:px-3.5 sm:py-2 sm:text-sm"
              >
                Masuk
              </Link>
              <Link
                to={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700 sm:px-4 sm:py-2 sm:text-sm"
              >
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default StoreNavbar