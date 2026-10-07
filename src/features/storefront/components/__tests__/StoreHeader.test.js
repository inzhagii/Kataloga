/**
 * Consumer test: StoreHeader ("Store Information" card) renders ONLY the store
 * profile (logo placeholder, name, description, location, operating hours).
 * Store actions are no longer part of the header — they live in the floating
 * action bar (StoreActions), so the header must never render WhatsApp /
 * Marketplace / Share even when handlers are supplied. Uses react-dom/server
 * (no DOM test library) and React.createElement without JSX.
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
  it('renders profile info', () => {
    const html = render()
    expect(html).toContain('Toko Komputer Jaya')
    expect(html).toContain('Bandung, Jawa Barat')
    expect(html).toContain('Senin - Jumat, 09.00 - 17.00')
  })

  it('never renders store actions, even when handlers are wired', () => {
    const html = render(
      { ...baseStore, channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }] },
      handlers,
    )
    expect(html).not.toContain('Hubungi via WhatsApp')
    expect(html).not.toContain('Marketplace')
    expect(html).not.toContain('Bagikan')
    expect(html).not.toContain('fixed inset-x-0 bottom-0')
  })
})
