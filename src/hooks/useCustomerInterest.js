import { useEffect, useMemo, useState } from 'react'
import { getCurrentStoreId } from '../services/storeService'
import { listCustomerInterests } from '../services/customerInterestService'
import { listSellerProducts } from '../services/productService'
import { INTEREST_TYPE } from '../constants/enums'

/**
 * Load the store's customer interest records and the seller product list for
 * the Customer Interest page. Interests are always returned as an array (even
 * while loading or on error) so callers can rely on `interests.length` instead
 * of guarding undefined.
 *
 * The summary counts (total / WhatsApp / marketplace) are derived here — not in
 * the page — so every consumer reads the same numbers.
 */
export function useCustomerInterest() {
  const [state, setState] = useState({
    status: 'loading',
    interests: [],
    products: [],
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', interests: [], products: [], error: '' })
      try {
        const [interests, products] = await Promise.all([
          listCustomerInterests(getCurrentStoreId()),
          listSellerProducts(),
        ])
        if (!active) {
          return
        }
        setState({ status: 'ready', interests, products, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          interests: [],
          products: [],
          error:
            error instanceof Error ? error.message : 'Gagal memuat customer interest. Silakan coba lagi.',
        })
      }
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey])

  const productById = useMemo(() => {
    const map = new Map()
    state.products.forEach((product) => {
      map.set(product.id, product)
    })
    return map
  }, [state.products])

  const summary = useMemo(() => {
    const whatsappClicks = state.interests.filter(
      (interest) => interest.channelType === INTEREST_TYPE.WHATSAPP_CLICK,
    ).length
    return {
      totalInterest: state.interests.length,
      whatsappClicks,
      marketplaceClicks: state.interests.length - whatsappClicks,
    }
  }, [state.interests])

  return {
    status: state.status,
    error: state.error,
    interests: state.interests,
    summary,
    productById,
    reload: () => setReloadKey((value) => value + 1),
  }
}