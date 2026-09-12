/**
 * Service data-source configuration.
 *
 * The frontend runs against in-memory mock data by default so the app works
 * without a backend. Setting VITE_DATA_SOURCE=api switches the service layer
 * to the HTTP client and the proposed API adapters (docs/API-CONTRACT.md).
 * No backend exists yet, so API mode is contract-ready, not live.
 */

const dataSource = (import.meta.env.VITE_DATA_SOURCE || 'mock')
  .toString()
  .trim()
  .toLowerCase()

/**
 * Base URL for API requests. Empty by default, meaning requests are issued to
 * the same origin the frontend is served from (typical reverse-proxy setup).
 * Override with VITE_API_BASE_URL. Never hardcode a backend URL in services.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '')
  .toString()
  .trim()
  .replace(/\/+$/, '')

/**
 * Whether services should call the proposal API adapters instead of the
 * in-memory mock implementation.
 * @returns {boolean}
 */
export function isApiMode() {
  return dataSource === 'api'
}