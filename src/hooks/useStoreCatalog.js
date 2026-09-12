import { useEffect, useState } from 'react'
import { getStore } from '../services/storeService'
import { listPublicProducts } from '../services/productService'
import { listCategories } from '../services/categoryService'

/**
 * Load the public store, its published catalog and the store category data
 * (for the two-level customer category filter: Kategori Utama -> Sub Kategori)
 * for a store ID. Handles loading / ready / notFound / error states so the
 * page can render dedicated states instead of assuming data is always present.
 * @param {string} storeId
 */
export function useStoreCatalog(storeId) {
  const [state, setState] = useState({
    status: 'loading',
    store: null,
    products: [],
    categories: [],
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', store: null, products: [], categories: [], error: '' })
      try {
        const [store, products, categories] = await Promise.all([
          getStore(storeId),
          listPublicProducts(storeId),
          listCategories().catch(() => []),
        ])
        if (!active) {
          return
        }
        if (!store) {
          setState({ status: 'notFound', store: null, products: [], categories: [], error: '' })
          return
        }
        setState({ status: 'ready', store, products, categories, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          store: null,
          products: [],
          categories: [],
          error: error instanceof Error ? error.message : 'Gagal memuat toko. Silakan coba lagi.',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [storeId, reloadKey])

  return { ...state, reload: () => setReloadKey((value) => value + 1) }
}