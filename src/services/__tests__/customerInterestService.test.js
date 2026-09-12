import { beforeEach, describe, expect, it } from 'vitest'
import { listCustomerInterests, recordInterest } from '../customerInterestService'
import { INTEREST_TYPE } from '../../constants/enums'
import { beforeEachScenario, STORE_B_ID } from './setup'

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