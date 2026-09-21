/**
 * Date formatting helpers for Kataloga seller UI.
 *
 * Canonical date display is DD.MM.YYYY (no weekday, no month name) per
 * docs/UI_RULES.md — e.g. "12.09.2026". Datetimes append time: "12.09.2026 · 07:30".
 * Raw timestamps (ISO strings) are never mutated for display; formatting only
 * happens at render time.
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Format a date-like value as the canonical DD.MM.YYYY date (e.g. "12.09.2026").
 * Falls back to the raw input when it is not a valid date.
 * @param {string|number|Date} value
 * @returns {string}
 */
export function formatDate(value) {
  const date = asDate(value)
  if (date === null) {
    return String(value)
  }
  return partsOf(date).date
}

/**
 * Format an ISO datetime as the canonical "DD.MM.YYYY · HH:MM" (e.g. "12.09.2026 · 07:30").
 * Falls back to the raw input when it is not a valid date.
 * @param {string} iso
 * @returns {string}
 */
export function formatDateTime(iso) {
  const date = asDate(iso)
  if (date === null) {
    return String(iso)
  }
  const { date: d, hours, minutes } = partsOf(date)
  return `${d} · ${hours}:${minutes}`
}

/**
 * Numeric 2-digit locale-independent day/month components for an ISO date string.
 * @param {string} iso
 * @returns {{ ddmmyyyy: string, dd: string, mm: string, yyyy: string }|null}
 */
export function toDMY(iso) {
  const date = asDate(iso)
  if (date === null) {
    return null
  }
  const { dd, mm, yyyy } = partsOf(date)
  return { ddmmyyyy: `${dd}.${mm}.${yyyy}`, dd, mm, yyyy }
}

/**
 * True when two date-like values fall on the same calendar day (single-date
 * filter). Handles ISO strings, Date instances, timestamps, or "DD.MM.YYYY".
 * Timestamps keep their local calendar day; the DB/backend remains the source
 * of truth for timezone semantics.
 * @param {string|number|Date} candidate
 * @param {string|number|Date} target
 * @returns {boolean}
 */
export function isSameCalendarDate(candidate, target) {
  const a = toDMY(candidate)
  const b = toDMY(target)
  if (a === null || b === null) {
    return false
  }
  return a.ddmmyyyy === b.ddmmyyyy
}

/**
 * Filter a list of records that carry an ISO `date` field down to the ones
 * that fall on the same calendar date as `target` (single-date filter —
 * not a date range). Items with an invalid date are excluded.
 * @template T
 * @param {T[]} records
 * @param {string|Date} target - A date meaning "today", or an ISO/"DD.MM.YYYY" value.
 * @param {(record: T) => string} [pickDate] - Accessor for the record's ISO date (default: record.date).
 * @returns {T[]}
 */
export function filterBySingleDate(records, target, pickDate = (record) => record.date) {
  return records.filter((record) => isSameCalendarDate(pickDate(record), target))
}

/**
 * Convert a date-like value into a native <input type="date"> value
 * (YYYY-MM-DD) for use in date pickers. Accepts ISO strings, Date instances,
 * timestamps, or "DD.MM.YYYY". Returns '' when the value is not a valid date.
 * @param {string|number|Date|null|undefined} value
 * @returns {string}
 */
export function toNativeDateInput(value) {
  if (value === null || value === undefined || value === '') {
    return ''
  }
  if (typeof value === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split('.')
    return `${yyyy}-${mm}-${dd}`
  }
  const date = asDate(value)
  if (date === null) {
    return ''
  }
  const { dd, mm, yyyy } = partsOf(date)
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Map a native <input type="date"> value (YYYY-MM-DD) into the canonical
 * "DD.MM.YYYY" format used by Kataloga filters. Returns '' for invalid input.
 * @param {string} value
 * @returns {string}
 */
export function fromNativeDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''))
  if (!match) {
    return ''
  }
  const [, yyyy = '', mm = '', dd = ''] = match
  return `${dd}.${mm}.${yyyy}`
}

function asDate(value) {
  if (typeof value === 'string' && /^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    const [dd = '01', mm = '01', yyyy = '1970'] = value.split('.')
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  }
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function partsOf(date) {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = String(date.getFullYear())
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return { dd, mm, yyyy, hours, minutes, date: `${dd}.${mm}.${yyyy}` }
}

export { MONTHS }