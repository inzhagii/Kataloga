/**
 * Channel derivation for the Customer Interest UI (M5).
 * Cards come from WhatsApp + the store's configured external channels only;
 * historical channels stay as filter options. No hardcoded channel list and
 * no generic "Lainnya" card.
 */

import { describe, expect, it } from 'vitest'
import { INTEREST_TYPE } from '../../constants/enums'
import { CMS_CHANNELS, CUSTOM_CHANNEL_LOGO } from '../../data/mock/channels'
import { listStoreChannelDefinitions } from '../channels'
import {
  buildChannelOptions,
  countByChannel,
  isAnyChannel,
  resolveInterestChannel,
} from '../customerInterestChannels'
import { FILTER_ALL } from '../customerInterestFilter'

function interest(overrides = {}) {
  return {
    id: 1,
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'Shopee',
    date: '2026-09-01T12:00:00.000Z',
    ...overrides,
  }
}

const aStore = {
  storeId: 'toko-komputer-jaya',
  name: 'Toko Komputer Jaya',
  channels: [
    { channelId: 'SHOPEE', url: 'https://shopee.co.id/toko-komputer-jaya' },
    { channelId: 'TOKOPEDIA', url: 'https://www.tokopedia.com/toko-komputer-jaya' },
  ],
  customChannels: [{ id: 'CUSTOM:TOKO-SAYA', storeId: 'toko-komputer-jaya', name: 'Toko Saya', logo: CUSTOM_CHANNEL_LOGO, custom: true }],
}

describe('buildChannelOptions', () => {
  it('always lists WhatsApp first as a current card', () => {
    const { current } = buildChannelOptions({ interests: [], channels: [] })
    expect(current).toHaveLength(1)
    expect(current[0].name).toBe('WhatsApp')
    expect(current[0].kind).toBe(INTEREST_TYPE.WHATSAPP_CLICK)
    expect(current[0].isCurrent).toBe(true)
  })

  it('adds the configured external channels right after WhatsApp', () => {
    const channels = [{ name: 'Website', url: 'https://x.dev' }, { name: 'Instagram', url: 'https://ig' }]
    const { current } = buildChannelOptions({ interests: [], channels })
    expect(current.map((option) => option.name)).toEqual(['WhatsApp', 'Website', 'Instagram'])
  })

  it('treats channel names as arbitrary and dedupes them', () => {
    const channels = [
      { name: 'Tokoq', url: 'https://a' },
      { name: 'WhatsApp', url: 'https://b' },
      { name: 'Tokoq', url: 'https://c' },
    ]
    const { current } = buildChannelOptions({ interests: [], channels })
    expect(current.map((option) => option.name)).toEqual(['WhatsApp', 'Tokoq'])
  })

  it('keeps deleted (historical) channels as options but never as cards', () => {
    const interests = [
      interest({ id: 1, channel: 'Lazada' }),
      interest({ id: 2, channel: 'Tokopedia' }),
    ]
    const { current, historical, all } = buildChannelOptions({
      interests,
      channels: [{ name: 'Shopee', url: 'https://s' }],
    })
    expect(current.map((option) => option.name)).toEqual(['WhatsApp', 'Shopee'])
    expect(historical.map((option) => option.name)).toEqual(['Lazada', 'Tokopedia'])
    expect(all.map((option) => option.name)).toEqual([
      'WhatsApp',
      'Shopee',
      'Lazada',
      'Tokopedia',
    ])
    expect(all.every((option) => option.name !== 'Lainnya')).toBe(true)
  })

  it('dedupes historical channels that are still configured', () => {
    const interests = [
      interest({ id: 1, channel: 'Shopee' }),
      interest({ id: 2, channel: 'Lazada' }),
    ]
    const { current, historical } = buildChannelOptions({
      interests,
      channels: [{ name: 'Shopee', url: 'https://s' }],
    })
    expect(current.map((option) => option.name)).toEqual(['WhatsApp', 'Shopee'])
    expect(historical.map((option) => option.name)).toEqual(['Lazada'])
  })
})

describe('countByChannel', () => {
  it('counts interest records by their channel snapshot (case insensitive)', () => {
    const interests = [
      interest({ id: 1, channel: 'WhatsApp' }),
      interest({ id: 2, channel: 'Shopee' }),
      interest({ id: 3, channel: 'whatsapp' }),
    ]
    expect(countByChannel(interests, 'WhatsApp')).toBe(2)
    expect(countByChannel(interests, 'Shopee')).toBe(1)
    expect(countByChannel(interests, 'Lazada')).toBe(0)
    expect(countByChannel(interests, '')).toBe(0)
  })
})

