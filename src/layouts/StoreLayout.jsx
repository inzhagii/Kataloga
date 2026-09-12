import { Outlet } from 'react-router-dom'

/**
 * Storefront layout used by Store Landing and Product Detail.
 * Will own the store/edit navbar (Phase 4).
 * Currently a bare wrapper to keep the route structure in place.
 */
function StoreLayout() {
  return (
    <div className="min-h-svh bg-surface">
      <Outlet />
    </div>
  )
}

export default StoreLayout