/**
 * Consumer test: ProductInfo follows the locked hierarchy (Brand >
 * Product Unggulan > Name > Price > Category + Condition) and applies the
 * CTA + Share action rules (no WhatsApp/Marketplace on Product Detail).
 * Uses react-dom/server (no DOM test library) and React.createElement without
 * JSX (Vitest include matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductInfo from '../ProductInfo'

function render(product) {
  return renderToStaticMarkup(
    React.createElement(ProductInfo, {
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
  brand: 'Asus',
  category: 'Komputer',
  condition: 'NEW',
  price: 'Rp 15.000.000',
  status: 'PUBLISHED',
  featured: false,
  externalLinks: [{ name: 'Shopee', url: 'https://shopee.co.id/x' }],
  cta: { type: 'BUY' },
}

describe('ProductInfo hierarchy', () => {
  it('orders Brand, Name, Price, then Category and Condition', () => {
    const html = render(baseProduct)
    expect(html).toContain('Brand : Asus')
    const brandIndex = html.indexOf('Brand : Asus')
    const nameIndex = html.indexOf('Laptop ROG')
    const priceIndex = html.indexOf('Harga')
    const categoryIndex = html.indexOf('Komputer')

    expect(brandIndex).toBeGreaterThan(-1)
    expect(brandIndex).toBeLessThan(nameIndex)
    expect(nameIndex).toBeLessThan(priceIndex)
    expect(priceIndex).toBeLessThan(categoryIndex)
    expect(html).toContain('New')
  })

  it('shows the Product Unggulan indicator only when featured', () => {
    expect(render({ ...baseProduct, featured: true })).toContain('Product Unggulan')
    expect(render(baseProduct)).not.toContain('Product Unggulan')
  })

  it('omits the brand line when the product has no brand', () => {
    const html = render({ ...baseProduct, brand: '' })
    expect(html).not.toContain('Asus')
    expect(html).not.toContain('Brand :')
  })
})

describe('ProductInfo actions', () => {
  it('renders CTA (Beli) and Share, never WhatsApp or Marketplace', () => {
    const html = render(baseProduct)
    expect(html).toContain('Beli')
    expect(html).toContain('Bagikan')
    expect(html).not.toContain('Hubungi via WhatsApp')
    expect(html).not.toContain('Marketplace')
  })

  it('hides the CTA and keeps Share for SOLD_OUT', () => {
    const html = render({ ...baseProduct, status: 'SOLD_OUT' })
    expect(html).toContain('Sold Out')
    expect(html).toContain('Bagikan')
    expect(html).not.toContain('Beli')
  })
})