import { beforeEach, describe, expect, it } from 'vitest'
import { listCustomerInterests, recordInterest, isStoreOwner } from '../customerInterestService'
import { INTEREST_CONTEXT } from '../../constants/enums'
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
  it('records a WhatsApp click with the expected shape', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      customerId: 7,
      productId: 100,
      productName: 'Kaos Polos Premium',
      channel: 'WhatsApp',
      externalUrl: null,
    })
    expect(interest).toMatchObject({
      storeId: STORE_B_ID,
      channel: 'WhatsApp',
      productId: 100,
      customerId: 7,
    })
    expect(interest.date).toBeTruthy()
  })

  it('records a marketplace click with the exact selected channel, not a generic name', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Rina',
      customerId: 8,
      productId: 101,
      productName: 'Jaket Denim Vintage',
      channel: 'Instagram',
      externalUrl: 'https://instagram.com/toko-agung-fashion',
    })
    expect(interest.channel).toBe('Instagram')
    expect(interest.externalUrl).toBe('https://instagram.com/toko-agung-fashion')
  })

  it('folds repeated equivalent clicks into one logical record', async () => {
    const first = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      customerId: 7,
      productId: 100,
      channel: 'WhatsApp',
      context: INTEREST_CONTEXT.PRODUCT,
    })
    const second = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      customerId: 7,
      productId: 100,
      channel: 'WhatsApp',
      context: INTEREST_CONTEXT.PRODUCT,
    })
    expect(second.id).toBe(first.id)
    expect(second.totalClicks).toBe(2)
    expect(second.firstActivityAt).toBe(first.firstActivityAt)
    expect(new Date(second.lastActivityAt) >= new Date(first.lastActivityAt)).toBe(true)

    const stored = await listCustomerInterests(STORE_B_ID)
    expect(
      stored.filter((i) => i.customerId === 7 && i.productId === 100 && i.channel === 'WhatsApp'),
    ).toHaveLength(1)
  })

  it('creates a new logical record when the context differs', async () => {
    const productClick = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      customerId: 7,
      productId: 100,
      channel: 'WhatsApp',
      context: INTEREST_CONTEXT.PRODUCT,
    })
    const storeClick = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      customerId: 7,
      productId: null,
      channel: 'WhatsApp',
      context: INTEREST_CONTEXT.STORE,
    })
    expect(storeClick.id).not.toBe(productClick.id)
    expect(storeClick.totalClicks).toBe(1)
  })

  it('never merges anonymous clicks with no identifiable owner', async () => {
    const first = await recordInterest({ storeId: STORE_B_ID, customerName: null, channel: 'WhatsApp' })
    const second = await recordInterest({ storeId: STORE_B_ID, customerName: null, channel: 'WhatsApp' })
    expect(second.id).not.toBe(first.id)
  })

  it('rejects a record without a channel destination', async () => {
    await expect(
      recordInterest({
        storeId: STORE_B_ID,
        customerName: 'X',
        channel: '',
      }),
    ).rejects.toThrow('tidak valid')
    await expect(
      recordInterest({
        storeId: STORE_B_ID,
        customerName: 'X',
        channel: '   ',
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
      context: INTEREST_CONTEXT.PRODUCT,
      channel: 'WhatsApp',
    })
    expect(interest).toMatchObject({
      customerName: 'Budi',
      customerId: 7,
      customerEmail: 'budi.santoso@example.com',
      customerPhone: '081234567001',
      productId: 100,
      productName: 'Kaos Polos Premium',
      context: INTEREST_CONTEXT.PRODUCT,
    })
  })

  it('keeps a store-level record context as STORE with nullable product', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: null,
      customerEmail: 'visitor@example.com',
      context: INTEREST_CONTEXT.STORE,
      channel: 'WhatsApp',
    })
    expect(interest.context).toBe(INTEREST_CONTEXT.STORE)
    expect(interest.productId).toBeNull()
    expect(interest.productName).toBeNull()
  })

  it('keeps recorded records renderable even when the channel is no longer configured', async () => {
    const removedChannelId = 'LAZADA'
    const removedChannel = { name: 'Lazada', url: 'https://lazada.example/toko' }
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Rina',
      channel: removedChannel.name,
      externalUrl: removedChannel.url,
    })
    expect(interest.channel).toBe(removedChannel.name)
    expect(interest.externalUrl).toBe(removedChannel.url)

    const store = (await import('../../data/mock')).stores.find((s) => s.storeId === STORE_B_ID)
    expect(store.channels.some((c) => c.channelId === removedChannelId)).toBe(false)
    expect((await listCustomerInterests(STORE_B_ID)).some((i) => i.id === interest.id)).toBe(true)
  })

  it('defaults an absent context to null instead of guessing from the current route', async () => {
    const interest = await recordInterest({
      storeId: STORE_B_ID,
      customerName: 'Budi',
      channel: 'WhatsApp',
    })
    expect(interest.context).toBeNull()
  })

  it('derives identity from the active session when the caller omits it', async () => {
    actAsStoreB()
    const interest = await recordInterest({
      storeId: STORE_A_ID,
      channel: 'WhatsApp',
    })
    expect(interest).toMatchObject({
      customerId: 2,
      customerName: 'Agung Fashion',
    })
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
        channel: 'WhatsApp',
        date: '2026-09-01T00:00:00.000Z',
      },
      {
        id: 201,
        storeId: STORE_B_ID,
        customerName: 'Newer',
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