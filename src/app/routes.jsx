import RequireAuth from './RequireAuth'
import SellerEntryGate from './SellerEntryGate'
import PublicLayout from '../layouts/PublicLayout'
import StoreLayout from '../layouts/StoreLayout'
import SellerLayout from '../layouts/SellerLayout'
import MarketingLandingPage from '../pages/MarketingLandingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import VerifyEmailPage from '../pages/auth/VerifyEmailPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import CreateStorePage from '../pages/auth/CreateStorePage'
import StoreLandingPage from '../pages/StoreLandingPage'
import ProductListingPage from '../pages/ProductListingPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import ProductDetailRedirect from '../pages/ProductDetailRedirect'
import DashboardPage from '../pages/seller/DashboardPage'
import ProductsPage from '../pages/seller/ProductsPage'
import AddProductPage from '../pages/seller/AddProductPage'
import EditProductPage from '../pages/seller/EditProductPage'
import ArchivedProductsPage from '../pages/seller/ArchivedProductsPage'
import CategoriesPage from '../pages/seller/CategoriesPage'
import CustomerInterestPage from '../pages/seller/CustomerInterestPage'
import MyStorePage from '../pages/seller/MyStorePage'
import AccountPage from '../pages/seller/AccountPage'
import RecentActivitiesPage from '../pages/seller/RecentActivitiesPage'
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