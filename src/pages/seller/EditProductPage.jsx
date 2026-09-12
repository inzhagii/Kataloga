import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getSellerProduct } from '../../services/productService'
import ProductForm from '../../components/seller/products/ProductForm'
import EmptyState from '../../components/shared/EmptyState'
import Toast from '../../components/shared/Toast'
import { PRODUCT_STATUS } from '../../constants/enums'

/**
 * Edit Product: loads an existing product and renders the same ProductForm
 * (mode 'edit') with the data prefilled. Handles loading / not-found states.
 */
function EditProductPage() {
  const { productId } = useParams()
  const location = useLocation()

  const [state, setState] = useState({ status: 'loading', product: null, error: '' })
  const [toast, setToast] = useState(location.state?.feedback ?? null)

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', product: null, error: '' })
      try {
        const product = await getSellerProduct(Number(productId))
        if (!active) {
          return
        }
        if (!product) {
          setState({ status: 'error', product: null, error: 'Produk tidak ditemukan.' })
          return
        }
        if (product.status === PRODUCT_STATUS.ARCHIVED) {
          setState({ status: 'archived', product, error: '' })
          return
        }
        setState({ status: 'ready', product, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          product: null,
          error: error instanceof Error ? error.message : 'Gagal memuat produk.',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [productId])

  useEffect(() => {
    if (location.state?.feedback) {
      window.history.replaceState({}, '')
    }
    // Feedback is consumed once on mount via the lazy toast initializer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-surface-container-high/60" />
      </div>
    )
  }

  if (state.status === 'archived') {
    return (
      <EmptyState
        icon="archive"
        title="Produk diarsipkan"
        description="Produk yang diarsipkan tidak dapat diedit langsung. Restore ke draft terlebih dahulu untuk mengubah produk ini."
        action={
          <Link
            to="/seller/products/archived"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
          >
            Buka Archived Products
          </Link>
        }
      />
    )
  }

  if (state.status === 'error') {
    return (
      <EmptyState
        icon="error"
        title="Produk tidak ditemukan"
        description={state.error || 'Produk yang kamu cari tidak tersedia.'}
        action={
          <a
            href="/seller/products"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
          >
            Kembali ke Products
          </a>
        }
      />
    )
  }

  return (
    <>
      <ProductForm mode="edit" initialProduct={state.product} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}

export default EditProductPage