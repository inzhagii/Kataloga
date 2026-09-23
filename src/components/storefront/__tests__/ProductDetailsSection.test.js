/**
 * Consumer test: ProductDetailsSection lists product attributes and does NOT
 * repeat the Category (it lives next to Condition under the price in
 * ProductInfo). Long detail lists collapse to a preview by default with a
 * "Lihat selengkapnya" toggle; empty details render a neutral hint, never a
 * blank card. Uses react-dom/server (static markup only — expanded state is
 * exercised in the live component).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductDetailsSection from '../ProductDetailsSection'

function render(product) {
  return renderToStaticMarkup(React.createElement(ProductDetailsSection, { product }))
}

function manyDetails(count) {
  return Array.from({ length: count }, (_, index) => ({
    label: `Atribut ${index + 1}`,
    value: `Nilai ${index + 1}`,
  }))
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

  it('keeps short detail lists fully expanded without a toggle', () => {
    const html = render({ category: 'Komputer', details: manyDetails(5) })
    expect(html).toContain('Atribut 5')
    expect(html).not.toContain('Lihat selengkapnya')
    expect(html).not.toContain('Tutup')
  })

  it('collapses long detail lists to a preview with a Lihat selengkapnya toggle', () => {
    const html = render({ category: 'Komputer', details: manyDetails(7) })
    expect(html).toContain('Atribut 1')
    expect(html).toContain('Atribut 5')
    expect(html).toContain('Lihat selengkapnya')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('Atribut 6')
    expect(html).not.toContain('Atribut 7')
  })
})
