import { describe, expect, it } from 'vitest'
import { NO_STORE_EXEMPT_PATHS, requiresStore } from '../sellerAccess'

describe('sellerAccess', () => {
  it('exempts Profile so a no-store account can manage its recovery email', () => {
    expect(requiresStore('/seller/account')).toBe(false)
  })

  it('still requires a store for the other seller routes', () => {
    const storeRequired = [
      '/seller/dashboard',
      '/seller/products',
      '/seller/products/new',
      '/seller/products/archived',
      '/seller/categories',
      '/seller/customer-interest',
      '/seller/my-store',
      '/seller/activities',
    ]
    for (const path of storeRequired) {
      expect(requiresStore(path), `expected ${path} to require a store`).toBe(true)
    }
  })

  it('keeps the exemption list limited to Profile', () => {
    expect(NO_STORE_EXEMPT_PATHS).toEqual(['/seller/account'])
  })
})
