/**
 * Mock user data for development.
 * Used by the auth stub until real authentication lands (Phase 3).
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
]

/**
 * Current authenticated user id used by the mock auth stub.
 * Empty string = guest (no one logged in).
 */
export const currentUserId = ''