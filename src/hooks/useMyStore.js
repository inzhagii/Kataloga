import { useEffect, useState } from 'react'
import { getMyStore } from '../services/storeService'

/**
 * Load the current seller store for the My Store page.
 * Handles loading / ready / error so the page never assumes data is present.
 */
export function useMyStore() {
  const [state, setState] = useState({
    status: 'loading',
    store: null,
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', store: null, error: '' })
      try {
        const store = await getMyStore()
        if (!active) {
          return
        }
        if (!store) {
          setState({ status: 'error', store: null, error: 'Store tidak ditemukan.' })
          return
        }
        setState({ status: 'ready', store, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          store: null,
          error:
            error instanceof Error ? error.message : 'Gagal memuat informasi toko. Silakan coba lagi.',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey])

  return { ...state, reload: () => setReloadKey((value) => value + 1) }
}