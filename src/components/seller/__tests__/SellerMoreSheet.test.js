/**
 * Static rendering checks for the mobile More sheet (M8): secondary features
 * in the locked order plus Logout, and no Archive entry. Uses react-dom/server
 * and React.createElement inside a MemoryRouter (Vitest matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import SellerMoreSheet from '../SellerMoreSheet'

function render() {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(SellerMoreSheet, {
        open: true,
        onClose: () => {},
        onLogoutRequest: () => {},
      }),
    ),
  )
}

describe('SellerMoreSheet', () => {
  it('lists Recent Activity, My Store, Categories and Profile in order', () => {
    const html = render()
    const order = ['Recent Activity', 'My Store', 'Categories', 'Profile']
    const positions = order.map((label) => html.indexOf(`>${label}<`))
    positions.forEach((position) => expect(position).toBeGreaterThan(-1))
    for (let index = 1; index < positions.length; index += 1) {
      expect(positions[index]).toBeGreaterThan(positions[index - 1])
    }
  })

  it('includes Logout after the feature links', () => {
    const html = render()
    expect(html.indexOf('>Logout<')).toBeGreaterThan(html.indexOf('>Profile<'))
  })

  it('never exposes Archive', () => {
    expect(render()).not.toContain('>Archived<')
  })
})
