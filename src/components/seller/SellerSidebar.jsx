import { NavLink, useNavigate } from 'react-router-dom'
import { SELLER_SIDEBAR_ITEMS } from '../../constants/sellerNav'
import { useAuth } from '../../hooks/useAuth'

/**
 * Get the initials for a store/user name (max 2 chars).
 * @param {string|null|undefined} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) {
    return '?'
  }
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/**
 * Desktop-only reusable seller sidebar. Single navigation used by every
 * seller page. Logout clears the authentication state (ROUTES: no /logout page).
 * @param {{ store: import('../../data/models.js').Store | null }} props
 */
function SellerSidebar({ store }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-svh w-sidebar-width flex-col justify-between border-r border-outline-variant bg-surface-container-lowest lg:flex">
      <div className="flex flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-outline-variant px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              auto_stories
            </span>
          </div>
          <span className="text-lg font-bold tracking-tight text-on-surface">Kataloga</span>
        </div>
        <nav aria-label="Menu utama seller" className="p-4">
          <ul className="flex flex-col gap-1.5 text-sm">
            {SELLER_SIDEBAR_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-primary-container/20 font-semibold text-primary'
                        : 'font-medium text-secondary hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-outline-variant p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-left text-sm font-medium text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            logout
          </span>
          <span>Logout</span>
        </button>
        <div className="mt-2 flex items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            {getInitials(store?.name)}
          </div>
          <p className="min-w-0 truncate text-xs font-semibold text-on-surface">{store?.name || '…'}</p>
        </div>
      </div>
    </aside>
  )
}

export default SellerSidebar