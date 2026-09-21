/**
 * Consumer test: ProductDetailsSection lists product attributes and does NOT
 * repeat the Category (it lives next to Condition under the price in
 * ProductInfo). Empty details render a neutral hint, never a blank card.
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductDetailsSection from '../ProductDetailsSection'

function render(product) {
  return renderToStaticMarkup(React.createElement(ProductDetailsSection, { product }))
}

describe('ProductDetailsSection', () => {
  it('renders detail attributes without repeating the category', () => {
    const html = render({
      category: 'Komputer',
      details: [
        { label: 'RAM', value: '16GB' },
        { label: 'Penyimpanan', value: '512GB SSD' },
      ],
    })
    expect(html).toContain('Detail Produk')
    expect(html).toContain('RAM')
    expect(html).toContain('16GB')
    expect(html).toContain('512GB SSD')
    expect(html).not.toContain('Komputer')
  })

  it('renders a neutral hint when there are no details', () => {
    const html = render({ category: 'Komputer', details: [] })
    expect(html).toContain('Belum ada detail produk.')
  })
})
