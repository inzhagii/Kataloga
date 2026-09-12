import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import SellerSidebar from '../components/seller/SellerSidebar'
import SellerHeader from '../components/seller/SellerHeader'
import SellerBottomNav from '../components/seller/SellerBottomNav'
import { useAuth } from '../hooks/useAuth'
import { getMyStore } from '../services/storeService'

/**
 * Resolve the breadcrumb/page title for a seller route.
 * @param {string} pathname
 * @returns {string}
 */
function getSellerPageTitle(pathname) {
  if (pathname === '/seller/dashboard') {
    return 'Dashboard'
  }
  if (pathname === '/seller/products') {
    return 'Products'
  }
  if (pathname === '/seller/products/new') {
    return 'Add Product'
  }
  if (pathname === '/seller/products/archived') {
    return 'Archived Products'
  }
  if (pathname.startsWith('/seller/products/')) {
    return 'Edit Product'
  }
  if (pathname === '/seller/categories') {
    return 'Categories'
  }
  if (pathname === '/seller/customer-interest') {
    return 'Customer Interest'
  }
  if (pathname === '/seller/my-store') {
    return 'My Store'
  }
  if (pathname === '/seller/account') {
    return 'Profile'
  }
  if (pathname === '/seller/activities') {
    return 'Recent Activity'
  }
  return 'Seller'
}

/**
 * Authenticated seller application shell shared by every seller page.
 * Desktop: reusable SellerSidebar. Mobile: bottom navigation + More menu.
 * Accounts without a store are routed to the Create Store flow.
 */
function SellerLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [store, setStore] = useState(null)

  useEffect(() => {
    let active = true
    getMyStore().then((value) => {
      if (active) {
        setStore(value ?? null)
      }
    })
    return () => {
      active = false
    }
  }, [])

  if (user && !user.hasStore) {
    return <Navigate to="/create-store" replace />
  }

  return (
    <div className="min-h-svh bg-surface text-on-surface">
      <SellerSidebar store={store} />
      <div className="flex min-h-svh flex-col lg:pl-sidebar-width">
        <SellerHeader title={getSellerPageTitle(location.pathname)} />
        <main className="mx-auto w-full max-w-[80rem] flex-1 px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-12 lg:pt-24">
          <Outlet />
        </main>
      </div>
      <SellerBottomNav />
    </div>
  )
}

export default SellerLayout