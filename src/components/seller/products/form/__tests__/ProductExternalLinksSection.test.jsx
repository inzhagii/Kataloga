/**
 * Product External Links section: links are { channelId, url } references
 * resolved through the shared channel master. Channels are picked from a
 * modal/bottom-sheet selector (never a dropdown); the section only edits URLs.
 * Per-link URL errors surface inline.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductExternalLinksSection from '../ProductExternalLinksSection'
import { CMS_CHANNELS, CUSTOM_CHANNEL_LOGO } from '../../../../../data/mock/channels'

function render(props) {
  return renderToStaticMarkup(
    <ProductExternalLinksSection
      form={{ externalLinks: [] }}
      errors={{}}
      channelDefinitions={CMS_CHANNELS}
      addExternalLink={() => {}}
      updateExternalLink={() => {}}
      removeExternalLink={() => {}}
      {...props}
    />,
  )
}

describe('ProductExternalLinksSection', () => {
  it('renders configured links resolved to name + logo from the master', () => {
    const html = render({
      form: {
        externalLinks: [
          { channelId: 'SHOPEE', url: 'https://shopee.co.id/x' },
          { channelId: 'TOKOPEDIA', url: '' },
        ],
      },
    })
    expect(html).toContain('Shopee')
    expect(html).toContain('shopping_bag')
    expect(html).toContain('Tokopedia')
    expect(html).not.toContain('<select')
  })

  it('renders an empty state when no link is configured', () => {
    const html = render({})
    expect(html).toContain('Tidak ada link')
    expect(html).toContain('+ Tambah Link')
  })

  it('keeps a selected custom channel readable through the store definitions', () => {
    const definitions = [
      ...CMS_CHANNELS,
      { id: 'CUSTOM:WEB', storeId: 's', name: 'Website Sendiri', logo: CUSTOM_CHANNEL_LOGO, custom: true },
    ]
    const html = render({
      form: { externalLinks: [{ channelId: 'CUSTOM:WEB', url: 'https://example.com' }] },
      channelDefinitions: definitions,
    })
    expect(html).toContain('Website Sendiri')
    expect(html).toContain(CUSTOM_CHANNEL_LOGO)
  })

  it('shows an inline URL-required error on the affected link row', () => {
    const html = render({
      form: {
        externalLinks: [
          { channelId: 'SHOPEE', url: 'https://shopee.co.id/x' },
          { channelId: 'TOKOPEDIA', url: '' },
        ],
      },
      errors: { 'channel-1': 'URL external wajib diisi.' },
    })
    expect(html).toContain('URL external wajib diisi.')
    expect(html).toMatch(/aria-invalid="true"/)
  })
})