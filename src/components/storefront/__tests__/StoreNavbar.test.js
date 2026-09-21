/**
 * Consumer test: StoreNavbar shows store logo/name + City/Province on the left
 * and Masuk/Daftar for guests or the profile menu for logged-in customers. It
 * never renders WhatsApp/Marketplace actions. Uses react-dom/server (no DOM
 * test library) and React.createElement without JSX.
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { renderToStaticMarkup } from 'react-dom/server'
import StoreNavbar from '../StoreNavbar'
import { AuthContext } from '../../../contexts/authContext'

function render(user, store) {
  return renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(
        AuthContext.Provider,
        { value: { user, logout: () => {} } },
        React.createElement(StoreNavbar, { store }),
      ),
    ),
  )
}

const baseStore = {
  storeId: 'toko-komputer-jaya',
  name: 'Toko Komputer Jaya',
  city: 'Bandung',
  province: 'Jawa Barat',
}

describe('StoreNavbar', () => {
  it('shows store name, City/Province and guest auth links', () => {
    const html = render(null, baseStore)
    expect(html).toContain('Toko Komputer Jaya')
    expect(html).toContain('Bandung, Jawa Barat')
    expect(html).toContain('Masuk')
    expect(html).toContain('Daftar')
    expect(html).not.toContain('Menu profil')
  })

  it('shows the profile menu instead of auth links when logged in', () => {
    const html = render({ id: 1, name: 'Budi', hasStore: false }, baseStore)
    expect(html).toContain('Menu profil')
    expect(html).not.toContain('Masuk')
    expect(html).not.toContain('Daftar')
  })

  it('prefers the store logo image when a logoUrl exists', () => {
    const html = render(null, { ...baseStore, logoUrl: 'https://cdn.example/logo.png' })
    expect(html).toContain('src="https://cdn.example/logo.png"')
    expect(html).toContain('alt="Logo Toko Komputer Jaya"')
  })

  it('does not render WhatsApp or Marketplace actions', () => {
    const html = render(null, baseStore)
    expect(html).not.toContain('WhatsApp')
    expect(html).not.toContain('Marketplace')
  })
})
