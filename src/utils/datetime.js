/**
 * Small date formatting helpers for seller UI (dashboard summary, activity).
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
 * Format an ISO datetime as "04 Sep 2026 · 09:42".
 * Falls back to the raw value when the input is not a valid date.
 * @param {string} iso
 * @returns {string}
 */
export function formatDateTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = MONTHS[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year} · ${hours}:${minutes}`
}