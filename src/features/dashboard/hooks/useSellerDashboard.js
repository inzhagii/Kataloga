import { useEffect, useState } from 'react'
import { getMyStore, getCurrentStoreId } from '../../../services/storeService'
import { listSellerProducts, listArchivedProducts } from '../../../services/productService'
import { listCustomerInterests } from '../../../services/customerInterestService'
import { listRecentActivities } from '../../../services/activityService'
import { deriveDashboardState } from '../../../utils/dashboardLoad'

/**
 * Load all data needed by the seller Dashboard:
 * store, Published/Active products, draft products, sold-out products,
 * archived products, customer interest and recent activity.
 *
 * Each source is independent, so every request is settled separately: one
 * failure must not blank the whole dashboard. The per-source `errors` slice
 * lets each widget render its own error state while the others stay usable;
 * the overall status is `error` only when every source fails.
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
    errors: {
      store: '',
      products: '',
      archived: '',
      interests: '',
      activities: '',
    },
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState((current) => ({ ...current, status: 'loading', error: '' }))
      const [store, products, archivedProducts, interests, activities] =
        await Promise.allSettled([
          getMyStore(),
          listSellerProducts(),
          listArchivedProducts(),
          listCustomerInterests(getCurrentStoreId()),
          listRecentActivities(),
        ])
      if (!active) {
        return
      }
      setState(
        deriveDashboardState({
          store,
          products,
          archivedProducts,
          interests,
          activities,
        }),
      )
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey])

  return { ...state, reload: () => setReloadKey((value) => value + 1) }
}
