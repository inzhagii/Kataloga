import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useClickOutside } from '../../hooks/useClickOutside'

/**
 * Customer account menu shown in the storefront navbar when a user is logged
 * in. Uses the generic user-circle icon (customers have no uploaded photo on
 * V1). Menu items reuse existing destinations: Lihat Profil -> the existing
 * Profile page, Kelola Toko -> the seller Dashboard (or Buat Toko -> the
 * marketing landing when the user has no store yet), and Logout.
 */
function CustomerProfileMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  useClickOutside(containerRef, () => setOpen(false), open)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!user) {
    return null
  }

  const storeItem = user.hasStore
    ? { label: 'Kelola Toko', icon: 'storefront', to: '/seller/dashboard' }
    : { label: 'Buat Toko', icon: 'add_business', to: '/' }

  const itemClass =
    'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-on-surface transition-colors hover:bg-surface-container'
  const itemIconClass = 'material-symbols-outlined text-[18px] text-secondary'

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary"
        aria-label="Menu profil"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
          account_circle
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Menu profil"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-52 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-1.5 shadow-lg"
        >
          <Link
            to="/seller/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <span className={itemIconClass} aria-hidden="true">
              person
            </span>
            Lihat Profil
          </Link>
          <Link
            to={storeItem.to}
            role="menuitem"
            onClick={() => setOpen(false)}
            className={itemClass}
          >
            <span className={itemIconClass} aria-hidden="true">
              {storeItem.icon}
            </span>
            {storeItem.label}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logout()
            }}
            className={itemClass}
          >
            <span className={itemIconClass} aria-hidden="true">
              logout
            </span>
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default CustomerProfileMenu
