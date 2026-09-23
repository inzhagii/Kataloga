/**
 * External channel reference helpers (docs/PRODUCT.md §16).
 * Store channels and Product external links are persisted as { channelId, url }
 * references over the shared channel master; name/logo never duplicate into
 * records. Custom channels are seller-created and store-scoped.
 */

import { describe, expect, it } from 'vitest'
import { CHANNEL_SOURCE } from '../../constants/enums'
import { CMS_CHANNELS, CUSTOM_CHANNEL_LOGO, CUSTOM_CHANNEL_ID_PREFIX } from '../../data/mock/channels'
import {
  CUSTOM_CHANNEL_NAME_DUPLICATE,
  EXTERNAL_URL_REQUIRED,
  buildCustomChannelDefinition,
  channelDefinitionSource,
  hasDuplicateChannelId,
  isChannelRef,
  isCustomChannelDefinition,
  listStoreChannelDefinitions,
  resolveChannelDefinition,
  resolveChannelRefsForDisplay,
  validateChannelRefs,
} from '../channels'

const customDefinition = {
  id: `${CUSTOM_CHANNEL_ID_PREFIX}TOKO-SAYA`,
  storeId: 'toko-komputer-jaya',
  name: 'Toko Saya',
  logo: CUSTOM_CHANNEL_LOGO,
  custom: true,
}

const aStore = {
  storeId: 'toko-komputer-jaya',
  name: 'Toko Komputer Jaya',
  channels: [
    { channelId: 'SHOPEE', url: 'https://shopee.co.id/toko-komputer-jaya' },
    { channelId: 'TOKOPEDIA', url: 'https://www.tokopedia.com/toko-komputer-jaya' },
  ],
  customChannels: [customDefinition],
}

const bStore = {
  storeId: 'techspace-bandung',
  name: 'TechSpace Bandung',
  channels: [{ channelId: 'TOKOPEDIA', url: 'https://www.tokopedia.com/techspace-bandung' }],
  customChannels: [],
}

describe('channel references', () => {
  it('recognizes persisted { channelId, url } references only', () => {
    expect(isChannelRef({ channelId: 'SHOPEE', url: 'https://x' })).toBe(true)
    expect(isChannelRef({ channelId: '', url: 'https://x' })).toBe(false)
    expect(isChannelRef({ name: 'Shopee', url: 'https://x' })).toBe(false)
    expect(isChannelRef(null)).toBe(false)
    expect(isChannelRef(undefined)).toBe(false)
  })

  it('detects duplicate channel references within one configuration', () => {
    expect(
      hasDuplicateChannelId([
        { channelId: 'SHOPEE', url: 'a' },
        { channelId: 'SHOPEE', url: 'b' },
      ]),
    ).toBe(true)
    expect(
      hasDuplicateChannelId([
        { channelId: 'SHOPEE', url: 'a' },
        { channelId: 'TOKOPEDIA', url: 'b' },
      ]),
    ).toBe(false)
    expect(hasDuplicateChannelId([])).toBe(false)
  })

  it('resolves a reference against the available channel definitions', () => {
    expect(resolveChannelDefinition('SHOPEE', CMS_CHANNELS)?.name).toBe('Shopee')
    expect(resolveChannelDefinition('LAZADA', CMS_CHANNELS)).toEqual(CMS_CHANNELS.find((d) => d.id === 'LAZADA'))
    expect(resolveChannelDefinition('CUSTOM:TOKO-SAYA', CMS_CHANNELS)).toBeNull()
    expect(resolveChannelDefinition('UNKNOWN', [])).toBeNull()
  })
})

describe('channel definitions (shared master + custom)', () => {
  it('exposes exactly the three locked CMS channels, each with logo metadata', () => {
    expect(CMS_CHANNELS).toHaveLength(3)
    expect(CMS_CHANNELS.map((definition) => definition.name)).toEqual([
      'Shopee',
      'Tokopedia',
      'Lazada',
    ])
    for (const definition of CMS_CHANNELS) {
      expect(definition.id).toBeTruthy()
      expect(definition.logo).toBeTruthy()
    }
  })

  it('flags seller-created definitions as custom and CMS definitions as CMS', () => {
    expect(isCustomChannelDefinition(customDefinition)).toBe(true)
    expect(isCustomChannelDefinition(CMS_CHANNELS[0])).toBe(false)
    expect(channelDefinitionSource(customDefinition)).toBe(CHANNEL_SOURCE.CUSTOM)
    expect(channelDefinitionSource(CMS_CHANNELS[0])).toBe(CHANNEL_SOURCE.CMS)
  })

  it('lists CMS channels plus the store custom channels as the store-available set', () => {
    const storeADefinitions = listStoreChannelDefinitions(aStore, CMS_CHANNELS)
    expect(storeADefinitions.map((definition) => definition.id)).toEqual([
      'SHOPEE',
      'TOKOPEDIA',
      'LAZADA',
      'CUSTOM:TOKO-SAYA',
    ])

    const storeBDefinitions = listStoreChannelDefinitions(bStore, CMS_CHANNELS)
    expect(storeBDefinitions.map((definition) => definition.id)).toEqual([
      'SHOPEE',
      'TOKOPEDIA',
      'LAZADA',
    ])
  })

  it('keeps custom channels store-scoped: Store A customs never appear in Store B set', () => {
    const storeBDefinitions = listStoreChannelDefinitions(bStore, CMS_CHANNELS)
    expect(storeBDefinitions.some((definition) => definition.id === 'CUSTOM:TOKO-SAYA')).toBe(false)
    expect(bStore.channels.some((ref) => ref.channelId === 'CUSTOM:TOKO-SAYA')).toBe(false)
  })
})

