/**
 * Static rendering checks for the Dashboard Catalog Condition cards.
 * Sold Out is a seller-warning state and uses red (distinct from the gray
 * customer storefront treatment); Archived stays neutral/gray.
 * Uses react-dom/server and React.createElement (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import CatalogCondition from '../CatalogCondition'

function render() {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(CatalogCondition, {
        activeCount: 10,
        draftCount: 2,
        soldOutCount: 3,
        archivedCount: 4,
      }),
    ),
  )
}

describe('CatalogCondition', () => {
  it('renders the four locked catalog condition cards', () => {
    const html = render()
    expect(html).toContain('Active Products')
    expect(html).toContain('Draft')
    expect(html).toContain('Sold Out Products')
    expect(html).toContain('Archived Products')
  })

  it('treats Sold Out as a red seller warning state', () => {
    const html = render()
    expect(html).toContain('border-t-red-200')
    expect(html).toContain('bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white')
  })

  it('keeps Archived neutral gray', () => {
    const html = render()
    expect(html).toContain('border-t-slate-200')
    expect(html).toContain('bg-slate-100 text-slate-600 group-hover:bg-slate-500 group-hover:text-white')
  })
})