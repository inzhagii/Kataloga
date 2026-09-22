/**
 * Consumer test: ProductActions renders CTA (primary) + Share (secondary) with
 * no WhatsApp/Marketplace on Product Detail. CTA is hidden when the menu
 * destination is empty or the product is SOLD_OUT (locked docs/PRODUCT.md §30).
 * Uses react-dom/server (no DOM test library) and React.createElement without
 * JSX (Vitest include pattern matches only *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductActions from '../ProductActions'

function renderActions(product) {
  return renderToStaticMarkup(
    React.createElement(ProductActions, {
      product,
      onSelectDestination: () => {},
      onShare: () => {},
    }),
  )
}

const baseProduct = {
  id: 20,
  storeId: 's1',
  name: 'Laptop ROG',
  externalLinks: [{ name: 'Shopee', url: 'https://shopee.co.id/x' }],
  cta: { type: 'BUY' },
  status: 'PUBLISHED',
}

describe('ProductActions', () => {
  it('renders the CTA label (Beli) and Share for a PUBLISHED product', () => {
    const html = renderActions(baseProduct)
    expect(html).toContain('Beli')
    expect(html).toContain('Bagikan')
  })

  it('maps Tawar and a custom CUSTOM label to the CTA button', () => {
    expect(renderActions({ ...baseProduct, cta: { type: 'BARGAIN' } })).toContain('Tawar')
    expect(
      renderActions({ ...baseProduct, cta: { type: 'CUSTOM', label: 'Chat Admin' } }),
    ).toContain('Chat Admin')
  })

  it('hides the CTA when the product has no external destinations (no fallback)', () => {
    const html = renderActions({ ...baseProduct, externalLinks: [] })
    expect(html).not.toContain('Beli')
    expect(html).toContain('Bagikan')
  })

  it('hides the CTA when the product is SOLD_OUT, keeping only Share', () => {
    const html = renderActions({ ...baseProduct, status: 'SOLD_OUT' })
    expect(html).not.toContain('Beli')
    expect(html).toContain('Bagikan')
  })

  it('never renders WhatsApp or Marketplace on Product Detail', () => {
    const html = renderActions(baseProduct)
    expect(html).not.toContain('Hubungi via WhatsApp')
    expect(html).not.toContain('Marketplace')
  })
})