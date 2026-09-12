import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * Storefront navbar: store logo + name on the left; guest sees Masuk/Daftar,
 * logged-in customers see a generic user-circle icon (no uploaded photo).
 * returnPath lets pages (e.g. Product Detail) keep the guest on the current
 * page after login; it defaults to the Store Landing URL.
 */
function StoreNavbar({ store, returnPath }) {
  const { user } = useAuth()
  const returnUrl = returnPath ?? `/${store.storeId}`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 w-full border-b border-outline-variant/30 bg-surface/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[1140px] items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-on-primary shadow-sm">
              {(store.name ?? 'K').trim().charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-sm font-semibold text-on-surface md:text-base">
              {store.name}
            </span>
          </div>
          {store.fullAddress ? (
            <span className="flex min-w-0 items-center gap-1 text-[11px] text-secondary">
              <span
                className="material-symbols-outlined shrink-0 text-[13px]"
                aria-hidden="true"
              >
                location_on
              </span>
              <span className="truncate">{store.fullAddress}</span>
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
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