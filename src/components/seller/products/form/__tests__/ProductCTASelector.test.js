/**
 * Consumer test: ProductCTASelector lists the store's CTA options (Beli, Tawar,
 * plus any CUSTOM options with their configured labels), the product selects
 * exactly one and never creates a CTA. No "Tidak Ada" (every product always
 * has a CTA), no free-label input (that editing lives in My Store), and no
 * invented length rule. Uses react-dom/server and React.createElement (no DOM
 * test library; Vitest include matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductCTASelector from '../ProductCTASelector'

const storeOptions = [
  { type: 'BUY', label: 'Beli' },
  { type: 'BARGAIN', label: 'Tawar' },
  { type: 'CUSTOM', label: 'Tanya Harga' },
]

function render(form, options = storeOptions, setField = () => {}) {
  return renderToStaticMarkup(
    React.createElement(ProductCTASelector, { form, setField, options }),
  )
}

describe('ProductCTASelector', () => {
  it('renders every store CTA option with its label', () => {
    const html = render({})
    expect(html).toContain('Beli')
    expect(html).toContain('Tawar')
    expect(html).toContain('Tanya Harga')
  })

  it('defaults the BUY option as selected when the product has no CTA yet', () => {
    const html = render({})
    expect(html).toContain('Beli')
  })

  it('marks the selected option as pressed', () => {
    const html = render({ cta: { type: 'BARGAIN', label: 'Tawar' } })
    expect(html).toContain('aria-pressed="true"')
  })

  it('distinguishes CUSTOM options by their configured label', () => {
    const html = render({ cta: { type: 'CUSTOM', label: 'Tanya Harga' } })
    expect(html).toContain('aria-pressed="true"')
  })

  it('never offers "no CTA" nor a free-label input (CTA owned by My Store)', () => {
    const html = render({ cta: { type: 'CUSTOM', label: 'Tanya Harga' } })
    expect(html).not.toContain('Tidak Ada')
    expect(html).not.toContain('Label Tombol Custom')
    expect(html).not.toContain('maxlength')
  })

  it('falls back to the permanent defaults when the store has no options', () => {
    const html = render({}, [])
    expect(html).toContain('Beli')
    expect(html).toContain('Tawar')
  })
})