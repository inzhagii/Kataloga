/**
 * Static rendering checks for the Products toolbar: search (full-width on
 * mobile, capped on desktop) + filter are aligned, the active filter count
 * excludes search text, the mobile Archive slot renders when provided, and
 * there is no Add Product action and no Sort control here. Archive is rendered
 * once per breakpoint: desktop via StatusTabs, mobile here via archiveLink.
 * Uses react-dom/server and React.createElement (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import ProductsToolbar from '../ProductsToolbar'

const noop = () => {}

function render(overrides = {}) {
  const props = {
    search: '',
    onSearch: noop,
    filters: { category: '', condition: '', brand: '', featured: '' },
    onFilterChange: noop,
    resetFilters: noop,
    hasActiveFilters: false,
    categories: [],
    brands: [],
    ...overrides,
  }
  return renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(ProductsToolbar, props)),
  )
}

describe('ProductsToolbar', () => {
  it('renders search and filter controls without a Sort control', () => {
    const html = render()
    expect(html).toContain('Cari produk')
    expect(html).toContain('Filter')
    expect(html).not.toContain('Sort')
  })

  it('caps the desktop search width (not full-width) while keeping it full-width on mobile', () => {
    const html = render()
    expect(html).toContain('sm:max-w-xl')
  })

  it('offers Reset only while filters are active', () => {
    expect(render()).not.toContain('aria-label="Reset filter dan pencarian"')
    expect(render({ hasActiveFilters: true })).toContain('aria-label="Reset filter dan pencarian"')
  })

  it('counts category, brand, condition and featured as active filters', () => {
    const html = render({
      filters: { category: 'Laptop', condition: 'NEW', brand: 'Asus', featured: 'featured' },
      hasActiveFilters: true,
    })
    expect(html).toContain('>4<')
  })

  it('does not count search text as a filter', () => {
    const html = render({ search: 'laptop', hasActiveFilters: true })
    expect(html).not.toContain('>1<')
  })

  it('renders the mobile Archive slot when provided', () => {
    const html = render({
      archiveLink: React.createElement('a', { href: '/seller/products/archived' }, 'Archive'),
    })
    expect(html).toContain('/seller/products/archived')
  })

  it('does not render an archive link or an Add Product action by default', () => {
    const html = render()
    expect(html).not.toContain('/seller/products/archived')
    expect(html).not.toContain('Tambah Produk')
    expect(html).not.toContain('/seller/products/new')
  })
})