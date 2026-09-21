/**
 * Static rendering checks for the Products toolbar (M8): search + filter are
 * aligned, the active filter count excludes search text, the mobile Archive
 * slot renders, and there is no Sort control. Uses react-dom/server and
 * React.createElement (Vitest matches *.test.js).
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

  it('offers Reset only while filters or search are active', () => {
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

  it('renders the provided mobile Archive access next to the filter', () => {
    const html = render({
      archiveLink: React.createElement(
        'a',
        { href: '/seller/products/archived' },
        'ArchiveAccess',
      ),
    })
    expect(html).toContain('ArchiveAccess')
  })
})
