import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from '../../contexts/authContext'
import RequireAuth from '../RequireAuth'
import { sanitizeReturnPath } from '../../utils/returnUrl'

function renderGuard({ user, authLoaded = true, entries = ['/seller/dashboard'] }) {
  return renderToStaticMarkup(
    createElement(
      AuthContext.Provider,
      { value: { user, authLoaded } },
      createElement(
        MemoryRouter,
        { initialEntries: entries },
        createElement(
          Routes,
          null,
          createElement(
            Route,
            { element: createElement(RequireAuth) },
            createElement(Route, {
              path: '/seller/dashboard',
              element: createElement('div', null, 'PROTECTED'),
            }),
          ),
        ),
      ),
    ),
  )
}

describe('RequireAuth', () => {
  it('renders nothing while the session is still loading', () => {
    const html = renderGuard({ user: null, authLoaded: false })
    expect(html).not.toContain('PROTECTED')
  })

  it('blocks guests from protected content', () => {
    const html = renderGuard({ user: null, authLoaded: true })
    expect(html).not.toContain('PROTECTED')
  })

  it('allows an authenticated account through', () => {
    const html = renderGuard({ user: { id: 1, hasStore: true }, authLoaded: true })
    expect(html).toContain('PROTECTED')
  })
})

describe('return URL guard used by RequireAuth', () => {
  it('keeps internal paths and drops external ones', () => {
    expect(sanitizeReturnPath('/seller/dashboard')).toBe('/seller/dashboard')
    expect(sanitizeReturnPath('//evil.example.com')).toBeNull()
  })
})
