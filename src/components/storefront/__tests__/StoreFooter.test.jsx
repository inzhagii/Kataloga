/**
 * Static rendering checks for the storefront footer (no DOM test library is
 * configured; react-dom/server is used for SSR-style assertions).
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import StoreFooter from '../StoreFooter'

function render(store = {}, props = {}) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <StoreFooter store={store} {...props} />
    </MemoryRouter>,
  )
}

const demoStore = {
  name: 'Toko Komputer Jaya',
  logoUrl: '/assets/mock/store-logo.svg',
  fullAddress: 'Jl. Dipatiukur No. 12, Cidadap, Kota Bandung, Jawa Barat 40132',
  channels: [
    { name: 'Shopee', url: 'https://shopee.co.id/toko-komputer-jaya' },
    { name: 'Tokopedia', url: 'https://www.tokopedia.com/toko-komputer-jaya' },
  ],
}

describe('StoreFooter', () => {
  it('shows WhatsApp as a normal footer contact item, never as a green button', () => {
    const html = render(demoStore, {
      onWhatsApp: () => {},
      onSelectChannel: () => {},
    })
    expect(html).toContain('WhatsApp')
    expect(html).not.toContain('bg-whatsapp')
  })

  it('renders a recognizable WhatsApp icon alongside the WhatsApp text', () => {
    const html = render(demoStore, { onWhatsApp: () => {} })
    expect(html).toContain('<svg')
    expect(html).toContain('WhatsApp')
  })

  it('lists the store external channels from the generic {name,url} model', () => {
    const html = render(demoStore, { onSelectChannel: () => {} })
    for (const channel of demoStore.channels) {
      expect(html).toContain(channel.name)
    }
  })

  it('shows the Alamat section with the full address when it exists', () => {
    const html = render(demoStore, {})
    expect(html).toContain('Alamat')
    expect(html).toContain(demoStore.fullAddress)
  })

  it('omits the Alamat section when the store has no full address', () => {
    const html = render({ name: 'Toko Tanpa Lokasi', channels: [] }, {})
    expect(html).not.toContain('Alamat')
    expect(html).toContain('Belum ada saluran marketplace.')
  })
})