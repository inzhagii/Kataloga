/**
 * Consumer test: StoreActions renders the WhatsApp primary action plus
 * Marketplace and Share inside the Store Information card. It is INLINE (never
 * a fixed/floating bar, no IntersectionObserver/show toggle): WhatsApp is its
 * own full-width row, Marketplace + Share sit side-by-side below. Share is
 * never in the navbar. Without channels the block keeps WhatsApp + Share
 * side-by-side (no Marketplace row). Uses react-dom/server (no DOM test
 * library) and React.createElement without JSX (Vitest include matches
 * *.test.js).
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

describe('StoreActions (inline actions)', () => {
  it('shows WhatsApp, Marketplace and Share when channels are configured', () => {
    const html = render({
      ...baseStore,
      channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }],
    })
    expect(html).toContain('Hubungi via WhatsApp')
    expect(html).toContain('Marketplace')
    expect(html).toContain('Bagikan')
  })

  it('renders the actions inline, not as a floating bar', () => {
    const html = render({
      ...baseStore,
      channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }],
    })
    expect(html).not.toContain('fixed inset-x-0 bottom-0')
    expect(html).not.toContain('pointer-events-none')
    expect(html).not.toContain('opacity-0')
    expect(html).not.toContain('translate-y-4')
  })

  it('keeps Share visible in the inline block (not hidden on any breakpoint)', () => {
    const html = render({
      ...baseStore,
      channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }],
    })
    expect(html).toContain('Bagikan')
    expect(html).not.toContain('hidden min-w-0 shrink-0 md:block')
  })

  it('stacks WhatsApp full-width on top with Marketplace and Share side-by-side below', () => {
    const html = render({
      ...baseStore,
      channels: [{ channelId: 'SHOPEE', url: 'https://shopee.co.id/example' }],
    })
    // Column container: WhatsApp is its own row, Marketplace + Share are a second row.
    expect(html).toContain('flex w-full flex-col items-stretch gap-2.5')
    const whatsappAt = html.indexOf('Hubungi via WhatsApp')
    const marketplaceAt = html.indexOf('Marketplace')
    const bagikanAt = html.indexOf('Bagikan')
    expect(whatsappAt).toBeGreaterThanOrEqual(0)
    expect(marketplaceAt).toBeGreaterThan(whatsappAt)
    expect(bagikanAt).toBeGreaterThan(marketplaceAt)
    // Both Marketplace and Share sit in equal-width (flex-1) slots on the row.
    expect(html.split('min-w-0 flex-1').length - 1).toBe(2)
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