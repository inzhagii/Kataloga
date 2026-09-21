/**
 * Single source of truth for seller navigation items.
 * Desktop sidebar shows all items in the locked order (Categories third, right
 * after Products; Profile/Account via the Account Card at the bottom).
 * Mobile uses a 3-item bottom navigation plus a More menu for the rest.
 * Shared with the seller header dropdown.
 *
 * Locked order (latest approved revisions): Dashboard, Products, Categories,
 * Customer Interest, Recent Activity, My Store. Archive is never a navigation
 * item.
 */

export const SELLER_SIDEBAR_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/seller/products', label: 'Products', icon: 'inventory_2' },
  { to: '/seller/categories', label: 'Categories', icon: 'category' },
  { to: '/seller/customer-interest', label: 'Customer Interest', icon: 'favorite_border' },
  { to: '/seller/activities', label: 'Recent Activity', icon: 'history' },
  { to: '/seller/my-store', label: 'My Store', icon: 'storefront' },
]

const BOTTOM_NAV_PATHS = ['/seller/dashboard', '/seller/products', '/seller/customer-interest']

/** Primary mobile items: exactly Dashboard, Products and Customer Interest. */
export const SELLER_BOTTOM_NAV_ITEMS = SELLER_SIDEBAR_ITEMS.filter(({ to }) =>
  BOTTOM_NAV_PATHS.includes(to),
)

/** Items shown in the mobile More sheet, before Logout. */
export const SELLER_MORE_ITEMS = [
  { to: '/seller/activities', label: 'Recent Activity', icon: 'history' },
  { to: '/seller/my-store', label: 'My Store', icon: 'storefront' },
  { to: '/seller/categories', label: 'Categories', icon: 'category' },
  { to: '/seller/account', label: 'Profile', icon: 'person' },
]
