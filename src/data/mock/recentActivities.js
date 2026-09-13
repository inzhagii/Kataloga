/**
 * Mock recent activity data for the seller dashboard.
 * Dashboard-only timeline: PRODUCT_PUBLISHED, PRODUCT_EDITED, STORE_UPDATED.
 * Replaced by API responses once the backend is available.
 */

import { ACTIVITY_TYPE } from '../../constants/enums'

/** @type {import('../models.js').RecentActivity[]} */
export const recentActivities = [
  {
    id: 8,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'ASUS VivoBook 14 berhasil dipublikasi ke katalog.',
    date: '2026-09-12T07:30:00.000Z',
  },
  {
    id: 7,
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    message: 'Kingston NV2 1TB NVMe diperbarui (harga dan deskripsi diubah).',
    date: '2026-09-11T14:10:00.000Z',
  },
  {
    id: 6,
    type: ACTIVITY_TYPE.STORE_UPDATED,
    message: 'Informasi toko diperbarui.',
    date: '2026-09-11T09:45:00.000Z',
  },
  {
    id: 5,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'TP-Link Archer AX23 berhasil dipublikasi ke katalog.',
    date: '2026-09-10T18:25:00.000Z',
  },
  {
    id: 4,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'Samsung Galaxy A55 berhasil dipublikasi ke katalog.',
    date: '2026-09-09T14:20:00.000Z',
  },
  {
    id: 3,
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    message: 'Lenovo IdeaPad Slim 3 diperbarui (harga diubah).',
    date: '2026-09-08T11:05:00.000Z',
  },
  {
    id: 2,
    type: ACTIVITY_TYPE.STORE_UPDATED,
    message: 'Informasi toko diperbarui.',
    date: '2026-09-06T16:20:00.000Z',
  },
  {
    id: 1,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'Intel Core i5-12400F berhasil dipublikasi ke katalog.',
    date: '2026-09-04T14:48:00.000Z',
  },
]