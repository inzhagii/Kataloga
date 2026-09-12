import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * Seller shell top header. Mobile shows the Kataloga brand; desktop shows the
 * current page title. The right side has an avatar dropdown with Account,
 * My Store and Logout only (the sidebar remains the primary navigation).
 * @param {{ title: string }} props
 */
function SellerHeader({ title }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-4 sm:px-6 lg:left-sidebar-width lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
            <span className="material-symbols-outlined text-[17px]" aria-hidden="true">
              auto_stories
            </span>
          </div>
          <span className="text-base font-bold tracking-tight text-on-surface">Kataloga</span>
        </div>
        <p className="hidden text-sm font-semibold text-on-surface lg:block">{title}</p>
      </div>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="flex items-center gap-3 rounded-lg p-1 transition-colors hover:bg-surface-container focus:outline-none focus:ring-2 focus:ring-primary"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Menu akun"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-outline-variant/60"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-secondary ring-2 ring-outline-variant/60">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                person
              </span>
            </div>
          )}
          <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
            expand_more
          </span>
        </button>

        {open ? (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1.5 shadow-lg"
            >
              <div className="border-b border-outline-variant/80 px-4 py-2.5">
                <p className="truncate text-sm font-semibold text-on-surface">{user?.name || '-'}</p>
                <p className="truncate text-xs text-secondary">{user?.email || user?.phone || ''}</p>
              </div>
              <Link
                to="/seller/account"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  person
                </span>
                <span>Account</span>
              </Link>
              <Link
                to="/seller/my-store"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  storefront
                </span>
                <span>My Store</span>
              </Link>
              <div className="my-1 border-t border-outline-variant/80" />
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-semibold text-error transition-colors hover:bg-error-container/40"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  logout
                </span>
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}

export default SellerHeader