/**
 * Mock brand data for development.
 *
 * Brands are store-scoped (one store owns its own brand list). Products join a
 * brand by NAME through `product.brand` (same name-keyed convention as
 * `product.category`), so every brand here matches the `brand` value used by
 * the demo products of `toko-komputer-jaya`.
 */

/** @type {import('../models.js').Brand[]} */
export const brands = [
  { id: 1, name: 'Asus', storeId: 'toko-komputer-jaya' },
  { id: 2, name: 'Lenovo', storeId: 'toko-komputer-jaya' },
  { id: 3, name: 'HP', storeId: 'toko-komputer-jaya' },
  { id: 4, name: 'Apple', storeId: 'toko-komputer-jaya' },
  { id: 5, name: 'Samsung', storeId: 'toko-komputer-jaya' },
  { id: 6, name: 'Logitech', storeId: 'toko-komputer-jaya' },
  { id: 7, name: 'Intel', storeId: 'toko-komputer-jaya' },
  { id: 8, name: 'AMD', storeId: 'toko-komputer-jaya' },
  { id: 9, name: 'Corsair', storeId: 'toko-komputer-jaya' },
  { id: 10, name: 'Kingston', storeId: 'toko-komputer-jaya' },
  { id: 11, name: 'TP-Link', storeId: 'toko-komputer-jaya' },
]
