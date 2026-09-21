/**
 * Consumer test: CustomerProfileMenu uses the generic user-circle icon and
 * collapses to nothing for guests (customers have no uploaded photo on V1).
 * The open menu links are exercised through the navbar; here we assert the
 * trigger stays accessible. Uses react-dom/server + AuthContext.Provider.
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import CustomerProfileMenu from '../CustomerProfileMenu'
import { AuthContext } from '../../../contexts/authContext'

function render(user) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(
        AuthContext.Provider,
        { value: { user, logout: () => {} } },
        React.createElement(CustomerProfileMenu),
      ),
    ),
  )
}

describe('CustomerProfileMenu', () => {
  it('renders nothing for guests', () => {
    expect(render(null)).toBe('')
  })

  it('renders an accessible user-circle trigger when logged in', () => {
    const html = render({ id: 1, name: 'Budi', hasStore: true })
    expect(html).toContain('account_circle')
    expect(html).toContain('aria-label="Menu profil"')
    expect(html).toContain('aria-haspopup="menu"')
    expect(html).toContain('aria-expanded="false"')
  })
})
