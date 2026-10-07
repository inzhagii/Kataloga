/**
 * Consumer test: StoreActions is now the Store Landing FLOATING action bar
 * (docs/PRODUCT.md §8, docs/UI_RULES.md §13). It renders nothing while
 * `visible` is false and a fixed bottom bar while true, with
 * WhatsApp + Marketplace (when channels are configured) + Share (smaller).
 * Uses react-dom/server (no DOM test library) and React.createElement without
 * JSX (Vitest include matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import StoreActions from '../StoreActions'

function render(store, visible = true) {
  return renderToStaticMarkup(
    React.createElement(StoreActions, {
      store,
      visible,
      onWhatsApp: () => {},
      onSelectChannel: () => {},
      onShareStore: () => {},
    }),
  )
}

const baseStore = { storeId: 'toko-komputer-jaya', name: 'Toko Komputer Jaya' }
const withChannels = {
  ...baseStore,
  channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }],
}

describe('StoreActions (floating action bar)', () => {
  it('renders nothing while not visible', () => {
    const html = render(withChannels, false)
    expect(html).toBe('')
  })

  it('renders a fixed bottom bar when visible', () => {
    const html = render(withChannels)
    expect(html).toContain('fixed inset-x-0 bottom-0')
    expect(html).toContain('role="region"')
    expect(html).toContain('Aksi toko')
  })

  it('shows WhatsApp, Marketplace and Share when channels are configured', () => {
    const html = render(withChannels)
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Marketplace')
    expect(html).toContain('Bagikan')
  })

  it('orders WhatsApp before Marketplace before Share', () => {
    const html = render(withChannels)
    const whatsappAt = html.indexOf('Hubungi via WhatsApp')
    const marketplaceAt = html.indexOf('Marketplace')
    const bagikanAt = html.indexOf('Bagikan')
    expect(whatsappAt).toBeGreaterThanOrEqual(0)
    expect(marketplaceAt).toBeGreaterThan(whatsappAt)
    expect(bagikanAt).toBeGreaterThan(marketplaceAt)
  })

  it('shows WhatsApp and Share (no Marketplace) when there are no channels', () => {
    const html = render({ ...baseStore, channels: [] })
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Bagikan')
    expect(html).not.toContain('Marketplace')
  })

  it('treats a missing channels field as no channels', () => {
    const html = render(baseStore)
    expect(html).not.toContain('Marketplace')
    expect(html).toContain('Hubungi via WhatsApp')
  })
})
