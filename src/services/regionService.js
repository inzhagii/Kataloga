/**
 * Region (province/city) service.
 *
 * Provides the province -> city dependency used by the My Store location
 * form and by storefront rendering. Reads mock master data from
 * src/data/mock/regions.js.
 *
 * NOTE: Province/city master-data API endpoints (e.g. GET /provinces and
 * GET /provinces/{province}/cities) are PENDING BACKEND CONFIRMATION.
 * This service therefore returns mock data in every data-source mode and
 * must be swapped to the API adapter once the endpoints and the
 * ID-vs-name storage decision are confirmed.
 */

import { regions } from '../data/mock'
import { withLatency } from './apiClient'

/**
 * All selectable provinces.
 * @returns {Promise<string[]>}
 */
export function listProvinces() {
  return withLatency(Object.keys(regions))
}

/**
 * City/regency names available for a province (scoped to it).
 * @param {string} province
 * @returns {Promise<string[]>}
 */
export function citiesForProvince(province) {
  if (!province || !Object.prototype.hasOwnProperty.call(regions, province)) {
    return withLatency([])
  }
  return withLatency(regions[province])
}

/**
 * Sync check whether a city/regency belongs to a province.
 * @param {string} province
 * @param {string} city
 * @returns {boolean}
 */
export function cityBelongsToProvince(province, city) {
  if (!province || !city) {
    return false
  }
  return (
    Array.isArray(regions[province]) && regions[province].includes(city)
  )
}

/**
 * Sync check whether a location pair is complete and consistent.
 * @param {{ province?: string, city?: string }} location
 * @returns {boolean}
 */
export function isValidLocation({ province, city }) {
  return Boolean(province && city && cityBelongsToProvince(province, city))
}