/**
 * Consumer test: StoreHeader ("Store Information" card) renders the store
 * profile (logo placeholder, name, description, location, operating hours) and,
 * when action handlers are wired, the store actions INSIDE the card — WhatsApp
 * full-width first, then Marketplace + Share side-by-side below. The card is a
 * normal document block: the actions are never a fixed/floating bar. Uses
 * react-dom/server (no DOM test library) and React.createElement without JSX.
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import StoreHeader from '../StoreHeader'

const baseStore = {
  storeId: 'toko-komputer-jaya',
  name: 'Toko Komputer Jaya',
  city: 'Bandung',
  province: 'Jawa Barat',
  operatingHours: 'Senin - Jumat, 09.00 - 17.00',
}

const handlers = {
  onWhatsApp: () => {},
  onSelectChannel: () => {},
  onShareStore: () => {},
}

function render(store = baseStore, props = {}) {
  return renderToStaticMarkup(React.createElement(StoreHeader, { store, ...props }))
}

describe('StoreHeader (Store Information)', () => {
  it('renders profile info and the store actions inside the card', () => {
    const html = render()
    expect(html).toContain('Toko Komputer Jaya')
    expect(html).toContain('Bandung, Jawa Barat')
    expect(html).toContain('Senin - Jumat, 09.00 - 17.00')
  })

  it('renders WhatsApp, Marketplace and Share inside the card when handlers are wired', () => {
    const html = render(
      { ...baseStore, channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }] },
      handlers,
    )
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Marketplace')
    expect(html).toContain('Bagikan')
  })

  it('orders actions: WhatsApp above Marketplace and Share', () => {
    const html = render(
      { ...baseStore, channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }] },
      handlers,
    )
    const whatsappAt = html.indexOf('Hubungi via WhatsApp')
    const marketplaceAt = html.indexOf('Marketplace')
    const bagikanAt = html.indexOf('Bagikan')
    expect(whatsappAt).toBeGreaterThanOrEqual(0)
    expect(marketplaceAt).toBeGreaterThan(whatsappAt)
    expect(bagikanAt).toBeGreaterThan(marketplaceAt)
  })

  it('keeps actions inside the card as inline (non-floating) content', () => {
    const html = render(
      { ...baseStore, channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }] },
      handlers,
    )
    expect(html).not.toContain('fixed inset-x-0 bottom-0')
    expect(html).not.toContain('pointer-events-none')
    expect(html).not.toContain('opacity-0')
    expect(html).not.toContain('translate-y-4')
  })

  it('renders WhatsApp + Share when the store has no Marketplace destinations', () => {
    const html = render(baseStore, handlers)
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Bagikan')
    expect(html).not.toContain('Marketplace')
  })

  it('does not render actions when no handlers are wired', () => {
    const html = render(baseStore)
    expect(html).not.toContain('Hubungi via WhatsApp')
    expect(html).not.toContain('Bagikan')
    expect(html).not.toContain('Marketplace')
  })
})