/**
 * Static rendering checks for the desktop seller sidebar (M8): locked item
 * order, Kataloga brand link, Account Card and Logout placement, and Archive
 * never being a navigation item. Uses react-dom/server (no DOM test library)
 * and React.createElement inside a MemoryRouter (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import SellerSidebar from '../SellerSidebar'

function render() {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(SellerSidebar, {
        store: { name: 'Toko Komputer Jaya' },
        onLogoutRequest: () => {},
      }),
    ),
  )
}

function indexOfLabel(html, label) {
  return html.indexOf(`>${label}<`)
}

describe('SellerSidebar', () => {
  it('links the Kataloga brand to the Dashboard', () => {
    const html = render()
    expect(html).toContain('aria-label="Kataloga Dashboard"')
    expect(html).toContain('href="/seller/dashboard"')
  })

  it('renders the locked feature order with Categories last', () => {
    const html = render()
    const order = [
      'Dashboard',
      'Products',
      'Customer Interest',
      'Recent Activity',
      'My Store',
      'Categories',
    ]
    const positions = order.map((label) => indexOfLabel(html, label))
    positions.forEach((position) => expect(position).toBeGreaterThan(-1))
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index]).toBeGreaterThan(positions[index - 1])
    }
  })

  it('links the Account Card to the Profile route and shows the store name', () => {
    const html = render()
    expect(html).toContain('href="/seller/account"')
    expect(html).toContain('Toko Komputer Jaya')
  })

  it('keeps Logout after the Account Card', () => {
    const html = render()
    expect(indexOfLabel(html, 'Logout')).toBeGreaterThan(html.indexOf('href="/seller/account"'))
  })

  it('never exposes Archive', () => {
    const html = render()
    expect(html).not.toContain('>Archive<')
    expect(html).not.toContain('>Archived<')
  })
})
