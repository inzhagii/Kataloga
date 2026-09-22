/**
 * Consumer test: StoreActions (floating action bar) shows the WhatsApp primary
 * action plus Marketplace only when the store has configured channels, and
 * Share only in the desktop layout (hidden mobile). Visibility is controlled
 * by the `show` prop (aria-hidden + opacity), so markup stays renderable for
 * SSR assertions. Uses react-dom/server (no DOM test library) and
 * React.createElement without JSX (Vitest include matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import StoreActions from '../StoreActions'

function render(store, show = true) {
  return renderToStaticMarkup(
    React.createElement(StoreActions, {
      store,
      show,
      onWhatsApp: () => {},
      onSelectChannel: () => {},
      onShareStore: () => {},
    }),
  )
}

const baseStore = { storeId: 'toko-komputer-jaya', name: 'Toko Komputer Jaya' }

describe('StoreActions (floating action bar)', () => {
  it('shows WhatsApp, Marketplace and Share when channels are configured', () => {
    const html = render({
      ...baseStore,
      channels: [{ name: 'Shopee', url: 'https://shopee.co.id/example' }],
    })
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Marketplace')
    expect(html).toContain('Bagikan')
  })

  it('hides the bar when show=false (aria-hidden)', () => {
    const html = render(
      { ...baseStore, channels: [{ name: 'Shopee', url: 'https://shopee.co.id/example' }] },
      false,
    )
    expect(html).toContain('aria-hidden="true"')
  })

  it('shows WhatsApp and Share (no Marketplace) when there are no channels', () => {
    const html = render({ ...baseStore, channels: [] })
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Bagikan')
    expect(html).not.toContain('Marketplace')
  })

  it('treats a missing channels field as no channels', () => {
    const html = render(baseStore)
    expect(html).not.toContain('Marketplace')
    expect(html).toContain('Hubungi via WhatsApp')
  })
})