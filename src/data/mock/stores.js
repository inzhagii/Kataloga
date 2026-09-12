/**
 * Mock store data for development.
 * Replaced by API responses once the backend is available.
 */

/** @type {import('../models.js').Store[]} */
export const stores = [
  {
    storeId: 'toko-komputer-jaya',
    name: 'Toko Komputer Jaya',
    logoUrl: undefined,
    description:
      'Menjual laptop, smartphone, dan aksesoris gadget dengan harga bersahabat sejak 2015.',
    city: 'Jakarta',
    operatingHours: 'Senin - Sabtu, 09.00 - 18.00',
    whatsapp: '6281234567890',
    channels: [
      { name: 'Shopee', url: 'https://shopee.co.id/toko-komputer-jaya' },
      { name: 'Tokopedia', url: 'https://www.tokopedia.com/toko-komputer-jaya' },
      { name: 'Website', url: 'https://www.toko-komputer-jaya.com' },
    ],
    verified: true,
    announcement: [
      'Gratis ongkir untuk area Jabodetabek.',
      'Pengiriman setiap hari pukul 16.00 WIB.',
    ],
    lastStoreIdChange: '2026-01-15T00:00:00.000Z',
    createdAt: '2025-06-01T00:00:00.000Z',
  },
]

export const mockStoreId = stores[0].storeId