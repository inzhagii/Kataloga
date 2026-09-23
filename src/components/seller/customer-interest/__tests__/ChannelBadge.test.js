/**
 * Consumer test: the Customer Interest channel badge resolves its name and
 * icon through the shared channel master when a channelId is present, and
 * keeps the legacy name-snapshot fallback otherwise. Uses react-dom/server
 * (no DOM test library is configured) and React.createElement to avoid JSX in
 * a .test.js file (the Vitest include pattern only matches *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ChannelBadge from '../ChannelBadge'
import { CMS_CHANNELS, CUSTOM_CHANNEL_LOGO } from '../../../../data/mock/channels'
import { INTEREST_TYPE } from '../../../../constants/enums'

function render(props) {
  return renderToStaticMarkup(React.createElement(ChannelBadge, props))
}

describe('ChannelBadge', () => {
  it('renders the WhatsApp treatment for a WhatsApp click', () => {
    const html = render({ channelType: INTEREST_TYPE.WHATSAPP_CLICK, channel: 'WhatsApp' })
    expect(html).toContain('WhatsApp Click')
  })

  it('resolves a channelId reference through the shared channel master', () => {
    const html = render({
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: '',
      channelId: 'TOKOPEDIA',
      definitions: CMS_CHANNELS,
    })
    expect(html).toContain('Tokopedia')
    expect(html).toContain('>storefront<')
  })

  it('keeps the legacy channel name snapshot with its definition logo', () => {
    const html = render({
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: 'Shopee',
      definitions: CMS_CHANNELS,
    })
    expect(html).toContain('Shopee')
    expect(html).toContain('>shopping_bag<')
  })

  it('falls back to the preset icon when no definition matches the name', () => {
    const html = render({ channelType: INTEREST_TYPE.MARKETPLACE_CLICK, channel: 'Lazada' })
    expect(html).toContain('Lazada')
    expect(html).toContain('>local_mall<')
  })

  it('defaults a missing channel to Marketplace with a generic icon', () => {
    const html = render({ channelType: INTEREST_TYPE.MARKETPLACE_CLICK, channel: null, definitions: [] })
    expect(html).toContain('Marketplace')
    expect(html).toContain(`>${CUSTOM_CHANNEL_LOGO}<`)
  })
})