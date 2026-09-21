/**
 * Unit tests for the structured operating hours editor helpers
 * (docs/API-CONTRACT.md §9): the wire string stays an editable string while
 * the editor composes it from Hari Mulai / Hari Selesai / Jam Buka /
 * Jam Tutup.
 */

import { describe, expect, it } from 'vitest'
import {
  WEEKDAYS,
  DEFAULT_OPERATING_HOURS,
  composeOperatingHours,
  dayIndex,
  isOperatingHoursValid,
  parseOperatingHours,
} from '../operatingHours'

describe('composeOperatingHours', () => {
  it('composes the canonical wire string', () => {
    expect(
      composeOperatingHours({ startDay: 'Senin', endDay: 'Sabtu', openTime: '09:00', closeTime: '18:00' }),
    ).toBe('Senin - Sabtu, 09:00 - 18:00')
  })
})

describe('parseOperatingHours', () => {
  it('parses the canonical hyphen/colon string', () => {
    expect(parseOperatingHours('Senin - Sabtu, 09:00 - 18:00')).toEqual({
      startDay: 'Senin',
      endDay: 'Sabtu',
      openTime: '09:00',
      closeTime: '18:00',
    })
  })

  it('tolerates the en-dash variant used by older mock data', () => {
    expect(parseOperatingHours('Senin–Sabtu, 09:00–18:00')).toEqual({
      startDay: 'Senin',
      endDay: 'Sabtu',
      openTime: '09:00',
      closeTime: '18:00',
    })
  })

  it('normalizes the dot time separator used by some examples', () => {
    expect(parseOperatingHours('Senin - Minggu, 08.00 - 20.00')).toEqual({
      startDay: 'Senin',
      endDay: 'Minggu',
      openTime: '08:00',
      closeTime: '20:00',
    })
  })

  it('falls back to defaults for empty or unknown formats', () => {
    expect(parseOperatingHours('')).toEqual(DEFAULT_OPERATING_HOURS)
    expect(parseOperatingHours('Toko buka setiap hari')).toEqual(DEFAULT_OPERATING_HOURS)
    expect(parseOperatingHours(undefined)).toEqual(DEFAULT_OPERATING_HOURS)
  })

  it('round-trips with composeOperatingHours', () => {
    expect(parseOperatingHours(composeOperatingHours(DEFAULT_OPERATING_HOURS))).toEqual(
      DEFAULT_OPERATING_HOURS,
    )
  })
})

describe('isOperatingHoursValid', () => {
  it('accepts an ordered day span with opening before closing', () => {
    expect(isOperatingHoursValid(DEFAULT_OPERATING_HOURS)).toBe(true)
  })

  it('accepts a same-day span', () => {
    expect(
      isOperatingHoursValid({ startDay: 'Sabtu', endDay: 'Sabtu', openTime: '09:00', closeTime: '18:00' }),
    ).toBe(true)
  })

  it('rejects a reversed day span', () => {
    expect(
      isOperatingHoursValid({ startDay: 'Minggu', endDay: 'Senin', openTime: '09:00', closeTime: '18:00' }),
    ).toBe(false)
  })

  it('rejects closing before opening', () => {
    expect(
      isOperatingHoursValid({ startDay: 'Senin', endDay: 'Sabtu', openTime: '18:00', closeTime: '09:00' }),
    ).toBe(false)
  })

  it('rejects an unknown weekday', () => {
    expect(isOperatingHoursValid({ ...DEFAULT_OPERATING_HOURS, startDay: 'HariLibur' })).toBe(false)
  })
})

describe('operating hours constants', () => {
  it('exposes the ordered Indonesian weekday list without duplicates', () => {
    expect(WEEKDAYS).toEqual(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'])
    expect(new Set(WEEKDAYS).size).toBe(WEEKDAYS.length)
  })

  it('maps each weekday to a stable index', () => {
    expect(dayIndex('Senin')).toBe(0)
    expect(dayIndex('Minggu')).toBe(6)
    expect(dayIndex('Tidak Ada')).toBe(-1)
  })
})