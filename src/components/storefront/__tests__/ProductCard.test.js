/**
 * Consumer test: the public ProductCard renders the locked product info order
 * and the conditional SOLD OUT / Product Unggulan indicators. Uses
 * react-dom/server (no DOM test library) and React.createElement inside a
 * MemoryRouter so useNavigate works without JSX (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductCard from '../ProductCard'

function renderCard(product) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ProductCard, {
        product,
        storeId: 'toko-komputer-jaya',
        storeName: 'Toko Komputer Jaya',
      }),
    ),
  )
}

const baseProduct = {
  id: 20,
  storeId: 'toko-komputer-jaya',
  name: 'Laptop Asus ROG',
  images: ['/img/a.jpg'],
  mainImage: '/img/a.jpg',
  category: 'Laptop',
  brand: 'Asus',
  condition: 'NEW',
  price: 'Rp 15.000.000',
  priceValue: 15000000,
  status: 'PUBLISHED',
  featured: false,
}

describe('ProductCard public card', () => {
  it('shows category, name, bold price and the condition badge', () => {
    const html = renderCard({ ...baseProduct, condition: 'SECOND' })
    expect(html).toContain('Laptop')
    expect(html).toContain('Laptop Asus ROG')
    expect(html).toContain('Rp 15.000.000')
    expect(html).toContain('SECOND')
    expect(html).toContain('extrabold')
  })

  it('does not show brand, availability or contact actions', () => {
    const html = renderCard({
      ...baseProduct,
      name: 'Boost Gaming Chair',
      brand: 'Secretlab',
    })
    expect(html).not.toContain('Secretlab')
    expect(html).not.toContain('Tersedia')
    expect(html).not.toContain('Sold Out')
    expect(html).not.toContain('WhatsApp')
    expect(html).not.toContain('Marketplace')
  })

  it('shows a SOLD OUT indicator only for SOLD_OUT products', () => {
    const soldOutHtml = renderCard({ ...baseProduct, status: 'SOLD_OUT' })
    expect(soldOutHtml).toContain('SOLD OUT')

    const publishedHtml = renderCard(baseProduct)
    expect(publishedHtml).not.toContain('SOLD OUT')
  })

  it('shows the Product Unggulan indicator only for featured products', () => {
    const featuredHtml = renderCard({ ...baseProduct, featured: true })
    expect(featuredHtml).toContain('Product Unggulan')

    const plainHtml = renderCard(baseProduct)
    expect(plainHtml).not.toContain('Product Unggulan')
  })

  it('exposes a share action with an accessible label', () => {
    const html = renderCard(baseProduct)
    expect(html).toContain('aria-label="Bagikan produk Laptop Asus ROG"')
    expect(html).toContain('>share<')
  })
})