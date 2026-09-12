/**
 * Mock customer interest data for development.
 * Only meaningful channel intents (WHATSAPP_CLICK, MARKETPLACE_CLICK).
 */

import { INTEREST_TYPE } from '../../constants/enums'

/** @type {import('../models.js').CustomerInterest[]} */
export const customerInterests = [
  {
    id: 1,
    storeId: 'toko-komputer-jaya',
    customerName: 'Budi Santoso',
    productId: 1,
    productName: 'Laptop Asus VivoBook 14',
    channelType: INTEREST_TYPE.WHATSAPP_CLICK,
    channel: 'WhatsApp',
    externalUrl: null,
    date: '2026-09-10T09:24:00.000Z',
  },
  {
    id: 2,
    storeId: 'toko-komputer-jaya',
    customerName: 'Siti Rahayu',
    productId: 2,
    productName: 'MacBook Air M2',
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'Shopee',
    externalUrl: 'https://shopee.co.id/toko-komputer-jaya',
    date: '2026-09-10T11:02:00.000Z',
  },
  {
    id: 3,
    storeId: 'toko-komputer-jaya',
    customerName: 'Budi Santoso',
    productId: 3,
    productName: 'Laptop Lenovo ThinkPad Bekas',
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'Tokopedia',
    externalUrl: 'https://tokopedia.com/toko-komputer-jaya',
    date: '2026-09-09T15:47:00.000Z',
  },
  {
    id: 4,
    storeId: 'toko-komputer-jaya',
    customerName: 'Andi Wijaya',
    productId: 5,
    productName: 'Mouse Gaming Logitech G304',
    channelType: INTEREST_TYPE.WHATSAPP_CLICK,
    channel: 'WhatsApp',
    externalUrl: null,
    date: '2026-09-08T10:15:00.000Z',
  },
  {
    id: 5,
    storeId: 'toko-komputer-jaya',
    customerName: 'Dewi Lestari',
    productId: 1,
    productName: 'Laptop Asus VivoBook 14',
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'Website',
    externalUrl: 'https://tokokomputerjaya.com',
    date: '2026-09-07T13:33:00.000Z',
  },
]