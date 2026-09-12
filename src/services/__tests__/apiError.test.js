import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createApiError, isApiError } from '../ApiError'
import { request, setAccessToken } from '../apiClient'

function stubFetchResponse({ status, data }) {
  const ok = status < 400
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      text: async () => JSON.stringify(data),
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  setAccessToken(null)
})

describe('createApiError mapping', () => {
  it.each([
    [400, 'validation'],
    [422, 'validation'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [409, 'conflict'],
    [500, 'server'],
    [504, 'server'],
  ])('maps status %i to type %s', (status, type) => {
    const error = createApiError({ status, data: {} })
    expect(error).toBeInstanceOf(ApiError)
    expect(error.type).toBe(type)
  })

  it('maps unknown non-server statuses to validation', () => {
    expect(createApiError({ status: 429, data: {} }).type).toBe('validation')
  })

  it('extracts a backend message from data.message and data.error.message', () => {
    expect(createApiError({ status: 409, data: { message: 'Sudah digunakan.' } }).message).toBe(
      'Sudah digunakan.',
    )
    expect(
      createApiError({ status: 403, data: { error: { message: 'Dilarang.' } } }).message,
    ).toBe('Dilarang.')
  })

  it('extracts the backend error code', () => {
    const error = createApiError({ status: 404, data: { code: 'not_found', message: 'X' } })
    expect(error.code).toBe('not_found')
  })

  it('maps a network cause to the network type', () => {
    const cause = new TypeError('Failed to fetch')
    const error = createApiError({ cause })
    expect(error.type).toBe('network')
    expect(error.cause).toBe(cause)
  })
})

describe('ApiError fallback messages', () => {
  it('uses the type fallback when no message is extracted', () => {
    expect(createApiError({ status: 401, data: {} }).message).toBe(
      'Sesi Anda telah berakhir. Silakan login kembali.',
    )
    expect(createApiError({ status: 404, data: {} }).message).toBe('Data tidak ditemukan.')
    expect(createApiError({ status: 500, data: {} }).message).toBe(
      'Terjadi kesalahan pada server. Silakan coba lagi.',
    )
  })

  it('supplies a parse fallback message', () => {
    const error = new ApiError({ type: 'parse' })
    expect(error.message).toBe('Respons server tidak dapat diproses.')
  })

  it('defaults to server fallback for unknown types', () => {
    const error = new ApiError({ type: 'nope' })
    expect(error.message).toBe('Terjadi kesalahan pada server. Silakan coba lagi.')
  })
})

describe('isApiError', () => {
  it('distinguishes ApiError from plain Error', () => {
    expect(isApiError(new ApiError({ type: 'server' }))).toBe(true)
    expect(isApiError(new Error('plain'))).toBe(false)
  })
})

describe('request (API client boundary)', () => {
  it('returns the parsed body on success', async () => {
    stubFetchResponse({ status: 200, data: { id: 1, name: 'Produk' } })
    const data = await request({ method: 'GET', path: '/product/1' })
    expect(data).toEqual({ id: 1, name: 'Produk' })
  })

  it('returns null for 404 when notFoundAsNull is set', async () => {
    stubFetchResponse({ status: 404, data: { message: 'Not found' } })
    await expect(
      request({ path: '/missing', notFoundAsNull: true }),
    ).resolves.toBeNull()
  })

  it('throws a mapped ApiError for an error response', async () => {
    stubFetchResponse({ status: 409, data: { message: 'Store ID sudah digunakan.' } })
    const error = await request({ path: '/store', method: 'POST', body: {} }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.type).toBe('conflict')
    expect(error.message).toBe('Store ID sudah digunakan.')
  })

  it('maps a failed fetch to a network ApiError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const error = await request({ path: '/x' }).catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.type).toBe('network')
  })

  it('attaches the bearer token when one is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => 'null' })
    vi.stubGlobal('fetch', fetchMock)
    setAccessToken('token-abc')
    await request({ path: '/me' })
    expect(fetchMock).toHaveBeenCalledWith('/me', expect.objectContaining({ headers: expect.any(Object) }))
    const [, options] = fetchMock.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer token-abc')
  })
})