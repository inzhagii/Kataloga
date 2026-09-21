/**
 * Static rendering checks for the seller products empty states (M8): the
 * filtered-empty state uses the locked copy and a Reset Filter action. Uses
 * react-dom/server and React.createElement (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import EmptyProducts from '../EmptyProducts'

function render(variant, action) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(EmptyProducts, { variant, action }),
    ),
  )
}

describe('EmptyProducts', () => {
  it('shows the locked filtered-empty copy with a Reset Filter action', () => {
    const html = render(
      'search',
      React.createElement('button', { type: 'button' }, 'Reset Filter'),
    )
    expect(html).toContain('Tidak ada produk yang ditemukan.')
    expect(html).toContain('Reset Filter')
  })

  it('keeps the base empty state offering Add Product', () => {
    const html = render('none')
    expect(html).toContain('+ Tambah Product')
    expect(html).toContain('Lengkapi Informasi Toko')
  })
})
