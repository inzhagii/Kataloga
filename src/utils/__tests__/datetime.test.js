/**
 * Date formatting tests for the canonical seller date display.
 * Canonical rule: DD.MM.YYYY with no weekday or month name (docs/UI_RULES.md).
 * Raw ISO timestamps are never mutated for display — input and expectations
 * use local date components so the tests stay timezone-agnostic.
 */

import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatDateTime,
  toDMY,
  isSameCalendarDate,
  filterBySingleDate,
} from '../datetime'

describe('formatDate', () => {
  it('formats an ISO datetime as DD.MM.YYYY without weekday or month name', () => {
    const iso = new Date(2026, 8, 12, 9, 5).toISOString()
    expect(formatDate(iso)).toBe('12.09.2026')
  })

  it('pads day and month to two digits', () => {
    const iso = new Date(2026, 0, 3, 9, 5).toISOString()
    expect(formatDate(iso)).toBe('03.01.2026')
  })

  it('falls back to the raw value when the input is not a valid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
    expect(formatDate(undefined)).toBe('undefined')
  })

  it('accepts a DD.MM.YYYY string as-is', () => {
    expect(formatDate('12.09.2026')).toBe('12.09.2026')
  })
})

describe('formatDateTime', () => {
  it('formats an ISO datetime as DD.MM.YYYY · HH:MM', () => {
    const iso = new Date(2026, 8, 12, 7, 30).toISOString()
    expect(formatDateTime(iso)).toBe('12.09.2026 · 07:30')
  })

  it('pads hours and minutes to two digits', () => {
    const iso = new Date(2026, 8, 12, 9, 5).toISOString()
    expect(formatDateTime(iso)).toBe('12.09.2026 · 09:05')
  })

  it('falls back to the raw value when the input is not a valid date', () => {
    expect(formatDateTime('garbage')).toBe('garbage')
  })
})

describe('toDMY', () => {
  it('extracts dd/mm/yyyy components from an ISO string', () => {
    const iso = new Date(2026, 8, 12, 7, 30).toISOString()
    expect(toDMY(iso)).toEqual({ ddmmyyyy: '12.09.2026', dd: '12', mm: '09', yyyy: '2026' })
  })

  it('returns null for invalid input', () => {
    expect(toDMY('nope')).toBeNull()
    expect(toDMY('')).toBeNull()
  })
})

describe('isSameCalendarDate (single-date filter)', () => {
  it('matches two ISO values on the same calendar day', () => {
    const a = new Date(2026, 8, 12, 0, 1).toISOString()
    const b = new Date(2026, 8, 12, 23, 59).toISOString()
    expect(isSameCalendarDate(a, b)).toBe(true)
  })

  it('distinguishes days across a calendar boundary', () => {
    const a = new Date(2026, 8, 12, 23, 59).toISOString()
    const b = new Date(2026, 8, 13, 0, 1).toISOString()
    expect(isSameCalendarDate(a, b)).toBe(false)
  })

  it('matches an ISO candidate against a DD.MM.YYYY target', () => {
    const iso = new Date(2026, 8, 12, 7, 30).toISOString()
    expect(isSameCalendarDate(iso, '12.09.2026')).toBe(true)
    expect(isSameCalendarDate(iso, '13.09.2026')).toBe(false)
  })

  it('is false when either input is invalid', () => {
    expect(isSameCalendarDate('garbage', new Date(2026, 8, 12).toISOString())).toBe(false)
  })
})

describe('filterBySingleDate', () => {
  const records = [
    { id: 1, date: new Date(2026, 8, 12, 1, 0).toISOString() },
    { id: 2, date: new Date(2026, 8, 12, 23, 59).toISOString() },
    { id: 3, date: new Date(2026, 8, 13, 0, 1).toISOString() },
    { id: 4, date: 'invalid' },
  ]

  it('keeps only records on the same calendar date (single date, not a range)', () => {
    const result = filterBySingleDate(records, new Date(2026, 8, 12, 12, 0))
    expect(result.map((record) => record.id)).toEqual([1, 2])
  })

  it('matches nothing when the target date has no records', () => {
    expect(filterBySingleDate(records, new Date(2026, 8, 15, 12, 0))).toEqual([])
  })

  it('supports a custom date accessor', () => {
    const custom = records.map((record) => ({ name: `n${record.id}`, happenedAt: record.date }))
    const result = filterBySingleDate(custom, new Date(2026, 8, 12, 12, 0), (record) => record.happenedAt)
    expect(result.map((record) => record.name)).toEqual(['n1', 'n2'])
  })
})