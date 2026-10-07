import { useEffect, useState } from 'react'
import { listRecentActivities } from '../../../services/activityService'

/**
 * Load the seller/store Recent Activity list for the /seller/activities page.
 * Returns the full, unfiltered list plus loading/error status; filtering is a
 * UI concern handled by the page. `activities` is always an array so callers
 * can rely on `.length` while loading or on error.
 */
export function useRecentActivities() {
  const [state, setState] = useState({ status: 'loading', activities: [], error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    listRecentActivities()
      .then((value) => {
        if (active) {
          setState({ status: 'ready', activities: value, error: '' })
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            status: 'error',
            activities: [],
            error:
              error instanceof Error ? error.message : 'Gagal memuat aktivitas. Silakan coba lagi.',
          })
        }
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  return {
    status: state.status,
    activities: state.activities,
    error: state.error,
    reload: () => setReloadKey((value) => value + 1),
  }
}
