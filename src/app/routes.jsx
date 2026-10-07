import RequireAuth from './RequireAuth'
import SellerEntryGate from './SellerEntryGate'
import PublicLayout from '../features/marketing/layouts/PublicLayout'
import StoreLayout from '../features/storefront/layouts/StoreLayout'
import SellerLayout from '../layouts/SellerLayout'
import MarketingLandingPage from '../features/marketing/pages/MarketingLandingPage'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import CreateStorePage from '../features/auth/pages/CreateStorePage'
import StoreLandingPage from '../features/storefront/pages/StoreLandingPage'
import ProductListingPage from '../features/storefront/pages/ProductListingPage'
import ProductDetailPage from '../features/storefront/pages/ProductDetailPage'
import ProductDetailRedirect from '../features/storefront/pages/ProductDetailRedirect'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ProductsPage from '../features/products/pages/ProductsPage'
import AddProductPage from '../features/products/pages/AddProductPage'
import EditProductPage from '../features/products/pages/EditProductPage'
import ArchivedProductsPage from '../features/products/pages/ArchivedProductsPage'
import CategoriesPage from '../features/categories/pages/CategoriesPage'
import CustomerInterestPage from '../features/customer-interest/pages/CustomerInterestPage'
import MyStorePage from '../features/store/pages/MyStorePage'
import AccountPage from '../features/account/pages/AccountPage'
import RecentActivitiesPage from '../features/activities/pages/RecentActivitiesPage'
import NotFoundPage from '../pages/NotFoundPage'

export const routes = [
  {
    element: <PublicLayout />,
    children: [{ path: '/', element: <MarketingLandingPage /> }],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/create-store', element: <CreateStorePage /> },
      { path: '/seller', element: <SellerEntryGate /> },
      {
        element: <SellerLayout />,
        children: [
          { path: '/seller/dashboard', element: <DashboardPage /> },
          { path: '/seller/products', element: <ProductsPage /> },
          { path: '/seller/products/new', element: <AddProductPage /> },
          { path: '/seller/products/:productId/edit', element: <EditProductPage /> },
          { path: '/seller/products/archived', element: <ArchivedProductsPage /> },
          { path: '/seller/categories', element: <CategoriesPage /> },
          { path: '/seller/customer-interest', element: <CustomerInterestPage /> },
          { path: '/seller/my-store', element: <MyStorePage /> },
          { path: '/seller/account', element: <AccountPage /> },
          { path: '/seller/activities', element: <RecentActivitiesPage /> },
        ],
      },
    ],
  },
  {
    element: <StoreLayout />,
    children: [
      { path: '/:storeId', element: <StoreLandingPage /> },
      { path: '/:storeId/products', element: <ProductListingPage /> },
      { path: '/:storeId/product/:productId/:slug', element: <ProductDetailPage /> },
      { path: '/:storeId/products/:productId', element: <ProductDetailRedirect /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]