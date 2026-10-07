/**
 * Consumer test: StoreCtaOptionsSection (My Store) shows the store's reusable
 * CTA options with their labels. The permanent BUY/BARGAIN defaults always
 * render without a delete control and never disappear, while CUSTOM options
 * are deletable. Adding a CUSTOM option opens a modal/bottom-sheet (never a
 * dropdown). Uses react-dom/server and React.createElement (no DOM test
 * library; Vitest include matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import StoreCtaOptionsSection from '../StoreCtaOptionsSection'

function render(options, onOptionsChange = () => {}) {
  return renderToStaticMarkup(
    React.createElement(StoreCtaOptionsSection, { options, onOptionsChange }),
  )
}

describe('StoreCtaOptionsSection', () => {
  it('renders the section with the permanent default CTA options', () => {
    const html = render([])
    expect(html).toContain('Product CTA Options')
    expect(html).toContain('Beli')
    expect(html).toContain('Tawar')
  })

  it('renders configured CUSTOM options with their labels', () => {
    const html = render([
      { type: 'BUY', label: 'Beli' },
      { type: 'BARGAIN', label: 'Tawar' },
      { type: 'CUSTOM', label: 'Tanya Harga' },
    ])
    expect(html).toContain('Tanya Harga')
    expect(html).toContain('Custom')
  })

  it('labels built-in options as Default and never renders a delete control for them', () => {
    const html = render([
      { type: 'BUY', label: 'Beli' },
      { type: 'BARGAIN', label: 'Tawar' },
      { type: 'CUSTOM', label: 'Tanya Harga' },
    ])
    expect(html).toContain('Default')
    expect(html.indexOf('aria-label="Hapus opsi CTA Beli"')).toBe(-1)
    expect(html.indexOf('aria-label="Hapus opsi CTA Tawar"')).toBe(-1)
  })

  it('renders a delete control only for CUSTOM options', () => {
    const html = render([
      { type: 'BUY', label: 'Beli' },
      { type: 'BARGAIN', label: 'Tawar' },
      { type: 'CUSTOM', label: 'Tanya Harga' },
    ])
    expect(html).toContain('aria-label="Hapus opsi CTA Tanya Harga"')
    expect(html).not.toContain('aria-label="Hapus opsi CTA Beli"')
    expect(html).not.toContain('aria-label="Hapus opsi CTA Tawar"')
  })

  it('opens an add-option control that is not a dropdown', () => {
    const html = render([])
    expect(html).toContain('Tambah Opsi')
    expect(html).not.toContain('<select')
  })
})