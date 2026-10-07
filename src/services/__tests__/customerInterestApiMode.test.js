/**
 * Regression guard for the customer interest wire contract
 * (docs/API-CONTRACT.md §7): the backend resolves the customer identity from
 * the session, so in API mode the POST body must carry only the contract
 * fields. A caller-supplied client identity must never be serialized onto the
 * wire (no fabricated client identity in production).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const DTO = {
  id: 1,
  store_id: 'toko-komputer-jaya',
  customer_user_id: 5,
  product_id: null,
  context: 'STORE',
  channel: 'whatsapp',
  total_clicks: 1,
  first_activity_at: '2026-01-01T00:00:00.000Z',
  last_activity_at: '2026-01-01T00:00:00.000Z',
}

describe('customer interest API mode', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_DATA_SOURCE', 'api')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('posts only contract fields, never a client-supplied identity', async () => {
    const { setCsrfToken } = await import('../apiClient')
    setCsrfToken('test-token')

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(DTO),
    })
    vi.stubGlobal('fetch', fetchSpy)

    const { recordInterest } = await import('../adapters/api/customerInterestApi')
    await recordInterest({
      storeId: 'toko-komputer-jaya',
      customerName: 'Budi',
      customerId: 7,
      customerEmail: 'budi@example.com',
      customerPhone: '081200000000',
      productId: null,
      context: 'STORE',
      channel: 'whatsapp',
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [, init] = fetchSpy.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body).toEqual({
      store_id: 'toko-komputer-jaya',
      product_id: null,
      context: 'STORE',
      channel: 'whatsapp',
    })
    expect(body).not.toHaveProperty('customer_name')
    expect(body).not.toHaveProperty('customer_id')
    expect(body).not.toHaveProperty('customer_email')
    expect(body).not.toHaveProperty('customer_phone')
    expect(body).not.toHaveProperty('channel_type')
  })
})
