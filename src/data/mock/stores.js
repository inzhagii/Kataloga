/**
 * Mock store data for development.
 * Replaced by API responses once the backend is available.
 */

import storeLogo from '../../assets/mock/store-logo.svg'
import { CUSTOM_CHANNEL_LOGO } from './channels'

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
      { channelId: 'SHOPEE', url: 'https://shopee.co.id/toko-komputer-jaya' },
      { channelId: 'TOKOPEDIA', url: 'https://www.tokopedia.com/toko-komputer-jaya' },
    ],
    customChannels: [
      {
        id: 'CUSTOM:TOKO-SAYA',
        storeId: 'toko-komputer-jaya',
        name: 'Toko Saya',
        logo: CUSTOM_CHANNEL_LOGO,
        custom: true,
      },
    ],
    ctaOptions: [
      { type: 'BUY', label: 'Beli' },
      { type: 'BARGAIN', label: 'Tawar' },
      { type: 'CUSTOM', label: 'Tanya Harga' },
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
      { channelId: 'TOKOPEDIA', url: 'https://www.tokopedia.com/techspace-bandung' },
      { channelId: 'SHOPEE', url: 'https://shopee.co.id/techspace_bandung' },
    ],
    customChannels: [],
    ctaOptions: [
      { type: 'BUY', label: 'Beli' },
      { type: 'BARGAIN', label: 'Tawar' },
      { type: 'CUSTOM', label: 'Tanya Harga' },
    ],
    verified: false,
    autoArchiveDays: 30,
    lastStoreIdChange: '2026-02-01T00:00:00.000Z',
    createdAt: '2026-01-10T00:00:00.000Z',
  },
]

export const mockStoreId = stores[0].storeId