import { afterEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  computeFloatingActionVisibility,
  useFloatingActionVisibility,
} from '../useFloatingActionVisibility'

describe('computeFloatingActionVisibility', () => {
  it('keeps the bar hidden while the header is visible', () => {
    expect(computeFloatingActionVisibility(true, false)).toBe(false)
    expect(computeFloatingActionVisibility(true, true)).toBe(false)
  })

  it('shows the bar once the header leaves the viewport while the footer is hidden', () => {
    expect(computeFloatingActionVisibility(false, false)).toBe(true)
  })

  it('hides again when the footer enters the viewport', () => {
    expect(computeFloatingActionVisibility(false, true)).toBe(false)
  })
})

/** Component using the hook, rendered SSR to exercise it in node env. */
function Probe({ headerRef, footerRef }) {
  const show = useFloatingActionVisibility(headerRef, footerRef)
  return React.createElement('div', { 'data-test-hook': String(show) })
}

describe('useFloatingActionVisibility', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to hidden when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const html = renderToStaticMarkup(
      React.createElement(Probe, { headerRef: { current: null }, footerRef: { current: null } }),
    )
    expect(html).toContain('data-test-hook="false"')
  })

  it('does not crash and stays hidden while the header element is still visible', () => {
    const header = { current: { id: 'header' } }
    const footer = { current: { id: 'footer' } }
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback) {
          this.callback = callback
        }

        observe() {}

        disconnect() {}
      },
    )
    const html = renderToStaticMarkup(
      React.createElement(Probe, { headerRef: header, footerRef: footer }),
    )
    expect(html).toContain('data-test-hook="false"')
  })
})