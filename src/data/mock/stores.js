/**
 * Mock store data for development.
 * Replaced by API responses once the backend is available.
 */

import storeLogo from '../../assets/mock/store-logo.svg'

/** @type {import('../models.js').Store[]} */
export const stores = [
  {
    storeId: 'toko-komputer-jaya',
    name: 'Toko Komputer Jaya',
    logoUrl: storeLogo,
    description:
      'Menyediakan berbagai kebutuhan komputer, laptop, komponen, dan perangkat jaringan.',
    province: 'Jawa Barat',
    city: 'Kota Bandung',
    fullAddress: 'Jl. Asia Afrika No. 10, Bandung',
    operatingHours: 'Senin - Sabtu, 09:00 - 18:00',
    whatsapp: '6281234567890',
    channels: [
      { name: 'Shopee', url: 'https://shopee.co.id/toko-komputer-jaya' },
      { name: 'Tokopedia', url: 'https://www.tokopedia.com/toko-komputer-jaya' },
    ],
    verified: true,
    announcement: {
      title: 'Promo Berlangsung',
      message: 'Promo dan stok produk terbaru tersedia di katalog kami.',
      isEnabled: true,
    },
    autoArchiveDays: 30,
    lastStoreIdChange: '2026-01-15T00:00:00.000Z',
    createdAt: '2025-06-01T00:00:00.000Z',
  },
  {
    storeId: 'techspace-bandung',
    name: 'TechSpace Bandung',
    logoUrl: storeLogo,
    description:
      'Katalog perangkat komputer, laptop, networking, dan accessories untuk kebutuhan kerja dan gaming.',
    province: 'Jawa Barat',
    city: 'Kota Bandung',
    fullAddress: 'Jl. Riau No. 12, Bandung',
    operatingHours: 'Senin - Sabtu, 10:00 - 20:00',
    whatsapp: '6281234567890',
    channels: [
      { name: 'Tokopedia', url: 'https://www.tokopedia.com/techspace-bandung' },
      { name: 'Shopee', url: 'https://shopee.co.id/techspace_bandung' },
    ],
    verified: false,
    autoArchiveDays: 30,
    lastStoreIdChange: '2026-02-01T00:00:00.000Z',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
]

export const mockStoreId = stores[0].storeId