import { createBrowserRouter } from 'react-router-dom'
import RequireAuth from './RequireAuth'
import PublicLayout from '../layouts/PublicLayout'
import StoreLayout from '../layouts/StoreLayout'
import SellerLayout from '../layouts/SellerLayout'
import MarketingLandingPage from '../pages/MarketingLandingPage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import CreateStorePage from '../pages/auth/CreateStorePage'
import StoreLandingPage from '../pages/StoreLandingPage'
import ProductDetailPage from '../pages/ProductDetailPage'
import DashboardPage from '../pages/seller/DashboardPage'
import ProductsPage from '../pages/seller/ProductsPage'
import AddProductPage from '../pages/seller/AddProductPage'
import EditProductPage from '../pages/seller/EditProductPage'
import ArchivedProductsPage from '../pages/seller/ArchivedProductsPage'
import CategoriesPage from '../pages/seller/CategoriesPage'
import CustomerInterestPage from '../pages/seller/CustomerInterestPage'
import MyStorePage from '../pages/seller/MyStorePage'
import AccountPage from '../pages/seller/AccountPage'
import NotFoundPage from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: '/', element: <MarketingLandingPage /> }],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/create-store', element: <CreateStorePage /> },
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
        ],
      },
    ],
  },
  {
    element: <StoreLayout />,
    children: [
      { path: '/:storeId', element: <StoreLandingPage /> },
      { path: '/:storeId/products/:productId', element: <ProductDetailPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])