import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { buildStoreUrl } from '../../utils/storefrontUrl'
import { storeLocationLabel } from '../../utils/storeLocation'
import CustomerProfileMenu from './CustomerProfileMenu'

/**
 * Storefront navbar: store logo + name + City/Province on the left; account
 * controls on the right. Full address is NOT part of the navbar (it is only
 * used in the footer), and WhatsApp/marketplace actions live in the page
 * content/actions area. Guest sees Masuk/Daftar; logged-in customers see the
 * generic user-circle profile menu. returnPath lets pages (e.g. Product
 * Detail) keep the guest on the current page after login; it defaults to the
 * Store Landing URL.
 *
 * `onShareMobile` makes the navbar render a mobile-only Share button near the
 * account controls (used by Store Landing, where Share is not part of the
 * mobile floating action bar).
 *
 * @param {{
 *   store: import('../../data/models.js').Store,
 *   returnPath?: string,
 *   onShareMobile?: () => void,
 * }} props
 */
function StoreNavbar({ store, returnPath, onShareMobile }) {
  const { user } = useAuth()
  const returnUrl = returnPath ?? buildStoreUrl(store.storeId)
  const location = storeLocationLabel(store)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-outline-variant/30 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between gap-3 px-4 md:px-6">
        <Link
          to={buildStoreUrl(store.storeId)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={`Logo ${store.name}`}
              className="h-9 w-9 shrink-0 rounded-lg object-cover shadow-sm"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-on-primary shadow-sm">
              {(store.name ?? 'K').trim().charAt(0).toUpperCase()}
            </span>
          )}
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold leading-tight text-on-surface md:text-base">
              {store.name}
            </span>
            {location !== '-' ? (
              <span className="truncate text-[11px] leading-tight text-on-surface-variant">
                {location}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
          {onShareMobile ? (
            <button
              type="button"
              onClick={onShareMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary md:hidden"
              aria-label="Bagikan toko"
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                share
              </span>
            </button>
          ) : null}

          {user ? (
            <CustomerProfileMenu />
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
