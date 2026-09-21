import { useEffect, useMemo, useState } from 'react'
import { listBrands } from '../services/brandService'
import { listSellerProducts } from '../services/productService'
import { countProductsByBrand } from '../utils/brandUtil'

/**
 * Load brands + seller products for the Brand Management area.
 * Product usage counts are derived per brand name so each brand card can show
 * how many products reference it.
 */
export function useBrands() {
  const [state, setState] = useState({
    status: 'loading',
    brands: [],
    products: [],
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', brands: [], products: [], error: '' })
      try {
        const [brands, products] = await Promise.all([
          listBrands(),
          listSellerProducts(),
        ])
        if (!active) {
          return
        }
        setState({ status: 'ready', brands, products, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          brands: [],
          products: [],
          error:
            error instanceof Error
              ? error.message
              : 'Gagal memuat brand. Silakan coba lagi.',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey])

  const productCounts = useMemo(
    () => countProductsByBrand(state.products),
    [state.products],
  )

  return {
    status: state.status,
    error: state.error,
    brands: state.brands,
    products: state.products,
    productCounts,
    reload: () => setReloadKey((value) => value + 1),
  }
}
