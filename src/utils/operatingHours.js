/**
 * Operating hours helpers for the My Store editor.
 *
 * The store DTO keeps `operating_hours` as a single wire string
 * (e.g. "Senin - Sabtu, 09:00 - 18:00" or "Senin–Sabtu, 09:00–18:00").
 * The frontend editor exposes a structured form (Hari Mulai / Hari Selesai /
 * Jam Buka / Jam Tutup) that composes that string — docs/API-CONTRACT.md §9.
 * These helpers convert between the wire string and the structured shape,
 * tolerating the hyphen/en-dash and dot/colon variants found in mock data.
 */

/** Ordered Indonesian weekday labels used by the editor selects. */
export const WEEKDAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

/** Initial structured value offered by the editor when no hours are stored yet. */
export const DEFAULT_OPERATING_HOURS = {
  startDay: 'Senin',
  endDay: 'Sabtu',
  openTime: '09:00',
  closeTime: '18:00',
}

/** Index of a weekday within WEEKDAYS, or -1 when not a weekday. @param {string} day */
export function dayIndex(day) {
  return WEEKDAYS.indexOf(day)
}

/** Comma-separated wire string, e.g. "Senin - Sabtu, 09:00 - 18:00". */
export function composeOperatingHours({ startDay, endDay, openTime, closeTime }) {
  return `${startDay} - ${endDay}, ${openTime} - ${closeTime}`
}

/**
 * Parse a wire `operating_hours` string into the structured shape. Falls back
 * to DEFAULT_OPERATING_HOURS for empty/unknown formats.
 * @param {string|undefined|null} value
 * @returns {{ startDay: string, endDay: string, openTime: string, closeTime: string }}
 */
export function parseOperatingHours(value) {
  const source = String(value ?? '').trim()
  const match = /([A-Za-z]+)\s*[-–]\s*([A-Za-z]+)\s*,\s*([0-9]{1,2}[.:][0-9]{2})\s*[-–]\s*([0-9]{1,2}[.:][0-9]{2})/.exec(
    source,
  )
  if (!match) {
    return { ...DEFAULT_OPERATING_HOURS }
  }
  const [, rawStartDay, rawEndDay, rawOpenTime, rawCloseTime] = match
  const pickDay = (raw) =>
    WEEKDAYS.find((day) => day.toLowerCase() === raw.toLowerCase()) ??
    DEFAULT_OPERATING_HOURS.startDay
  const pickTime = (raw) => {
    const normalized = /^\d{1,2}:\d{2}$/.test(raw) ? raw : raw.replace('.', ':')
    return /^\d{2}:\d{2}$/.test(normalized) ? normalized : DEFAULT_OPERATING_HOURS.openTime
  }
  return {
    startDay: pickDay(rawStartDay),
    endDay: pickDay(rawEndDay),
    openTime: pickTime(rawOpenTime),
    closeTime: pickTime(rawCloseTime),
  }
}

/**
 * True when the structured range is coherent: the day span is ordered and the
 * opening time is not later than the closing time (24h "HH:MM" notation).
 * @param {{ startDay: string, endDay: string, openTime: string, closeTime: string }} hours
 * @returns {boolean}
 */
export function isOperatingHoursValid({ startDay, endDay, openTime, closeTime }) {
  const startIndex = dayIndex(startDay)
  const endIndex = dayIndex(endDay)
  if (startIndex < 0 || endIndex < 0 || startIndex > endIndex) {
    return false
  }
  return openTime <= closeTime
}