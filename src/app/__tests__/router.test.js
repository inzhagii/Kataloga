import { describe, expect, it } from 'vitest'
import { routes } from '../routes'

function collectRoutes(config) {
  const list = []
  for (const route of config) {
    list.push(route)
    if (route.children) {
      list.push(...collectRoutes(route.children))
    }
  }
  return list
}

function findByPath(path) {
  return collectRoutes(routes).find((route) => route.path === path)
}

describe('storefront routes', () => {
  it('registers the canonical product detail route', () => {
    const route = findByPath('/:storeId/product/:productId/:slug')
    expect(route).toBeDefined()
    expect(route.element.type.name).toBe('ProductDetailPage')
  })

  it('registers the storefront product listing route', () => {
    const route = findByPath('/:storeId/products')
    expect(route).toBeDefined()
    expect(route.element.type.name).toBe('ProductListingPage')
  })

  it('redirects the legacy product detail route to the canonical route', () => {
    const route = findByPath('/:storeId/products/:productId')
    expect(route).toBeDefined()
    expect(route.element.type.name).toBe('ProductDetailRedirect')
  })

  it('keeps the store landing route intact', () => {
    const route = findByPath('/:storeId')
    expect(route).toBeDefined()
    expect(route.element.type.name).toBe('StoreLandingPage')
  })
})

describe('authorization and seller routes', () => {
  it('keeps auth, create-store and seller routes intact', () => {
    const expected = [
      '/login',
      '/register',
      '/verify-email',
      '/forgot-password',
      '/reset-password',
      '/create-store',
      '/seller',
      '/seller/dashboard',
      '/seller/products',
      '/seller/products/new',
      '/seller/products/:productId/edit',
      '/seller/products/archived',
      '/seller/categories',
      '/seller/customer-interest',
      '/seller/my-store',
      '/seller/account',
      '/seller/activities',
    ]
    for (const path of expected) {
      expect(findByPath(path), `missing route ${path}`).toBeDefined()
    }
  })

  it('registers the /seller entry gateway route', () => {
    const route = findByPath('/seller')
    expect(route).toBeDefined()
    expect(route.element.type.name).toBe('SellerEntryGate')
  })
})