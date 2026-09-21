/**
 * Consumer test: StoreActions renders Marketplace only when the store has
 * configured channels; without channels it shows WhatsApp + Share side-by-side
 * (no disabled Marketplace button). Uses react-dom/server (no DOM test library)
 * and React.createElement without JSX (Vitest include matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import StoreActions from '../StoreActions'

function render(store) {
  return renderToStaticMarkup(
    React.createElement(StoreActions, {
      store,
      onWhatsApp: () => {},
      onSelectChannel: () => {},
      onShareStore: () => {},
    }),
  )
}

const baseStore = { storeId: 'toko-komputer-jaya', name: 'Toko Komputer Jaya' }

describe('StoreActions', () => {
  it('shows WhatsApp, Marketplace and Share when channels are configured', () => {
    const html = render({
      ...baseStore,
      channels: [{ name: 'Shopee', url: 'https://shopee.co.id/example' }],
    })
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Marketplace')
    expect(html).toContain('Bagikan')
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
