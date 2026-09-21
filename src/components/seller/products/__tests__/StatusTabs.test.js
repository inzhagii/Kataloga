/**
 * Static rendering checks for the seller status tabs (M8): Active, Draft and
 * Sold Out only, plus Archive access linking to the existing archived route.
 * Uses react-dom/server and React.createElement (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import StatusTabs from '../StatusTabs'

function render() {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(StatusTabs, {
        tab: 'active',
        onTabChange: () => {},
        counts: { active: 2, drafts: 1, soldOut: 3 },
        archivedCount: 4,
      }),
    ),
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

  it('links the Archive access to the archived products route', () => {
    expect(render()).toContain('href="/seller/products/archived"')
  })
})
