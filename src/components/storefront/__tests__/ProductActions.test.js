/**
 * Consumer test: ProductActions hides WhatsApp/Marketplace for SOLD_OUT
 * products and always keeps Share (locked docs/UI_RULES.md 28). Uses
 * react-dom/server (no DOM test library) and React.createElement without JSX
 * (Vitest include pattern matches only *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductActions from '../ProductActions'

function renderActions({ soldOut = false } = {}) {
  return renderToStaticMarkup(
    React.createElement(ProductActions, {
      store: { channels: [{ name: 'Shopee', url: 'https://shopee.co.id/example' }] },
      soldOut,
      onWhatsApp: () => {},
      onSelectChannel: () => {},
      onShare: () => {},
    }),
  )
}

describe('ProductActions', () => {
  it('renders WhatsApp, Marketplace and Share for a PUBLISHED product', () => {
    const html = renderActions()
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Marketplace')
    expect(html).toContain('Bagikan')
  })

  it('hides WhatsApp and Marketplace when the product is SOLD_OUT, keeping only Share', () => {
    const html = renderActions({ soldOut: true })
    expect(html).not.toContain('Hubungi via WhatsApp')
    expect(html).not.toContain('Marketplace')
    expect(html).toContain('Bagikan Produk')
  })
})