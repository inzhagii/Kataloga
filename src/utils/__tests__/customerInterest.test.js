/**
 * Customer identity helpers for Customer Interest (M4).
 * Identity fallback: customerId > name > email > phone. Records without any
 * identity fall back to their own record id so they never merge into another
 * customer's history. Display name never fabricates a placeholder.
 */

import { describe, expect, it } from 'vitest'
import {
  customerIdentityOf,
  customerDisplayName,
  customerIdentityValue,
  countCustomerActivities,
  customerActivities,
  customerSupportingIdentity,
  groupCustomerActivitiesByDate,
} from '../customerInterest'

function mk(overrides = {}) {
  return { id: 1, ...overrides }
}

describe('customerIdentityOf', () => {
  it('prefers the account id when available', () => {
    expect(customerIdentityOf(mk({ customerId: 11 }))).toBe('u-11')
    expect(customerIdentityOf(mk({ customerId: 11, customerName: 'Budi' }))).toBe('u-11')
  })

  it('falls back to name, then email, then phone', () => {
    expect(customerIdentityOf(mk({ customerName: 'Budi', customerEmail: 'b@x.com' }))).toBe(
      'n-budi',
    )
    expect(customerIdentityOf(mk({ customerEmail: 'B@X.com' }))).toBe('n-b@x.com')
    expect(customerIdentityOf(mk({ customerEmail: null, customerPhone: '08123' }))).toBe(
      'n-08123',
    )
  })

  it('is case- and whitespace-insensitive when matching on email/phone', () => {
    expect(customerIdentityOf(mk({ customerEmail: '  A@B.COM ' }))).toBe('n-a@b.com')
  })

  it('falls back to the record id when no identity exists', () => {
    expect(customerIdentityOf(mk({}))).toBe('r-1')
  })
})

describe('customerIdentityValue', () => {
  it('returns null when the record carries no identity', () => {
    expect(customerIdentityValue(mk({}))).toBeNull()
    expect(customerIdentityValue(mk({ customerName: '' }))).toBeNull()
  })
})

describe('customerDisplayName', () => {
  it('prefers name over email and phone', () => {
    expect(
      customerDisplayName(
        mk({ customerName: 'Budi', customerEmail: 'b@x.com', customerPhone: '08123' }),
      ),
    ).toBe('Budi')
  })

  it('falls back to email when the name is missing', () => {
    expect(
      customerDisplayName(mk({ customerName: null, customerEmail: 'b@x.com', customerPhone: '08123' })),
    ).toBe('b@x.com')
  })

  it('falls back to phone when name and email are missing', () => {
    expect(customerDisplayName(mk({ customerName: null, customerEmail: null, customerPhone: '08123' }))).toBe(
      '08123',
    )
  })

  it('returns null (no placeholder) when no identity exists', () => {
    expect(customerDisplayName(mk({}))).toBeNull()
  })
})

describe('customer interaction grouping', () => {
  const sameCustomer = [
    mk({ id: 1, customerId: 7, customerName: 'Budi', date: '2026-09-01T00:00:00.000Z' }),
    mk({ id: 2, customerId: 7, customerName: 'Budi', date: '2026-09-10T00:00:00.000Z' }),
  ]
  const emailOnly = [
    mk({ id: 3, customerEmail: 'anon@example.com', date: '2026-09-05T00:00:00.000Z' }),
    mk({ id: 4, customerEmail: 'anon@example.com', date: '2026-09-08T00:00:00.000Z' }),
  ]

  it('counts all activities of the same customer across the list', () => {
    expect(countCustomerActivities(sameCustomer, sameCustomer[0])).toBe(2)
    expect(countCustomerActivities(emailOnly, emailOnly[0])).toBe(2)
  })

  it('customerActivities lists the same customer newest first', () => {
    expect(customerActivities(sameCustomer, sameCustomer[0]).map((item) => item.id)).toEqual([2, 1])
  })

  it('does not merge a record with no identity into other customers', () => {
    const nameless = mk({ id: 9, customerId: null })
    const all = [...sameCustomer, nameless]
    expect(countCustomerActivities(all, nameless)).toBe(1)
  })
})

describe('customerSupportingIdentity', () => {
  it('shows email when the primary identity is the name', () => {
    expect(
      customerSupportingIdentity(
        mk({ customerName: 'Budi', customerEmail: 'b@x.com', customerPhone: '08123' }),
      ),
    ).toBe('b@x.com')
  })

  it('falls back to phone when the name has no email', () => {
    expect(customerSupportingIdentity(mk({ customerName: 'Budi', customerPhone: '08123' }))).toBe(
      '08123',
    )
  })

  it('returns null when the primary display value is already the email or phone', () => {
    expect(customerSupportingIdentity(mk({ customerName: null, customerEmail: 'b@x.com' }))).toBeNull()
    expect(customerSupportingIdentity(mk({ customerName: 'Budi' }))).toBeNull()
  })
})

describe('groupCustomerActivitiesByDate', () => {
  const history = [
    mk({ id: 1, customerId: 7, customerName: 'Budi', date: '2026-09-10T09:00:00.000Z' }),
    mk({ id: 2, customerId: 7, customerName: 'Budi', date: '2026-09-10T15:00:00.000Z' }),
    mk({ id: 3, customerId: 7, customerName: 'Budi', date: '2026-08-25T12:00:00.000Z' }),
    mk({ id: 4, customerId: 7, customerName: 'Budi', date: 'not-a-date' }),
  ]

  it('groups activities by calendar day, newest group first', () => {
    const groups = groupCustomerActivitiesByDate(history, history[0])
    expect(groups.map((group) => group.label)).toEqual(['10.09.2026', '25.08.2026'])
    expect(groups[0].items.map((item) => item.id)).toEqual([2, 1])
  })

  it('skips records with an invalid date', () => {
    const groups = groupCustomerActivitiesByDate(history, history[0])
    const allItems = groups.flatMap((group) => group.items)
    expect(allItems.map((item) => item.id)).not.toContain(4)
  })
})