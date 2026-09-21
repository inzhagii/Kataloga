/**
 * Store validation rules (locked in docs/PRODUCT.md, UI_RULES.md and
 * API-CONTRACT.md).
 *
 * My Store location requires Province and City/Regency, with the city
 * belonging to the selected province. Full address is optional.
 *
 * Store information (My Store save) requires: Store ID, Logo, Name,
 * Description, Province, City/Regency, Operating Hours and WhatsApp.
 * Full Address, External Channels and Announcement are optional. The UI must
 * not render "Wajib" labels for these fields — errors appear on save.
 */

import { isValidPhone } from '../services/authService'
import { cityBelongsToProvince } from '../services/regionService'
import { validateStoreId } from './storeId'
import { isOperatingHoursValid, parseOperatingHours } from './operatingHours'

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

/**
 * Validate the My Store form used when saving store information.
 * Required: Store ID, logo, name, description, province, city, operating
 * hours and WhatsApp. Optional fields may be empty.
 * @param {{
 *   storeId?: string,
 *   name?: string,
 *   logoUrl?: string,
 *   description?: string,
 *   province?: string,
 *   city?: string,
 *   fullAddress?: string,
 *   operatingHours?: string,
 *   whatsapp?: string,
 * }} form
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateStoreInformation(form) {
  const errors = {}

  const storeId = String(form.storeId ?? '').trim()
  if (!storeId) {
    errors.storeId = 'Store ID wajib diisi.'
  } else {
    const check = validateStoreId(storeId)
    if (!check.valid) {
      errors.storeId = check.message
    }
  }

  if (!String(form.name ?? '').trim()) {
    errors.name = 'Nama toko wajib diisi.'
  }
  if (!String(form.logoUrl ?? '').trim()) {
    errors.logo = 'Logo toko wajib diunggah.'
  }
  if (!String(form.description ?? '').trim()) {
    errors.description = 'Deskripsi toko wajib diisi.'
  }
  if (!String(form.operatingHours ?? '').trim()) {
    errors.operatingHours = 'Jam operasional wajib diisi.'
  } else if (!isOperatingHoursValid(parseOperatingHours(form.operatingHours))) {
    errors.operatingHours = 'Rentang jam operasional tidak valid.'
  }

  const whatsapp = String(form.whatsapp ?? '').trim()
  if (!whatsapp) {
    errors.whatsapp = 'Nomor WhatsApp wajib diisi.'
  } else if (!isValidPhone(whatsapp)) {
    errors.whatsapp = 'Format nomor WhatsApp tidak valid.'
  }

  Object.assign(errors, validateStoreLocation(form).errors)

  return { errors, valid: Object.keys(errors).length === 0 }
}

/**
 * Allowed store-level Auto Archive threshold, days.
 * null disables auto archive ("Never", persists as null). "Tidak ada" is not
 * an option in the approved set.
 * Locked set from docs/PRODUCT.md §Auto Archive.
 */
export const ALLOWED_AUTO_ARCHIVE_DAYS = new Set([1, 7, 30, 90, 180, 365])

/**
 * Validate the store-level Auto Archive setting.
 * Accepts null or an allowed threshold from ALLOWED_AUTO_ARCHIVE_DAYS.
 * @param {number|null|''|undefined} value
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateAutoArchiveDays(value) {
  const errors = {}

  if (value === null || value === undefined) {
    return { errors, valid: true }
  }

  const days = typeof value === 'number' ? value : Number(value)
  if (!ALLOWED_AUTO_ARCHIVE_DAYS.has(days)) {
    errors.autoArchiveDays = 'Auto Archive hanya dapat diatur ke: 1, 7, 30, 90, 180, atau 365 hari.'
  }

  return { errors, valid: Object.keys(errors).length === 0 }
}