/**
 * Single source of truth for seller navigation items.
 * Desktop sidebar shows all items; mobile uses a 3-item bottom navigation
 * plus a More menu for the rest. Shared with the seller header dropdown.
 */

export const SELLER_SIDEBAR_ITEMS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: 'grid_view' },
  { to: '/seller/products', label: 'Products', icon: 'inventory_2' },
  { to: '/seller/categories', label: 'Categories', icon: 'category' },
  { to: '/seller/customer-interest', label: 'Customer Interest', icon: 'favorite_border' },
  { to: '/seller/my-store', label: 'My Store', icon: 'storefront' },
  { to: '/seller/account', label: 'Account', icon: 'person' },
]

const BOTTOM_NAV_PATHS = ['/seller/dashboard', '/seller/products', '/seller/customer-interest']

export const SELLER_BOTTOM_NAV_ITEMS = SELLER_SIDEBAR_ITEMS.filter(({ to }) =>
  BOTTOM_NAV_PATHS.includes(to),
)

export const SELLER_MORE_ITEMS = SELLER_SIDEBAR_ITEMS.filter(
  ({ to }) => to === '/seller/categories' || to === '/seller/my-store' || to === '/seller/account',
)