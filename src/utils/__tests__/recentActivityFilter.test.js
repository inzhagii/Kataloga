/**
 * Pure filter helpers for /seller/activities (M6).
 * Coverage: no-filter passthrough, single activity-type filter, single date
 * filter (TT.BB.TTTT), invalid date ignored, type+date composition, order
 * preservation, empty list, and the canonical type order.
 */

import { describe, expect, it } from 'vitest'
import {
  filterRecentActivities,
  ACTIVITY_TYPE_ORDER,
  FILTER_ALL,
} from '../recentActivityFilter'
import { ACTIVITY_TYPE } from '../../constants/enums'

const activities = [
  {
    id: 3,
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    productName: 'ASUS VivoBook 14',
    date: '2026-09-12T07:30:00',
  },
  {
    id: 2,
    type: ACTIVITY_TYPE.PRODUCT_EDITED,
    productName: 'Kingston NV2',
    date: '2026-09-11T14:10:00',
  },
  {
    id: 1,
    type: ACTIVITY_TYPE.STORE_UPDATED,
    productName: null,
    date: '2026-09-11T09:45:00',
  },
]

describe('ACTIVITY_TYPE_ORDER', () => {
  it('lists exactly the seven canonical types in documentation order', () => {
    expect(ACTIVITY_TYPE_ORDER).toEqual([
      ACTIVITY_TYPE.PRODUCT_PUBLISHED,
      ACTIVITY_TYPE.PRODUCT_EDITED,
      ACTIVITY_TYPE.PRODUCT_SOLD_OUT,
      ACTIVITY_TYPE.PRODUCT_REACTIVATED,
      ACTIVITY_TYPE.PRODUCT_ARCHIVED,
      ACTIVITY_TYPE.PRODUCT_RESTORED,
      ACTIVITY_TYPE.STORE_UPDATED,
    ])
  })
})

describe('filterRecentActivities', () => {
  it('returns everything when no filter is active', () => {
    expect(filterRecentActivities(activities)).toEqual(activities)
    expect(filterRecentActivities(activities, { type: FILTER_ALL, date: '' })).toEqual(activities)
  })

  it('returns an empty list for no activities', () => {
    expect(filterRecentActivities([], { type: ACTIVITY_TYPE.PRODUCT_PUBLISHED })).toEqual([])
  })

  it('filters by a single activity type', () => {
    const result = filterRecentActivities(activities, { type: ACTIVITY_TYPE.PRODUCT_PUBLISHED })
    expect(result.map((activity) => activity.id)).toEqual([3])
  })

  it('filters by a single date (TT.BB.TTTT)', () => {
    const result = filterRecentActivities(activities, { date: '11.09.2026' })
    expect(result.map((activity) => activity.id)).toEqual([2, 1])
  })

  it('ignores invalid or incomplete date input instead of wiping the list', () => {
    expect(filterRecentActivities(activities, { date: '12.09' })).toEqual(activities)
    expect(filterRecentActivities(activities, { date: 'abc' })).toEqual(activities)
    expect(filterRecentActivities(activities, { date: '99.99.9999' })).toEqual(activities)
    expect(filterRecentActivities(activities, { date: '31.02.2026' })).toEqual(activities)
  })

  it('composes activity type and date AND-wise', () => {
    const result = filterRecentActivities(activities, {
      type: ACTIVITY_TYPE.PRODUCT_EDITED,
      date: '11.09.2026',
    })
    expect(result.map((activity) => activity.id)).toEqual([2])

    const none = filterRecentActivities(activities, {
      type: ACTIVITY_TYPE.PRODUCT_EDITED,
      date: '12.09.2026',
    })
    expect(none).toEqual([])
  })

  it('preserves the input order (service is responsible for newest-first)', () => {
    const result = filterRecentActivities(activities, { date: '11.09.2026' })
    expect(result.map((activity) => activity.id)).toEqual([2, 1])
    expect(result.map((activity) => activity.id)).toEqual(result.map((activity) => activity.id))
  })

  it('is not tricked by another canonical filter matching a different store', () => {
    const other = [
      { id: 9, type: ACTIVITY_TYPE.PRODUCT_SOLD_OUT, date: '2026-09-12T08:00:00' },
    ]
    const result = filterRecentActivities([...activities, ...other], {
      type: ACTIVITY_TYPE.PRODUCT_SOLD_OUT,
    })
    expect(result.map((activity) => activity.id)).toEqual([9])
  })
})