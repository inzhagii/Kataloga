/**
 * Mock recent activity data for the seller dashboard.
 * Dashboard-only timeline: PRODUCT_PUBLISHED, PRODUCT_EDITED, STORE_UPDATED.
 * Replaced by API responses once the backend is available.
 */

import { ACTIVITY_TYPE } from '../../constants/enums'

/** @type {import('../models.js').RecentActivity[]} */
export const recentActivities = [
  {
    id: 9,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'SSD NVMe 512GB berhasil dipublikasi ke katalog.',
    date: '2026-09-12T07:30:00.000Z',
  },
  {
    id: 8,
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    message: 'Processor AMD Ryzen 5 5600 diperbarui (harga dan foto produk diubah).',
    date: '2026-09-11T14:10:00.000Z',
  },
  {
    id: 7,
    type: ACTIVITY_TYPE.STORE_UPDATED,
    message: 'Alamat lengkap toko dan jam operasional diperbarui.',
    date: '2026-09-11T09:45:00.000Z',
  },
  {
    id: 6,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'Router WiFi TP-Link Archer C6 berhasil dipublikasi ke katalog.',
    date: '2026-09-10T18:25:00.000Z',
  },
  {
    id: 5,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'Laptop Asus VivoBook 14 berhasil dipublikasi ke katalog.',
    date: '2026-09-10T20:15:00.000Z',
  },
  {
    id: 4,
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    message: 'MacBook Air M2 diperbarui (harga dan foto produk diubah).',
    date: '2026-09-10T09:40:00.000Z',
  },
  {
    id: 3,
    type: ACTIVITY_TYPE.STORE_UPDATED,
    message: 'Jam operasional toko dan deskripsi profil diperbarui.',
    date: '2026-09-09T16:20:00.000Z',
  },
  {
    id: 2,
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    message: 'Laptop Lenovo ThinkPad Bekas diperbarui (deskripsi diubah).',
    date: '2026-09-08T11:05:00.000Z',
  },
  {
    id: 1,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'Mouse Gaming Logitech G304 berhasil dipublikasi ke katalog.',
    date: '2026-09-07T14:48:00.000Z',
  },
]