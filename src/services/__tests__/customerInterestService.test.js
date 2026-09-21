import { beforeEach, describe, expect, it } from 'vitest'
import { listCustomerInterests, recordInterest, isStoreOwner } from '../customerInterestService'
import { INTEREST_TYPE, INTEREST_CONTEXT } from '../../constants/enums'
import {
  beforeEachScenario,
  STORE_A_ID,
  STORE_B_ID,
  actAsStoreA,
  actAsStoreB,
} from './setup'

beforeEach(() => {
  beforeEachScenario()
})

describe('recordInterest', () => {
  it('records a WHATSAPP_CLICK with the expected shape', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      customerId: 7,
      productId: 100,
      productName: 'Kaos Polos Premium',
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
      externalUrl: null,
    })
    expect(interest).toMatchObject({
      storeId: STORE_B_ID,
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
      productId: 100,
      customerId: 7,
    })
    expect(interest.date).toBeTruthy()
  })

  it('records a MARKETPLACE_CLICK with the exact selected channel, not a generic name', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Rina',
      customerId: 8,
      productId: 101,
      productName: 'Jaket Denim Vintage',
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: 'Instagram',
      externalUrl: 'https://instagram.com/toko-agung-fashion',
    })
    expect(interest.channelType).toBe(INTEREST_TYPE.MARKETPLACE_CLICK)
    expect(interest.channel).toBe('Instagram')
    expect(interest.externalUrl).toBe('https://instagram.com/toko-agung-fashion')
  })

  it('creates separate records per click (no dedup)', async () => {
    const first = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
    const second = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
    expect(first.id).not.toBe(second.id)
  })

  it('rejects any channel type other than the two allowed ones', async () => {
    await expect(
      recordInterest({
        storeId: STORE_B_ID,
        customerName: 'X',
        channelType: 'PRODUCT_VIEW',
        channel: 'Product',
      }),
    ).rejects.toThrow('tidak valid')
    await expect(
      recordInterest({
        storeId: STORE_B_ID,
        customerName: 'X',
        channelType: 'SHARE',
        channel: 'Share',
      }),
    ).rejects.toThrow('tidak valid')
  })

  it('snapshots the combined identity (name + email + phone) and the storefront context', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      customerId: 7,
      customerEmail: 'budi.santoso@example.com',
      customerPhone: '081234567001',
      productId: 100,
      productName: 'Kaos Polos Premium',
      context: INTEREST_CONTEXT.PRODUCT_DETAIL,
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
    expect(interest).toMatchObject({
      customerName: 'Budi',
      customerId: 7,
      customerEmail: 'budi.santoso@example.com',
      customerPhone: '081234567001',
      productId: 100,
      productName: 'Kaos Polos Premium',
      context: INTEREST_CONTEXT.PRODUCT_DETAIL,
    })
  })

  it('keeps a store-level record context as Store Landing with nullable product', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: null,
      customerEmail: 'visitor@example.com',
      context: INTEREST_CONTEXT.STORE_LANDING,
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
    expect(interest.context).toBe(INTEREST_CONTEXT.STORE_LANDING)
    expect(interest.productId).toBeNull()
    expect(interest.productName).toBeNull()
  })

  it('keeps recorded records renderable even when the channel is no longer configured', async () => {
    const removedChannel = { name: 'Lazada', url: 'https://lazada.example/toko' }
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Rina',
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: removedChannel.name,
      externalUrl: removedChannel.url,
    })
    expect(interest.channel).toBe(removedChannel.name)
    expect(interest.externalUrl).toBe(removedChannel.url)

    const store = (await import('../../data/mock')).stores.find((s) => s.storeId === STORE_B_ID)
    expect(store.channels.some((c) => c.name === removedChannel.name)).toBe(false)
    expect((await listCustomerInterests(STORE_B_ID)).some((i) => i.id === interest.id)).toBe(true)
  })

  it('defaults an absent context to null instead of guessing from the current route', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
    expect(interest.context).toBeNull()
  })
})

describe('self-store exclusion', () => {
  it('never records an interest when the acting account owns the target store', async () => {
    actAsStoreA()
    expect(isStoreOwner(STORE_A_ID)).toBe(true)

    const recorded = await recordInterest({
      storeId: STORE_A_ID,
      customerName: 'Pemilik Toko',
      customerId: 1,
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
    expect(recorded).toBeNull()

    const storeA = await listCustomerInterests(STORE_A_ID)
    expect(storeA.some((interest) => interest.customerId === 1)).toBe(false)
  })

  it('records normally when the acting account owns a different store (logged-in customer)', async () => {
    actAsStoreB()
    expect(isStoreOwner(STORE_A_ID)).toBe(false)

    const recorded = await recordInterest({
      storeId: STORE_A_ID,
      customerName: 'Agung',
      customerId: 2,
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: 'Shopee',
    })
    expect(recorded).not.toBeNull()

    const storeA = await listCustomerInterests(STORE_A_ID)
    expect(storeA.some((interest) => interest.customerId === 2)).toBe(true)
  })

  it('records normally for guests (no authenticated account)', async () => {
    const recorded = await recordInterest({
      storeId: STORE_A_ID,
      customerName: 'Pengunjung',
      customerId: null,
      channelType: INTEREST_TYPE.WHATSAPP_CLICK,
      channel: 'WhatsApp',
    })
    expect(recorded).not.toBeNull()
  })
})

describe('listCustomerInterests', () => {
  it('returns only the requested store records, newest first', async () => {
    const result = await listCustomerInterests(STORE_B_ID)
    expect(result.every((i) => i.storeId === STORE_B_ID)).toBe(true)

    const { customerInterests } = await import('../../data/mock')
    customerInterests.push(
      {
        id: 200,
        storeId: STORE_B_ID,
        customerName: 'Older',
        channelType: INTEREST_TYPE.WHATSAPP_CLICK,
        channel: 'WhatsApp',
        date: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 201,
        storeId: STORE_B_ID,
        customerName: 'Newer',
        channelType: INTEREST_TYPE.WHATSAPP_CLICK,
        channel: 'WhatsApp',
        date: '2026-09-10T00:00:00.000Z',
      },
    )
    const ordered = await listCustomerInterests(STORE_B_ID)
    expect(ordered.map((i) => i.id)).toEqual([201, 100, 200])
  })

  it('never mixes records from another store', async () => {
    const storeA = await listCustomerInterests('toko-komputer-jaya')
    expect(storeA.every((i) => i.storeId === 'toko-komputer-jaya')).toBe(true)
    expect(storeA.some((i) => i.id === 100)).toBe(false)
  })
})