import { useEffect, useMemo, useState } from 'react'
import { listCategories } from '../services/categoryService'
import { listSellerProducts } from '../services/productService'
import { buildCategoryTree, countProductsByCategory } from '../utils/categoryTree'

/**
 * Load categories + seller products for the Categories page.
 * Product counts are derived per category name so the hierarchy can show how
 * many products reference each category (parent totals = sum of children).
 */
export function useCategories() {
  const [state, setState] = useState({
    status: 'loading',
    categories: [],
    products: [],
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', categories: [], products: [], error: '' })
      try {
        const [categories, products] = await Promise.all([
          listCategories(),
          listSellerProducts(),
        ])
        if (!active) {
          return
        }
        setState({ status: 'ready', categories, products, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          categories: [],
          products: [],
          error: error instanceof Error ? error.message : 'Gagal memuat category. Silakan coba lagi.',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey])

  const tree = useMemo(
    () => buildCategoryTree(state.categories),
    [state.categories],
  )

  const productCounts = useMemo(
    () => countProductsByCategory(state.products),
    [state.products],
  )

  return {
    status: state.status,
    error: state.error,
    categories: state.categories,
    products: state.products,
    parents: tree.parents,
    childrenByParent: tree.childrenByParent,
    productCounts,
    reload: () => setReloadKey((value) => value + 1),
  }
}