describe('isAnyChannel', () => {
  it('treats null, undefined and FILTER_ALL as the no-filter state', () => {
    expect(isAnyChannel(null)).toBe(true)
    expect(isAnyChannel(undefined)).toBe(true)
    expect(isAnyChannel(FILTER_ALL)).toBe(true)
    expect(isAnyChannel('Shopee')).toBe(false)
  })
})

describe('buildChannelOptions with shared channel refs', () => {
  it('resolves store channel refs to names + logos through the shared master', () => {
    const { current } = buildChannelOptions({
      interests: [],
      channels: aStore.channels,
      definitions: CMS_CHANNELS,
    })
    expect(current.map((option) => option.name)).toEqual(['WhatsApp', 'Shopee', 'Tokopedia'])
    expect(current.find((option) => option.name === 'Shopee')?.logo).toBe('shopping_bag')
    expect(current.find((option) => option.name === 'Tokopedia')?.logo).toBe('storefront')
    expect(current.find((option) => option.name === 'Shopee')?.channelId).toBe('SHOPEE')
    expect(current.find((option) => option.name === 'WhatsApp')?.logo).toBeNull()
  })

  it('resolves a custom channel ref through the store definitions set', () => {
    const definitions = listStoreChannelDefinitions(aStore, CMS_CHANNELS)
    const { current } = buildChannelOptions({
      interests: [],
      channels: [{ channelId: 'CUSTOM:TOKO-SAYA', url: 'https://toko-saya.example' }],
      definitions,
    })
    expect(current.map((option) => option.name)).toEqual(['WhatsApp', 'Toko Saya'])
    expect(current.find((option) => option.name === 'Toko Saya')?.logo).toBe(CUSTOM_CHANNEL_LOGO)
  })

  it('still accepts legacy plain { name, url } channel entries', () => {
    const channels = [{ name: 'Website', url: 'https://x.dev' }]
    const { current } = buildChannelOptions({ interests: [], channels, definitions: CMS_CHANNELS })
    expect(current.map((option) => option.name)).toEqual(['WhatsApp', 'Website'])
    expect(current.find((option) => option.name === 'Website')?.logo).toBe('link')
  })

  it('gives historical channels a definition logo when one matches by name', () => {
    const interests = [interest({ id: 1, channel: 'Lazada' })]
    const { historical } = buildChannelOptions({
      interests,
      channels: [],
      definitions: CMS_CHANNELS,
    })
    expect(historical.map((option) => option.name)).toEqual(['Lazada'])
    expect(historical[0].logo).toBe('local_mall')
  })
})

describe('resolveInterestChannel', () => {
  const tokopediaDefinition = { id: 'TOKOPEDIA', name: 'Tokopedia', logo: 'storefront' }

  it('keeps WhatsApp as its own display', () => {
    const result = resolveInterestChannel(
      { channelType: INTEREST_TYPE.WHATSAPP_CLICK, channel: 'WhatsApp' },
      CMS_CHANNELS,
    )
    expect(result).toEqual({ name: 'WhatsApp', logo: null, isWhatsApp: true })
  })

  it('resolves a channelId reference to the shared definition name and logo', () => {
    const result = resolveInterestChannel(
      { channelType: INTEREST_TYPE.MARKETPLACE_CLICK, channel: '', channelId: 'TOKOPEDIA' },
      CMS_CHANNELS,
    )
    expect(result).toEqual({ name: 'Tokopedia', logo: 'storefront', isWhatsApp: false })
  })

  it('keeps the legacy channel name snapshot when there is no channelId', () => {
    const result = resolveInterestChannel(
      { channelType: INTEREST_TYPE.MARKETPLACE_CLICK, channel: 'Shopee' },
      CMS_CHANNELS,
    )
    expect(result).toEqual({ name: 'Shopee', logo: 'shopping_bag', isWhatsApp: false })
  })

  it('matches the legacy name against a definition logo when the id is absent', () => {
    const result = resolveInterestChannel(
      { channelType: INTEREST_TYPE.MARKETPLACE_CLICK, channel: 'tokopedia' },
      [tokopediaDefinition],
    )
    expect(result.name).toBe('tokopedia')
    expect(result.logo).toBe('storefront')
  })

  it('falls back to the name snapshot + preset icon for an unresolvable channelId', () => {
    const result = resolveInterestChannel(
      { channelType: INTEREST_TYPE.MARKETPLACE_CLICK, channel: 'Shopee', channelId: 'UNKNOWN' },
      CMS_CHANNELS,
    )
    expect(result.name).toBe('Shopee')
    expect(result.logo).toBe('shopping_bag')
  })

  it('defaults a legacy empty channel name to Marketplace with a generic icon', () => {
    const result = resolveInterestChannel(
      { channelType: INTEREST_TYPE.MARKETPLACE_CLICK, channel: null },
      [],
    )
    expect(result.name).toBe('Marketplace')
    expect(result.logo).toBe('link')
  })
})