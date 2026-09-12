import { useEffect, useState } from 'react'
import { getMyStore, getCurrentStoreId } from '../services/storeService'
import { listSellerProducts, listArchivedProducts } from '../services/productService'
import { listCustomerInterests } from '../services/customerInterestService'
import { listRecentActivities } from '../services/activityService'
import { PRODUCT_STATUS } from '../constants/enums'

/**
 * Load all data needed by the seller Dashboard:
 * store, Published/Active products, draft products, sold-out products,
 * archived products, customer interest and recent activity. Handles
 * loading / ready / error states with a reload function for retrying.
 */
export function useSellerDashboard() {
  const [state, setState] = useState({
    status: 'loading',
    store: null,
    activeProducts: [],
    draftProducts: [],
    soldOutProducts: [],
    archivedProducts: [],
    interests: [],
    activities: [],
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({
        status: 'loading',
        store: null,
        activeProducts: [],
        draftProducts: [],
        soldOutProducts: [],
        archivedProducts: [],
        interests: [],
        activities: [],
        error: '',
      })
      try {
        const [store, products, archivedProducts, interests, activities] =
          await Promise.all([
            getMyStore(),
            listSellerProducts(),
            listArchivedProducts(),
            listCustomerInterests(getCurrentStoreId()),
            listRecentActivities(),
          ])
        if (!active) {
          return
        }
        setState({
          status: 'ready',
          store,
          activeProducts: products.filter(
            (product) => product.status === PRODUCT_STATUS.PUBLISHED,
          ),
          draftProducts: products.filter(
            (product) => product.status === PRODUCT_STATUS.DRAFT,
          ),
          soldOutProducts: products.filter(
            (product) => product.status === PRODUCT_STATUS.SOLD_OUT,
          ),
          archivedProducts,
          interests,
          activities,
          error: '',
        })
      } catch (error) {
        if (!active) {
          return
        }
        setState((current) => ({
          ...current,
          status: 'error',
          error:
            error instanceof Error ? error.message : 'Gagal memuat dashboard. Silakan coba lagi.',
        }))
      }
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey])

  return { ...state, reload: () => setReloadKey((value) => value + 1) }
}