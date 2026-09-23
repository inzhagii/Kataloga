/**
 * My Store external channels editor: channels are { channelId, url } references
 * resolved through the shared channel master, added via a modal/bottom-sheet
 * selector (never a dropdown). The channel name/logo render from the definition
 * and only the URL is typed. Per-channel URL errors surface inline.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ExternalChannelsEditor from '../ExternalChannelsEditor'
import { CMS_CHANNELS, CUSTOM_CHANNEL_LOGO } from '../../../../data/mock/channels'

const definitions = [
  ...CMS_CHANNELS,
  {
    id: 'CUSTOM:TOKO-SAYA',
    storeId: 'toko-komputer-jaya',
    name: 'Toko Saya',
    logo: CUSTOM_CHANNEL_LOGO,
    custom: true,
  },
]

function render(props) {
  return renderToStaticMarkup(
    <ExternalChannelsEditor
      channels={[]}
      definitions={definitions}
      errors={{}}
      onChange={() => {}}
      onCustomChannelCreate={() => {}}
      {...props}
    />,
  )
}

describe('ExternalChannelsEditor', () => {
  it('renders configured channels resolved from the master (name + logo)', () => {
    const html = render({
      channels: [
        { channelId: 'SHOPEE', url: 'https://shopee.co.id/toko-komputer-jaya' },
        { channelId: 'CUSTOM:TOKO-SAYA', url: 'https://example.com/toko-saya' },
      ],
    })
    expect(html).toContain('Shopee')
    expect(html).toContain('shopping_bag')
    expect(html).toContain('Toko Saya')
    expect(html).toContain(CUSTOM_CHANNEL_LOGO)
  })

  it('renders an empty state when no channel is configured', () => {
    const html = render({})
    expect(html).toContain('Belum ada channel')
  })

  it('opens the channel selector through a non-dropdown trigger', () => {
    const html = render({})
    expect(html).toContain('+ Tambah External Channel')
    expect(html).not.toContain('<select')
  })

  it('shows an inline URL-required error on the affected channel row', () => {
    const html = render({
      channels: [
        { channelId: 'SHOPEE', url: 'https://shopee.co.id/x' },
        { channelId: 'TOKOPEDIA', url: '' },
      ],
      errors: { 'channel-1': 'URL external wajib diisi.' },
    })
    expect(html).toContain('URL external wajib diisi.')
    expect(html).toMatch(/aria-invalid="true"/)
  })
})