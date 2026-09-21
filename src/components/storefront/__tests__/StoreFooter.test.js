/**
 * Consumer test: StoreFooter renders store identity, configured channels, and
 * the Full Address as a Google Maps search link (only when present). Uses
 * react-dom/server (no DOM test library) and React.createElement without JSX.
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import StoreFooter from '../StoreFooter'

function render(store) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(StoreFooter, {
        store,
        onWhatsApp: () => {},
        onSelectChannel: () => {},
      }),
    ),
  )
}

const baseStore = {
  storeId: 'toko-komputer-jaya',
  name: 'Toko Komputer Jaya',
  channels: [],
}

describe('StoreFooter', () => {
  it('links the Full Address to a Google Maps search', () => {
    const html = render({ ...baseStore, fullAddress: 'Jl. Merdeka 1' })
    expect(html).toContain('Alamat')
    expect(html).toContain('Jl. Merdeka 1')
    expect(html).toContain(
      'https://www.google.com/maps/search/?api=1&amp;query=Jl.%20Merdeka%201',
    )
    expect(html).toContain('target="_blank"')
  })

  it('omits the Alamat block when there is no full address', () => {
    const html = render(baseStore)
    expect(html).not.toContain('Alamat')
  })

  it('renders configured marketplace channels', () => {
    const html = render({
      ...baseStore,
      channels: [{ name: 'Shopee', url: 'https://shopee.co.id/x' }],
    })
    expect(html).toContain('Shopee')
  })

  it('shows the store name and identity', () => {
    expect(render(baseStore)).toContain('Toko Komputer Jaya')
  })
})
