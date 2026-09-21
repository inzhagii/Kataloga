import { describe, expect, it } from 'vitest'
import {
  SELLER_BOTTOM_NAV_ITEMS,
  SELLER_MORE_ITEMS,
  SELLER_SIDEBAR_ITEMS,
} from '../sellerNav'

describe('seller sidebar items', () => {
  it('lists the locked feature order with Categories last', () => {
    expect(SELLER_SIDEBAR_ITEMS.map((item) => item.label)).toEqual([
      'Dashboard',
      'Products',
      'Customer Interest',
      'Recent Activity',
      'My Store',
      'Categories',
    ])
  })

  it('includes Recent Activity and links it to /seller/activities', () => {
    expect(SELLER_SIDEBAR_ITEMS.some((item) => item.to === '/seller/activities')).toBe(true)
  })

  it('never exposes Archive', () => {
    expect(SELLER_SIDEBAR_ITEMS.some((item) => item.to.includes('archived'))).toBe(false)
  })
})

describe('seller bottom navigation items', () => {
  it('has exactly the three primary features', () => {
    expect(SELLER_BOTTOM_NAV_ITEMS.map((item) => item.label)).toEqual([
      'Dashboard',
      'Products',
      'Customer Interest',
    ])
  })

  it('excludes Recent Activity, My Store and Categories', () => {
    const labels = SELLER_BOTTOM_NAV_ITEMS.map((item) => item.label)
    expect(labels).not.toContain('Recent Activity')
    expect(labels).not.toContain('My Store')
    expect(labels).not.toContain('Categories')
  })
})

describe('seller more items', () => {
  it('lists the locked order before Logout', () => {
    expect(SELLER_MORE_ITEMS.map((item) => item.label)).toEqual([
      'Recent Activity',
      'My Store',
      'Categories',
      'Profile',
    ])
  })

  it('never exposes Archive', () => {
    expect(SELLER_MORE_ITEMS.some((item) => item.to.includes('archived'))).toBe(false)
  })
})
