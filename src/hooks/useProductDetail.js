import { useEffect, useState } from 'react'
import { getStore } from '../services/storeService'
import { getProduct } from '../services/productService'
import { PRODUCT_STATUS } from '../constants/enums'

/**
 * Load the public store and a PUBLISHED product (or a SOLD_OUT product still
 * inside its store Auto Archive window) scoped to that store.
 * Handles loading / ready / storeNotFound / productNotFound / error states
 * so the page can render dedicated states instead of assuming data exists.
 * @param {string} storeId
 * @param {string|number} productId
 */
export function useProductDetail(storeId, productId) {
  const [state, setState] = useState({
    status: 'loading',
    store: null,
    product: null,
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', store: null, product: null, error: '' })
      try {
        const [store, product] = await Promise.all([
          getStore(storeId),
          getProduct(storeId, Number(productId)),
        ])
        if (!active) {
          return
        }
        if (!store) {
          setState({ status: 'storeNotFound', store: null, product: null, error: '' })
          return
        }
        if (
          !product ||
          (product.status !== PRODUCT_STATUS.PUBLISHED &&
            product.status !== PRODUCT_STATUS.SOLD_OUT)
        ) {
          setState({ status: 'productNotFound', store, product: null, error: '' })
          return
        }
        setState({ status: 'ready', store, product, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          store: null,
          product: null,
          error: error instanceof Error ? error.message : 'Gagal memuat produk. Silakan coba lagi.',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [storeId, productId, reloadKey])

  return { ...state, reload: () => setReloadKey((value) => value + 1) }
}