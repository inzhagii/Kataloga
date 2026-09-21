/**
 * Channel derivation for the Customer Interest UI (M5).
 * Cards come from WhatsApp + the store's configured external channels only;
 * historical channels stay as filter options. No hardcoded channel list and
 * no generic "Lainnya" card.
 */

import { describe, expect, it } from 'vitest'
import { INTEREST_TYPE } from '../../constants/enums'
import {
  buildChannelOptions,
  countByChannel,
  isAnyChannel,
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