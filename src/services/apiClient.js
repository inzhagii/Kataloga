/**
 * API client abstraction.
 *
 * During development it resolves mock data with simulated latency so pages
 * implement loading/error states now. When VITE_DATA_SOURCE=api, `request()`
 * performs real HTTP calls against the configured base URL and normalizes
 * failures to ApiError.
 *
 * The parsed JSON response body is returned as-is; DTO -> frontend model
 * mapping lives in src/services/adapters/api/mappers.js, not here.
 */

import { API_BASE_URL } from './apiConfig'
import { createApiError } from './ApiError'

const MOCK_LATENCY = 300

let mockLatency = MOCK_LATENCY

/**
 * Override the simulated mock latency. Tests set this to 0 so business-logic
 * suites stay fast; production behavior keeps the default 300 ms untouched.
 * @param {number} ms
 */
export function setMockLatency(ms) {
  mockLatency = ms
}

/**
 * Resolves mock data after a simulated network delay.
 * @template T
 * @param {T} data
 * @param {number} [ms]
 * @returns {Promise<T>}
 */
export function withLatency(data, ms = mockLatency) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), ms)
  })
}

/**
 * Auth token holder. The mock auth flow never sets a token; the real backend
 * integration (a later phase) populates it after login/refresh and clears it
 * on logout.
 * @type {string | null}
 */
let accessToken = null

/**
 * @param {string | null} token
 */
export function setAccessToken(token) {
  accessToken = token ?? null
}

/**
 * @returns {string | null}
 */
export function getAccessToken() {
  return accessToken
}

/**
 * Handler invoked when the API responds 401. AuthProvider registers one so an
 * expired session clears local auth state (RequireAuth then redirects to
 * /login) instead of leaving protected pages showing stale data.
 * @type {(() => void) | null}
 */
let unauthorizedHandler = null

/**
 * @param {(() => void) | null} handler
 */
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null
}

/**
 * Build the absolute request URL from the configured base and query params.
 * @param {string} path
 * @param {Record<string, unknown> | undefined} query
 * @returns {string}
 */
function buildUrl(path, query) {
  const base = API_BASE_URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!query) {
    return `${base}${normalizedPath}`
  }
  const search = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  const queryString = search.toString()
  return `${base}${normalizedPath}${queryString ? `?${queryString}` : ''}`
}

/**
 * Parse a response body into JSON without crashing on empty or non-JSON
 * payloads.
 * @param {Response} response
 * @returns {Promise<unknown>}
 */
async function parseBody(response) {
  const text = await response.text()
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Perform an HTTP request against the API base URL.
 *
 * The raw parsed body is returned, or `null` when `notFoundAsNull` is set
 * and the response is 404. All other failures throw ApiError.
 *
 * @param {{
 *   method?: 'GET'|'POST'|'PATCH'|'PUT'|'DELETE',
 *   path: string,
 *   query?: Record<string, unknown>,
 *   body?: unknown,
 *   headers?: Record<string, string>,
 *   notFoundAsNull?: boolean,
 * }} options
 * @returns {Promise<any>}
 */
export async function request({
  method = 'GET',
  path,
  query,
  body,
  headers,
  notFoundAsNull = false,
}) {
  const requestHeaders = { ...(headers || {}) }
  if (accessToken) {
    requestHeaders.Authorization = `Bearer ${accessToken}`
  }
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  let response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (cause) {
    throw createApiError({ cause })
  }

  const data = await parseBody(response)

  if (!response.ok) {
    if (response.status === 404 && notFoundAsNull) {
      return null
    }
    if (response.status === 401 && unauthorizedHandler) {
      try {
        unauthorizedHandler()
      } catch {
        // Never let a state-cleanup handler mask the original request error.
      }
    }
    throw createApiError({ status: response.status, data })
  }

  return data
}