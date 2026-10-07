/**
 * Static rendering checks for the desktop seller product table (M8): locked
 * columns Product / Category / Brand / Status / Actions and no SKU or
 * availability columns. Uses react-dom/server (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import ProductTable from '../ProductTable'

const noop = () => {}

function render(products) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ProductTable, {
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
    featured: true,
    storeId: 'toko-komputer-jaya',
  },
  {
    id: 2,
    name: 'Mouse Basic',
    category: 'Aksesoris',
    brand: '',
    condition: 'SECOND',
    priceValue: 100000,
    status: 'DRAFT',
    featured: false,
    storeId: 'toko-komputer-jaya',
  },
]

describe('ProductTable', () => {
  it('renders the locked columns including Brand', () => {
    const html = render(products)
    expect(html).toContain('>Produk<')
    expect(html).toContain('>Kategori<')
    expect(html).toContain('>Brand<')
    expect(html).toContain('>Status<')
    expect(html).toContain('>Aksi<')
  })

  it('shows each product brand and a neutral placeholder when empty', () => {
    const html = render(products)
    expect(html).toContain('Asus')
    expect(html).toContain('—')
  })

  it('does not add SKU or availability columns', () => {
    const html = render(products)
    expect(html).not.toContain('SKU')
    expect(html).not.toContain('Availability')
  })

  it('renders the name as a button that routes to onDetail when provided', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(ProductTable, {
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
