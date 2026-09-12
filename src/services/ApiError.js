/**
 * Typed service-layer error for the API client.
 *
 * Pages already render `error.message` through their hooks, so API failures
 * surface through the existing contract. `.type` lets callers distinguish
 * common cases (network vs. not found vs. validation, ...) without coupling
 * to raw HTTP status codes. Raw backend details never reach the UI.
 */

const FALLBACK_MESSAGES = {
  network: 'Gagal terhubung ke server. Periksa koneksi Anda lalu coba lagi.',
  unauthorized: 'Sesi Anda telah berakhir. Silakan login kembali.',
  forbidden: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
  not_found: 'Data tidak ditemukan.',
  validation: 'Data yang dikirim tidak valid. Periksa kembali input Anda.',
  conflict: 'Data yang Anda simpan tidak dapat diproses karena sudah digunakan.',
  server: 'Terjadi kesalahan pada server. Silakan coba lagi.',
  parse: 'Respons server tidak dapat diproses.',
}

const STATUS_TO_TYPE = {
  400: 'validation',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'validation',
}

export class ApiError extends Error {
  constructor({ type, message, status = null, code = null, cause }) {
    super(message || FALLBACK_MESSAGES[type] || FALLBACK_MESSAGES.server)
    this.name = 'ApiError'
    this.type = type
    this.status = status
    this.code = code
    if (cause) {
      this.cause = cause
    }
  }
}

/**
 * Extract a human-readable message from a backend error payload if possible.
 * @param {unknown} data
 * @returns {string}
 */
function extractMessage(data) {
  if (!data || typeof data !== 'object') {
    return ''
  }
  if (typeof data.message === 'string' && data.message) {
    return data.message
  }
  if (data.error && typeof data.error.message === 'string' && data.error.message) {
    return data.error.message
  }
  return ''
}

/**
 * Build an ApiError from a failed HTTP response or a network-level failure.
 * @param {{ status?: number|undefined, data?: unknown, cause?: Error }} source
 * @returns {ApiError}
 */
export function createApiError({ status, data, cause }) {
  if (cause) {
    return new ApiError({ type: 'network', message: FALLBACK_MESSAGES.network, cause })
  }
  const type = STATUS_TO_TYPE[status] || (status >= 500 ? 'server' : 'validation')
  return new ApiError({
    type,
    status,
    code: data && typeof data.code === 'string' ? data.code : null,
    message: extractMessage(data) || undefined,
  })
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isApiError(error) {
  return error instanceof ApiError
}