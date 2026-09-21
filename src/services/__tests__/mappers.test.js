/**
 * Store DTO -> frontend model mapping tests for the proposed API contract
 * (docs/API-CONTRACT.md): announcement object ({ title, message, is_enabled })
 * and the store-level auto_archive_days setting.
 */

import { describe, expect, it } from 'vitest'
import { toStore, toBrand, toCustomerInterest, toRecentActivity } from '../adapters/api/mappers'

describe('toStore announcement mapping', () => {
  it('maps the wire announcement to { title, message, isEnabled }', () => {
    const store = toStore({
      store_id: 'toko-x',
      announcement: { title: 'Promo', message: 'Diskon 10%', is_enabled: true },
    })
    expect(store.announcement).toEqual({
      title: 'Promo',
      message: 'Diskon 10%',
      isEnabled: true,
    })
  })

  it('keeps announcement data while mapping is_enabled=false', () => {
    const store = toStore({
      store_id: 'toko-x',
      announcement: { title: 'Tutup', message: 'Sementara', is_enabled: false },
    })
    expect(store.announcement).toMatchObject({ title: 'Tutup', message: 'Sementara' })
    expect(store.announcement.isEnabled).toBe(false)
  })

  it('leaves announcement undefined when the DTO has none', () => {
    expect(toStore({ store_id: 'toko-x' }).announcement).toBeUndefined()
  })
})

describe('toStore auto archive mapping', () => {
  it('maps auto_archive_days to autoArchiveDays', () => {
    expect(toStore({ store_id: 'toko-x', auto_archive_days: 30 }).autoArchiveDays).toBe(30)
  })

  it('maps auto_archive_days null to null (Never)', () => {
    expect(toStore({ store_id: 'toko-x', auto_archive_days: null }).autoArchiveDays).toBeNull()
  })

  it('defaults a missing auto_archive_days to null', () => {
    expect(toStore({ store_id: 'toko-x' }).autoArchiveDays).toBeNull()
  })
})

describe('toBrand mapping', () => {
  it('maps the wire DTO to the frontend brand model', () => {
    expect(toBrand({ id: 3, name: 'Asus', store_id: 'toko-x' })).toEqual({
      id: 3,
      name: 'Asus',
      storeId: 'toko-x',
    })
  })

  it('defaults missing fields safely', () => {
    expect(toBrand({ id: 4 })).toEqual({ id: 4, name: '', storeId: null })
  })
})

describe('toCustomerInterest mapping', () => {
  it('maps the full wire DTO to the frontend model', () => {
    const interest = toCustomerInterest({
      id: 5,
      store_id: 'toko-x',
      customer_name: 'Budi',
      customer_id: 11,
      customer_email: 'budi@example.com',
      customer_phone: '081234567001',
      product_id: 20,
      product_name: 'Laptop Asus ROG',
      channel_type: 'MARKETPLACE_CLICK',
      channel: 'Shopee',
      external_url: 'https://shopee.example/toko-x',
      context: 'Product Detail',
      date: '2026-09-12T07:30:00.000Z',
    })
    expect(interest).toEqual({
      id: 5,
      storeId: 'toko-x',
      customerName: 'Budi',
      customerId: 11,
      customerEmail: 'budi@example.com',
      customerPhone: '081234567001',
      productId: 20,
      productName: 'Laptop Asus ROG',
      channelType: 'MARKETPLACE_CLICK',
      channel: 'Shopee',
      externalUrl: 'https://shopee.example/toko-x',
      context: 'Product Detail',
      date: '2026-09-12T07:30:00.000Z',
    })
  })

  it('keeps a missing customer name null instead of a placeholder like "-"', () => {
    const interest = toCustomerInterest({
      id: 6,
      store_id: 'toko-x',
      customer_email: 'anon@example.com',
      channel_type: 'WHATSAPP_CLICK',
      channel: 'WhatsApp',
      date: '2026-09-12T07:30:00.000Z',
    })
    expect(interest.customerName).toBeNull()
    expect(interest.customerEmail).toBe('anon@example.com')
  })

  it('defaults missing identity/context fields to null', () => {
    const interest = toCustomerInterest({
      id: 7,
      store_id: 'toko-x',
      channel_type: 'WHATSAPP_CLICK',
      channel: 'WhatsApp',
      date: '2026-09-12T07:30:00.000Z',
    })
    expect(interest.customerName).toBeNull()
    expect(interest.customerEmail).toBeNull()
    expect(interest.customerPhone).toBeNull()
    expect(interest.context).toBeNull()
  })
})

describe('toRecentActivity mapping', () => {
  it('maps the wire DTO with store/product context', () => {
    const activity = toRecentActivity({
      id: 12,
      store_id: 'toko-x',
      type: 'PRODUCT_PUBLISHED',
      message: 'Laptop dipublikasi.',
      product_id: 20,
      product_name: 'Laptop Asus ROG',
      date: '2026-09-12T07:30:00.000Z',
    })
    expect(activity).toEqual({
      id: 12,
      storeId: 'toko-x',
      type: 'PRODUCT_PUBLISHED',
      message: 'Laptop dipublikasi.',
      productId: 20,
      productName: 'Laptop Asus ROG',
      date: '2026-09-12T07:30:00.000Z',
    })
  })

  it('maps the external PRODUCT_UPDATED contract name to canonical PRODUCT_EDITED', () => {
    const activity = toRecentActivity({
      id: 9,
      store_id: 'toko-x',
      type: 'PRODUCT_UPDATED',
      message: 'Laptop diperbarui.',
      date: '2026-09-12T07:30:00.000Z',
    })
    expect(activity.type).toBe('PRODUCT_EDITED')
  })

  it('defaults missing context fields to null', () => {
    const activity = toRecentActivity({
      id: 8,
      type: 'STORE_UPDATED',
      message: 'Informasi toko diperbarui.',
      date: '2026-09-12T07:30:00.000Z',
    })
    expect(activity.storeId).toBeNull()
    expect(activity.productId).toBeNull()
    expect(activity.productName).toBeNull()
  })

  it('falls back to created_at when date is absent', () => {
    const activity = toRecentActivity({
      id: 8,
      type: 'STORE_UPDATED',
      message: 'Informasi toko diperbarui.',
      created_at: '2026-09-12T07:30:00.000Z',
    })
    expect(activity.date).toBe('2026-09-12T07:30:00.000Z')
  })
})