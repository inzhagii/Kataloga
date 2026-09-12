/**
 * Mock category data for development.
 * Default categories are store-independent. Custom categories are scoped to a store.
 */

/** @type {import('../models.js').Category[]} */
export const categories = [
  { id: 1, name: 'Elektronik', parentId: null, custom: false },
  { id: 2, name: 'Laptop', parentId: 1, custom: false },
  { id: 3, name: 'Smartphone', parentId: 1, custom: false },
  { id: 4, name: 'Aksesoris', parentId: 1, custom: false },
  { id: 5, name: 'Fashion', parentId: null, custom: false },
  { id: 6, name: 'Pakaian', parentId: 5, custom: false },
  { id: 7, name: 'Gaming', parentId: null, custom: true, storeId: 'toko-komputer-jaya' },
  { id: 8, name: 'Gadget Gaming', parentId: 7, custom: true, storeId: 'toko-komputer-jaya' },
]