/**
 * API client abstraction.
 *
 * During development it resolves mock data with simulated latency so pages
 * implement loading/error states now. When VITE_DATA_SOURCE=api, `request()`
 * performs real HTTP calls against the configured base URL and normalizes
 * failures to ApiError.
 *
 * Authentication uses Laravel Sanctum **session** auth (docs/API-CONTRACT.md
 * §3, AGENTS.md §1.5): cookie session + CSRF, never a Bearer/JWT/localStorage
 * token. State-changing requests bootstrap `GET /sanctum/csrf-cookie` and send
 * the `X-XSRF-TOKEN` header derived from the `XSRF-TOKEN` cookie. Any 401/419
 * clears the local session through the registered handler; it never retries,
 * so no redirect/retry loop can form.
 *
 * The parsed JSON response body is returned as-is; DTO -> frontend model
 * mapping lives in src/services/adapters/api/mappers.js, not here.
 */

import { API_BASE_URL } from './apiConfig'
import { createApiError } from './ApiError'

const MOCK_LATENCY = 300

const CSRF_COOKIE_NAME = 'XSRF-TOKEN'
const CSRF_HEADER = 'X-XSRF-TOKEN'
const CSRF_BOOTSTRAP_PATH = '/sanctum/csrf-cookie'
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

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
 * In-memory CSRF token cache. Never persisted (no localStorage/sessionStorage).
 * Reads fall back to the Sanctum `XSRF-TOKEN` cookie; tests may inject a token
 * directly to avoid a bootstrap round-trip.
 * @type {string | null}
 */
let csrfToken = null

/**
 * In-flight bootstrap promise. Shared by concurrent state-changing requests so
 * `GET /sanctum/csrf-cookie` runs at most once; it is cleared on settle and the
 * bootstrap uses raw `fetch` (never `request`), so it can never recurse.
 * @type {Promise<string | null> | null}
 */
let csrfBootstrapPromise = null

/**
 * Inject the CSRF token (tests). Passing a falsy value clears the cache so the
 * next state-changing request bootstraps again.
 * @param {string | null} token
 */
export function setCsrfToken(token) {
  csrfToken = token || null
}

/**
 * Handler invoked when the API responds 401 or 419. AuthProvider registers one
 * so an expired session clears local auth state (RequireAuth then redirects to
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
 * Read the Sanctum `XSRF-TOKEN` cookie value when a DOM is available.
 * @returns {string | null}
 */
function readCsrfCookie() {
  if (typeof document === 'undefined' || typeof document.cookie !== 'string') {
    return null
  }
  const prefix = `${CSRF_COOKIE_NAME}=`
  const match = document.cookie
    .split(';')
    .map((row) => row.trim())
    .find((row) => row.startsWith(prefix))
  if (!match) {
    return null
  }
  return decodeURIComponent(match.slice(prefix.length)) || null
}

/**
 * Resolve the CSRF token, bootstrapping `GET /sanctum/csrf-cookie` when neither
 * an injected token nor the cookie is present. Concurrent callers share one
 * in-flight request; the bootstrap is fire-once and cannot recurse.
 * @returns {Promise<string | null>}
 */
function ensureCsrfToken() {
  if (csrfToken) {
    return Promise.resolve(csrfToken)
  }
  const cookieToken = readCsrfCookie()
  if (cookieToken) {
    csrfToken = cookieToken
    return Promise.resolve(csrfToken)
  }
  if (csrfBootstrapPromise) {
    return csrfBootstrapPromise
  }
  csrfBootstrapPromise = fetch(buildUrl(CSRF_BOOTSTRAP_PATH), {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then(() => {
      csrfToken = readCsrfCookie()
      return csrfToken
    })
    .catch((cause) => {
      throw createApiError({ cause })
    })
    .finally(() => {
      csrfBootstrapPromise = null
    })
  return csrfBootstrapPromise
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
  const upperMethod = String(method).toUpperCase()
  const requestHeaders = { ...(headers || {}) }
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }
  if (STATE_CHANGING_METHODS.has(upperMethod)) {
    const token = await ensureCsrfToken()
    if (token) {
      requestHeaders[CSRF_HEADER] = token
    }
  }

  let response
  try {
    response = await fetch(buildUrl(path, query), {
      method: upperMethod,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
  } catch (cause) {
    throw createApiError({ cause })
  }

  const data = await parseBody(response)

  if (!response.ok) {
    if (response.status === 404 && notFoundAsNull) {
      return null
    }
    if ((response.status === 401 || response.status === 419) && unauthorizedHandler) {
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
