import { describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../../contexts/authContext'
import SellerEntryGate from '../SellerEntryGate'

const navigateSpy = vi.fn((props) => createElement('div', null, `REDIRECT:${props.to}`))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Navigate: (props) => navigateSpy(props),
  }
})

function renderGate({ user, authLoaded = true }) {
  navigateSpy.mockClear()
  return renderToStaticMarkup(
    createElement(
      AuthContext.Provider,
      { value: { user, authLoaded } },
      createElement(
        MemoryRouter,
        { initialEntries: ['/seller'] },
        createElement(SellerEntryGate, null),
      ),
    ),
  )
}

describe('SellerEntryGate', () => {
  it('renders nothing while the session is still loading', () => {
    const html = renderGate({ user: null, authLoaded: false })
    expect(html).not.toContain('REDIRECT:')
  })

  it('sends guests to /login with the /seller return path', () => {
    const html = renderGate({ user: null, authLoaded: true })
    expect(html).toContain('REDIRECT:/login?returnUrl=%2Fseller')
  })

  it('sends an authenticated account without a store to /create-store', () => {
    const html = renderGate({ user: { id: 1, hasStore: false }, authLoaded: true })
    expect(html).toContain('REDIRECT:/create-store')
  })

  it('sends an authenticated account with a store to /seller/dashboard', () => {
    const html = renderGate({ user: { id: 1, hasStore: true, storeId: 'toko' }, authLoaded: true })
    expect(html).toContain('REDIRECT:/seller/dashboard')
  })
})