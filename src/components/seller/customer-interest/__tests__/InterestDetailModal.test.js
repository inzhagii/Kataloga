/**
 * Consumer test: the Customer Interest "Lihat Product" action must point at
 * the canonical product-detail route, and the channel badge must resolve its
 * name/icon through the shared channel master. Uses react-dom/server (no DOM
 * test library is configured) and React.createElement to avoid JSX in a
 * .test.js file (the Vitest include pattern only matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import InterestDetailModal from '../InterestDetailModal'
import { CMS_CHANNELS } from '../../../../data/mock/channels'

function render(record, productById, extraProps = {}) {
  const props = {
    record,
    interests: [record],
    productById,
    onClose: () => {},
    ...extraProps,
  }
  return renderToStaticMarkup(React.createElement(InterestDetailModal, props))
}

const baseRecord = {
  id: 5,
  storeId: 'toko-jaya',
  customerName: 'Budi',
  customerId: 11,
  productId: 20,
  productName: 'Laptop Asus ROG',
  channelType: 'WHATSAPP_CLICK',
  channel: 'WhatsApp',
  date: '2026-01-02T10:00:00.000Z',
}

describe('InterestDetailModal product link', () => {
  it('uses the canonical product detail URL', () => {
    const productById = new Map([
      [20, { id: 20, storeId: 'toko-jaya', name: 'Laptop Asus ROG', price: 'Rp 15.000.000' }],
    ])
    const html = render(baseRecord, productById)
    expect(html).toContain('href="/toko-jaya/product/20/laptop-asus-rog"')
    expect(html).not.toContain('href="/toko-jaya/products/20')
  })

  it('keeps an API-provided product slug in the canonical URL', () => {
    const productById = new Map([
      [20, { id: 20, storeId: 'toko-jaya', name: 'Laptop Asus ROG', slug: 'asus-rog-2026', price: 'Rp 15.000.000' }],
    ])
    const html = render(baseRecord, productById)
    expect(html).toContain('href="/toko-jaya/product/20/asus-rog-2026"')
  })
})

describe('InterestDetailModal channel badge', () => {
  it('resolves a channelId reference through the shared channel master', () => {
    const productById = new Map([[20, { id: 20, storeId: 'toko-jaya', name: 'Laptop' }]])
    const record = {
      ...baseRecord,
      channelType: 'MARKETPLACE_CLICK',
      channel: '',
      channelId: 'TOKOPEDIA',
    }
    const html = render(record, productById, { definitions: CMS_CHANNELS })
    expect(html).toContain('Tokopedia')
    expect(html).toContain('>storefront<')
  })

  it('keeps the legacy channel name snapshot with its preset icon', () => {
    const productById = new Map([[20, { id: 20, storeId: 'toko-jaya', name: 'Laptop' }]])
    const record = { ...baseRecord, channelType: 'MARKETPLACE_CLICK', channel: 'Shopee' }
    const html = render(record, productById)
    expect(html).toContain('Shopee')
    expect(html).toContain('>shopping_bag<')
  })
})