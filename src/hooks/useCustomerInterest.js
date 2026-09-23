import { useEffect, useMemo, useState } from 'react'
import { getCurrentStoreId, getStore } from '../services/storeService'
import { listCustomerInterests } from '../services/customerInterestService'
import { listSellerProducts } from '../services/productService'
import { listCategories } from '../services/categoryService'
import { INTEREST_TYPE } from '../constants/enums'
import { CMS_CHANNELS } from '../data/mock/channels'
import { listStoreChannelDefinitions } from '../utils/channels'
import { buildChannelOptions } from '../utils/customerInterestChannels'
import { buildFilterOptions } from '../utils/customerInterestFilter'

/**
 * Load everything the Customer Interest page needs in one place:
 * the store's interest records, the seller product list, the current store
 * (configured external channels -> channel cards) and the store categories
 * (Kategori Utama -> Sub Kategori resolution for the category filter).
 *
 * Interests/products always return as arrays (even while loading or on error)
 * so callers can rely on `.length` without guarding undefined.
 */
export function useCustomerInterest() {
  const [state, setState] = useState({
    status: 'loading',
    interests: [],
    products: [],
    store: undefined,
    categories: [],
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      setState({
        status: 'loading',
        interests: [],
        products: [],
        store: undefined,
        categories: [],
        error: '',
      })
      try {
        const storeId = getCurrentStoreId()
        const [interests, products, store, categories] = await Promise.all([
          listCustomerInterests(storeId),
          listSellerProducts(),
          getStore(storeId),
          listCategories(),
        ])
        if (!active) {
          return
        }
        setState({ status: 'ready', interests, products, store, categories, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState({
          status: 'error',
          interests: [],
          products: [],
          store: undefined,
          categories: [],
          error:
            error instanceof Error
              ? error.message
              : 'Gagal memuat customer interest. Silakan coba lagi.',
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

  const channelDefinitions = useMemo(
    () => listStoreChannelDefinitions(state.store, CMS_CHANNELS),
    [state.store],
  )

  const channelOptions = useMemo(
    () =>
      buildChannelOptions({
        interests: state.interests,
        channels: state.store?.channels ?? [],
        definitions: channelDefinitions,
      }),
    [state.interests, state.store, channelDefinitions],
  )

  const filterOptions = useMemo(
    () =>
      buildFilterOptions({
        interests: state.interests,
        productById,
        categories: state.categories,
      }),
    [state.interests, productById, state.categories],
  )

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
    store: state.store,
    categories: state.categories,
    summary,
    productById,
    channelOptions,
    channelDefinitions,
    filterOptions,
    reload: () => setReloadKey((value) => value + 1),
  }
}