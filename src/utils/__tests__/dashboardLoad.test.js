import { describe, expect, it } from 'vitest'
import { deriveDashboardState } from '../dashboardLoad'
import { PRODUCT_STATUS } from '../../constants/enums'

function fulfilled(value) {
  return { status: 'fulfilled', value }
}

function rejected(message) {
  return { status: 'rejected', reason: new Error(message) }
}

const product = (id, status) => ({ id, status, name: `P${id}` })

describe('deriveDashboardState', () => {
  it('is ready with every source fulfilled', () => {
    const state = deriveDashboardState({
      store: fulfilled({ name: 'Toko' }),
      products: fulfilled([
        product(1, PRODUCT_STATUS.PUBLISHED),
        product(2, PRODUCT_STATUS.DRAFT),
        product(3, PRODUCT_STATUS.SOLD_OUT),
      ]),
      archivedProducts: fulfilled([product(4, PRODUCT_STATUS.ARCHIVED)]),
      interests: fulfilled([{ id: 1 }]),
      activities: fulfilled([{ id: 1 }]),
    })

    expect(state.status).toBe('ready')
    expect(state.error).toBe('')
    expect(state.activeProducts.map((item) => item.id)).toEqual([1])
    expect(state.draftProducts.map((item) => item.id)).toEqual([2])
    expect(state.soldOutProducts.map((item) => item.id)).toEqual([3])
    expect(state.archivedProducts).toHaveLength(1)
    expect(state.interests).toHaveLength(1)
    expect(state.activities).toHaveLength(1)
    expect(state.errors).toEqual({
      store: '',
      products: '',
      archived: '',
      interests: '',
      activities: '',
    })
  })

  it('stays ready and isolates a single failing source', () => {
    const state = deriveDashboardState({
      store: fulfilled({ name: 'Toko' }),
      products: fulfilled([product(1, PRODUCT_STATUS.PUBLISHED)]),
      archivedProducts: fulfilled([]),
      interests: rejected('Interest service down'),
      activities: fulfilled([{ id: 9 }]),
    })

    expect(state.status).toBe('ready')
    expect(state.error).toBe('')
    expect(state.interests).toEqual([])
    expect(state.activeProducts.map((item) => item.id)).toEqual([1])
    expect(state.errors.interests).toBe('Interest service down')
    expect(state.errors.products).toBe('')
  })

  it('keeps catalog counts available when only archived products fail', () => {
    const state = deriveDashboardState({
      store: fulfilled({ name: 'Toko' }),
      products: fulfilled([product(1, PRODUCT_STATUS.PUBLISHED)]),
      archivedProducts: rejected('Archive down'),
      interests: fulfilled([]),
      activities: fulfilled([]),
    })

    expect(state.status).toBe('ready')
    expect(state.activeProducts.map((item) => item.id)).toEqual([1])
    expect(state.errors.archived).toBe('Archive down')
  })

  it('is error only when every source fails', () => {
    const state = deriveDashboardState({
      store: rejected('Store down'),
      products: rejected('Products down'),
      archivedProducts: rejected('Archive down'),
      interests: rejected('Interest down'),
      activities: rejected('Activity down'),
    })

    expect(state.status).toBe('error')
    expect(state.store).toBeNull()
    expect(state.error).toBe('Store down')
  })

  it('uses a generic message when no rejection carries an Error message', () => {
    const state = deriveDashboardState({
      store: { status: 'rejected', reason: 'nope' },
      products: { status: 'rejected', reason: 'nope' },
      archivedProducts: { status: 'rejected', reason: 'nope' },
      interests: { status: 'rejected', reason: 'nope' },
      activities: { status: 'rejected', reason: 'nope' },
    })

    expect(state.status).toBe('error')
    expect(state.error).toBe('Gagal memuat dashboard. Silakan coba lagi.')
  })
})
