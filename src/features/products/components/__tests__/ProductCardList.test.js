/**
 * Static rendering checks for the mobile seller product card list (M8):
 * Brand, category, condition and status are visible on the card. Uses
 * react-dom/server (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import ProductCardList from '../ProductCardList'

const noop = () => {}

function render(products) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ProductCardList, {
        products,
        onPublish: noop,
        onToggleFeatured: noop,
        onArchive: noop,
        onMarkSoldOut: noop,
        onReactivate: noop,
        onRestore: noop,
      }),
    ),
  )
}

const products = [
  {
    id: 1,
    name: 'Laptop Asus ROG',
    category: 'Laptop',
    brand: 'Asus',
    condition: 'NEW',
    priceValue: 15000000,
    status: 'PUBLISHED',
    featured: false,
    storeId: 'toko-komputer-jaya',
  },
]

describe('ProductCardList', () => {
  it('shows the product name, category, brand and condition', () => {
    const html = render(products)
    expect(html).toContain('Laptop Asus ROG')
    expect(html).toContain('Laptop')
    expect(html).toContain('Asus')
    expect(html).toContain('New')
  })

  it('shows the lifecycle status', () => {
    expect(render(products)).toContain('Published')
  })

  it('renders the name as a button routed to onDetail when provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(ProductCardList, {
          products,
          onPublish: noop,
          onToggleFeatured: noop,
          onArchive: noop,
          onMarkSoldOut: noop,
          onReactivate: noop,
          onRestore: noop,
          onDetail: noop,
        }),
      ),
    )
    expect(html).toContain('<button')
    expect(html).not.toContain('/seller/products/1/edit">Laptop Asus ROG')
  })

  it('keeps the edit link when onDetail is not provided', () => {
    const html = render(products)
    expect(html).toContain('href="/seller/products/1/edit"')
  })
})
