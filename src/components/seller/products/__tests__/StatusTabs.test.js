/**
 * Static rendering checks for the seller status tabs (M8): Active, Draft and
 * Sold Out only, with Archive as a navigation item right-aligned via the
 * optional archiveLink slot (desktop) and absent on mobile. Sold Out is a
 * seller-warning state and carries the red chip; the customer storefront uses
 * gray instead.
 * Uses react-dom/server and React.createElement (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import StatusTabs from '../StatusTabs'

function render(tab = 'active', archiveLink = null) {
  return renderToStaticMarkup(
    React.createElement(StatusTabs, {
      tab,
      onTabChange: () => {},
      counts: { active: 2, drafts: 1, soldOut: 3 },
      archiveLink,
    }),
  )
}

describe('StatusTabs', () => {
  it('renders exactly Active, Draft and Sold Out as tabs', () => {
    const html = render()
    expect(html).toContain('>Active<')
    expect(html).toContain('>Draft<')
    expect(html).toContain('>Sold Out<')
    expect(html.split('role="tab"').length - 1).toBe(3)
  })

  it('marks the active tab programmatically', () => {
    const html = render()
    expect(html).toContain('role="tab"')
    expect(html).toContain('aria-selected="true"')
  })

  it('renders the archive nav item on desktop only when the slot is provided', () => {
    expect(render()).not.toContain('/seller/products/archived')
    const html = render('active', React.createElement('a', { href: '/seller/products/archived' }, 'Archive'))
    expect(html).toContain('/seller/products/archived')
    expect(html).toContain('hidden pb-3 sm:block')
  })

  it('uses the red chip for the Sold Out status', () => {
    const html = render()
    expect(html).toContain('text-red-600')
  })
})