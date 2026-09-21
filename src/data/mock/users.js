/**
 * Mock user data for development.
 * Used by the auth stub until real authentication lands (Phase 3).
 *
 * Two demo accounts:
 * 1. id 1 = Toko Komputer Jaya (store A, the historic default store).
 * 2. id 2 = demo@kataloga.test / Demo123!  →  TechSpace Bandung
 *    (a laptop/computer/accessories storefront that demonstrates a second,
 *     independent seller catalog in mock mode).
 */

/** @type {import('../models.js').User[]} */
export const users = [
  {
    id: 1,
    email: 'seller@kataloga.test',
    phone: '081234567890',
    name: 'Toko Komputer Jaya',
    hasStore: true,
    storeId: 'toko-komputer-jaya',
    avatarUrl: undefined,
  },
  {
    id: 2,
    email: 'demo@kataloga.test',
    phone: '081234567000',
    name: 'Steven Wijaya',
    hasStore: true,
    storeId: 'techspace-bandung',
    emailVerified: true,
    avatarUrl: undefined,
  },
]

/**
 * Current authenticated user id used by the mock auth stub.
 * Empty string = guest (no one logged in).
 */
export const currentUserId = ''