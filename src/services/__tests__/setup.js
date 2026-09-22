/**
 * Shared test setup for Phase 11 business-logic suites.
 *
 * The mock services mutate in-memory arrays exported from src/data/mock, so
 * every test restores those arrays to their pristine seed and resets the
 * session before installing Store A / Store B fixtures. This keeps tests
 * order-independent.
 */

import {
  brands,
  categories,
  customerInterests,
  products,
  recentActivities,
  stores,
  users,
} from '../../data/mock'
import { CUSTOM_CHANNEL_LOGO } from '../../data/mock/channels'
import { resetAuthFlowState, setActiveUser } from '../authService'
import { setAccessToken, setMockLatency } from '../apiClient'

export const STORE_A_ID = 'toko-komputer-jaya'
export const STORE_B_ID = 'toko-agung-fashion'

const seed = {
  products: structuredClone(products),
  stores: structuredClone(stores),
  categories: structuredClone(categories),
  brands: structuredClone(brands),
  customerInterests: structuredClone(customerInterests),
  recentActivities: structuredClone(recentActivities),
  users: structuredClone(users),
}

function restore(key, array) {
  array.splice(0, array.length, ...seed[key].map((item) => structuredClone(item)))
}

export function resetDatabase() {
  setMockLatency(0)
  setActiveUser(null)
  setAccessToken(null)
  resetAuthFlowState()
  restore('products', products)
  restore('stores', stores)
  restore('categories', categories)
  restore('brands', brands)
  restore('customerInterests', customerInterests)
  restore('recentActivities', recentActivities)
  restore('users', users)
}

export const storeB = {
  storeId: STORE_B_ID,
  name: 'Toko Agung Fashion',
  description: 'Pakaian dan aksesoris fashion.',
  city: 'Bandung',
  operatingHours: 'Senin - Minggu, 08.00 - 20.00',
  whatsapp: '6289876543210',
  channels: [{ channelId: 'CUSTOM:INSTAGRAM', url: 'https://instagram.com/toko-agung-fashion' }],
  customChannels: [
    {
      id: 'CUSTOM:INSTAGRAM',
      storeId: STORE_B_ID,
      name: 'Instagram',
      logo: CUSTOM_CHANNEL_LOGO,
      custom: true,
    },
  ],
  ctaOptions: [
    { type: 'BUY', label: 'Beli' },
    { type: 'BARGAIN', label: 'Tawar' },
    { type: 'CUSTOM', label: 'Tanya Harga' },
  ],
  verified: false,
  announcement: {
    title: 'Pengumuman Toko Agung',
    message: 'Stok baru setiap minggu.',
    isEnabled: false,
  },
  autoArchiveDays: 60,
  createdAt: '2026-07-01T00:00:00.000Z',
}

export const ownerB = {
  id: 2,
  email: 'agung@kataloga.test',
  phone: '081298765432',
  name: 'Agung Fashion',
  hasStore: true,
  storeId: STORE_B_ID,
}

export const newSeller = {
  id: 3,
  email: 'fresh@kataloga.test',
  phone: '081298765433',
  name: 'Fresh Seller',
  hasStore: false,
  storeId: null,
}

export function mkProduct(overrides = {}) {
  return {
    id: 0,
    storeId: STORE_B_ID,
    name: 'Kaos Polos Premium',
    images: ['https://example.com/b.jpg'],
    mainImage: 'https://example.com/b.jpg',
    category: 'Pakaian',
    brand: '',
    condition: 'NEW',
    price: 'Rp 150.000',
    priceValue: 150000,
    details: [{ label: 'Bahan', value: 'Katun' }],
    description: 'Produk fashion terbaru.',
    externalLinks: [],
    cta: { type: 'BUY', label: 'Beli' },
    status: 'DRAFT',
    featured: false,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

export const productsB = [
  mkProduct({
    id: 100,
    name: 'Kaos Polos Premium',
    category: 'Pakaian',
    condition: 'NEW',
    price: 'Rp 150.000',
    priceValue: 150000,
    status: 'PUBLISHED',
  }),
  mkProduct({
    id: 101,
    name: 'Jaket Denim Vintage',
    category: 'Pakaian',
    condition: 'SECOND',
    price: 'Rp 250.000',
    priceValue: 250000,
    status: 'SOLD_OUT',
  }),
  mkProduct({
    id: 102,
    name: 'Celana Chino Slim',
    category: 'Pakaian',
    condition: 'NEW',
    price: 'Rp 200.000',
    priceValue: 200000,
    status: 'ARCHIVED',
  }),
]

export const customCategoryB = {
  id: 100,
  name: 'Fashion Branded',
  parentId: null,
  custom: true,
  storeId: STORE_B_ID,
}

export const brandB = {
  id: 100,
  name: 'Zara',
  storeId: STORE_B_ID,
}

export const interestB = {
  id: 100,
  storeId: STORE_B_ID,
  customerName: 'Rina Wijaya',
  customerId: 7,
  productId: 100,
  productName: 'Kaos Polos Premium',
  channelType: 'MARKETPLACE_CLICK',
  channel: 'Instagram',
  externalUrl: 'https://instagram.com/toko-agung-fashion',
  date: '2026-09-05T08:00:00.000Z',
}

export function installFixtures() {
  users.push(structuredClone(ownerB), structuredClone(newSeller))
  stores.push(structuredClone(storeB))
  products.push(...productsB.map((item) => structuredClone(item)))
  categories.push(structuredClone(customCategoryB))
  brands.push(structuredClone(brandB))
  customerInterests.push(structuredClone(interestB))
  return users.find((user) => user.storeId === STORE_A_ID)
}

export function actAsStoreA() {
  setActiveUser(users.find((user) => user.storeId === STORE_A_ID))
}

export function actAsStoreB() {
  setActiveUser(users.find((user) => user.storeId === STORE_B_ID))
}

export function beforeEachScenario() {
  resetDatabase()
  return installFixtures()
}