describe('resolveChannelRefsForDisplay', () => {
  it('resolves CMS references to name + logo display records', () => {
    const result = resolveChannelRefsForDisplay(
      [
        { channelId: 'SHOPEE', url: 'https://shopee.co.id/x' },
        { channelId: 'TOKOPEDIA', url: 'https://www.tokopedia.com/y' },
      ],
      CMS_CHANNELS,
    )
    expect(result).toEqual([
      { channelId: 'SHOPEE', url: 'https://shopee.co.id/x', name: 'Shopee', logo: 'shopping_bag' },
      {
        channelId: 'TOKOPEDIA',
        url: 'https://www.tokopedia.com/y',
        name: 'Tokopedia',
        logo: 'storefront',
      },
    ])
  })

  it('resolves a store custom channel through the store definitions set', () => {
    const definitions = listStoreChannelDefinitions(aStore, CMS_CHANNELS)
    const result = resolveChannelRefsForDisplay(
      [{ channelId: 'CUSTOM:TOKO-SAYA', url: 'https://example.com/toko-saya' }],
      definitions,
    )
    expect(result).toEqual([
      {
        channelId: 'CUSTOM:TOKO-SAYA',
        url: 'https://example.com/toko-saya',
        name: 'Toko Saya',
        logo: CUSTOM_CHANNEL_LOGO,
      },
    ])
  })

  it('falls back to the raw id + generic logo for an unresolvable reference', () => {
    const result = resolveChannelRefsForDisplay(
      [{ channelId: 'UNKNOWN_CHANNEL', url: 'https://example.com/x' }],
      CMS_CHANNELS,
    )
    expect(result).toEqual([
      {
        channelId: 'UNKNOWN_CHANNEL',
        url: 'https://example.com/x',
        name: 'UNKNOWN_CHANNEL',
        logo: CUSTOM_CHANNEL_LOGO,
      },
    ])
  })

  it('passes legacy plain {name,url} records through unchanged', () => {
    const plain = { name: 'Shopee', url: 'https://shopee.co.id/x' }
    const result = resolveChannelRefsForDisplay([plain], CMS_CHANNELS)
    expect(result[0]).toBe(plain)
  })

  it('returns an empty list for an empty configuration', () => {
    expect(resolveChannelRefsForDisplay([], CMS_CHANNELS)).toEqual([])
    expect(resolveChannelRefsForDisplay(undefined, CMS_CHANNELS)).toEqual([])
  })
})

describe('buildCustomChannelDefinition', () => {
  it('builds a store-scoped custom channel with a CUSTOM: id and generic logo', () => {
    const definition = buildCustomChannelDefinition({
      storeId: 'toko-komputer-jaya',
      name: 'Toko Saya',
    })
    expect(definition).toEqual({
      id: 'CUSTOM:TOKO-SAYA',
      storeId: 'toko-komputer-jaya',
      name: 'Toko Saya',
      logo: CUSTOM_CHANNEL_LOGO,
      custom: true,
    })
  })

  it('rejects an empty/blank name', () => {
    expect(() =>
      buildCustomChannelDefinition({ storeId: 's', name: '   ' }),
    ).toThrow('Nama channel custom wajib diisi.')
  })

  it('rejects a name that duplicates an existing custom channel (case-insensitive)', () => {
    expect(() =>
      buildCustomChannelDefinition({
        storeId: 'toko-komputer-jaya',
        name: 'toko SAYA',
        existingNames: ['Toko Saya'],
      }),
    ).toThrow(CUSTOM_CHANNEL_NAME_DUPLICATE)
  })

  it('normalizes the id (uppercase, dashes) and avoids channel id collisions', () => {
    const first = buildCustomChannelDefinition({ storeId: 's', name: 'Toko & Saya co.' })
    expect(first.id).toBe('CUSTOM:TOKO-SAYA-CO')

    const collision = buildCustomChannelDefinition({
      storeId: 's',
      name: 'Web Store',
      existingChannelIds: ['CUSTOM:WEB-STORE'],
    })
    expect(collision.id).toBe('CUSTOM:WEB-STORE-2')
  })
})

describe('validateChannelRefs', () => {
  it('is valid when every selected channel carries a URL, and for empty configurations', () => {
    expect(
      validateChannelRefs([
        { channelId: 'SHOPEE', url: 'https://shopee.co.id/x' },
        { channelId: 'TOKOPEDIA', url: 'https://www.tokopedia.com/y' },
      ]).valid,
    ).toBe(true)
    expect(validateChannelRefs([]).valid).toBe(true)
    expect(validateChannelRefs(undefined).valid).toBe(true)
  })

  it('reports the affected channel by index for each empty URL', () => {
    const result = validateChannelRefs([
      { channelId: 'SHOPEE', url: 'https://shopee.co.id/x' },
      { channelId: 'TOKOPEDIA', url: '' },
      { channelId: 'LAZADA', url: '   ' },
    ])
    expect(result.valid).toBe(false)
    expect(result.errors).toEqual({
      'channel-1': EXTERNAL_URL_REQUIRED,
      'channel-2': EXTERNAL_URL_REQUIRED,
    })
    expect(result.errors['channel-0']).toBeUndefined()
  })

  it('reports a missing channel reference as an invalid selection', () => {
    const result = validateChannelRefs([{ channelId: '', url: '' }])
    expect(result.valid).toBe(false)
    expect(result.errors['channel-0']).toBe(EXTERNAL_URL_REQUIRED)
  })
})