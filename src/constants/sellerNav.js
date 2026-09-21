/**
 * Single source of truth for seller navigation items.
 * Desktop sidebar shows all items in the locked order (Categories last, right
 * before the Account Card). Mobile uses a 3-item bottom navigation plus a More
 * menu for the rest. Shared with the seller header dropdown.
 *
 * Locked order (docs/IMPLEMENTATION-PLAN.md §M8): Dashboard, Products,
 * Customer Interest, Recent Activity, My Store, Categories. Archive is never a
 * navigation item.
 */

export const SELLER_SIDEBAR_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/seller/products', label: 'Products', icon: 'inventory_2' },
  { to: '/seller/customer-interest', label: 'Customer Interest', icon: 'favorite_border' },
  { to: '/seller/activities', label: 'Recent Activity', icon: 'history' },
  { to: '/seller/my-store', label: 'My Store', icon: 'storefront' },
  { to: '/seller/categories', label: 'Categories', icon: 'category' },
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
