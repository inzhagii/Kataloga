/**
 * Mock recent activity data for the seller dashboard.
 * Timeline restricted to the locked seven seller/store activity types
 * (docs/PRODUCT.md): PUBLISHED, EDITED, SOLD_OUT, REACTIVATED, ARCHIVED,
 * RESTORED, STORE_UPDATED. Customer activity never appears here.
 * Replaced by API responses once the backend is available.
 */

import { ACTIVITY_TYPE } from '../../constants/enums'

/** @type {import('../models.js').RecentActivity[]} */
export const recentActivities = [
  {
    id: 12,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'ASUS VivoBook 14 berhasil dipublikasi ke katalog.',
    productId: 1,
    productName: 'ASUS VivoBook 14',
    date: '2026-09-12T07:30:00.000Z',
  },
  {
    id: 11,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_SOLD_OUT,
    message: 'Samsung Galaxy A55 ditandai Sold Out.',
    productId: 5,
    productName: 'Samsung Galaxy A55',
    date: '2026-09-11T16:40:00.000Z',
  },
  {
    id: 10,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    message: 'Kingston NV2 1TB NVMe diperbarui (harga dan deskripsi diubah).',
    productId: 10,
    productName: 'Kingston NV2 1TB NVMe',
    date: '2026-09-11T14:10:00.000Z',
  },
  {
    id: 9,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.STORE_UPDATED,
    message: 'Informasi toko diperbarui.',
    productId: null,
    productName: null,
    date: '2026-09-11T09:45:00.000Z',
  },
  {
    id: 8,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_ARCHIVED,
    message: 'HP EliteBook 840 G7 diarsipkan.',
    productId: 3,
    productName: 'HP EliteBook 840 G7',
    date: '2026-09-10T20:12:00.000Z',
  },
  {
    id: 7,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'TP-Link Archer AX23 berhasil dipublikasi ke katalog.',
    productId: 11,
    productName: 'TP-Link Archer AX23',
    date: '2026-09-10T18:25:00.000Z',
  },
  {
    id: 6,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_REACTIVATED,
    message: 'Logitech G102 Lightsync kembali aktif di katalog.',
    productId: 8,
    productName: 'Logitech G102 Lightsync',
    date: '2026-09-10T11:30:00.000Z',
  },
  {
    id: 5,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_RESTORED,
    message: 'Lenovo IdeaPad Slim 3 dikembalikan ke draft.',
    productId: 2,
    productName: 'Lenovo IdeaPad Slim 3',
    date: '2026-09-09T15:55:00.000Z',
  },
  {
    id: 4,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'Samsung Galaxy A55 berhasil dipublikasi ke katalog.',
    productId: 5,
    productName: 'Samsung Galaxy A55',
    date: '2026-09-09T14:20:00.000Z',
  },
  {
    id: 3,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    message: 'Lenovo IdeaPad Slim 3 diperbarui (harga diubah).',
    productId: 2,
    productName: 'Lenovo IdeaPad Slim 3',
    date: '2026-09-08T11:05:00.000Z',
  },
  {
    id: 2,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.STORE_UPDATED,
    message: 'Informasi toko diperbarui.',
    productId: null,
    productName: null,
    date: '2026-09-06T16:20:00.000Z',
  },
  {
    id: 1,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: 'Intel Core i5-12400F berhasil dipublikasi ke katalog.',
    productId: 4,
    productName: 'Intel Core i5-12400F',
    date: '2026-09-04T14:48:00.000Z',
  },
]