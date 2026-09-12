/**
 * Store location validation rules (locked in docs/PRODUCT.md, UI_RULES.md and
 * API-CONTRACT.md). My Store location requires Province and City/Regency, with
 * the city belonging to the selected province. Full address is optional.
 */

import { cityBelongsToProvince } from '../services/regionService'

/**
 * Validate a store location form.
 * Returns a map of field -> error message plus a valid flag.
 * @param {{ province?: string, city?: string, fullAddress?: string }} location
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateStoreLocation({ province, city }) {
  const errors = {}

  if (!province || !province.trim()) {
    errors.province = 'Provinsi wajib dipilih.'
  } else if (!city || !city.trim()) {
    errors.city = 'Kota/Kabupaten wajib dipilih.'
  } else if (!cityBelongsToProvince(province, city)) {
    errors.city = 'Kota/Kabupaten tidak sesuai dengan provinsi yang dipilih.'
  }

  return { errors, valid: Object.keys(errors).length === 0 }
}