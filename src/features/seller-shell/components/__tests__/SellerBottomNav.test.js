/**
 * Static rendering checks for the mobile seller bottom navigation (M8):
 * exactly Dashboard, Products, Customer Interest plus More. Uses
 * react-dom/server and React.createElement (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import SellerBottomNav from '../SellerBottomNav'

function render() {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(SellerBottomNav, { onLogoutRequest: () => {} }),
    ),
  )
}

describe('SellerBottomNav', () => {
  it('renders the three primary features plus More', () => {
    const html = render()
    expect(html).toContain('>Dashboard<')
    expect(html).toContain('>Products<')
    expect(html).toContain('>Interest<')
    expect(html).toContain('>More<')
  })

  it('does not put secondary features or Archive in the primary bar', () => {
    const html = render()
    expect(html).not.toContain('>Recent Activity<')
    expect(html).not.toContain('>My Store<')
    expect(html).not.toContain('>Categories<')
    expect(html).not.toContain('>Archived<')
  })
})
