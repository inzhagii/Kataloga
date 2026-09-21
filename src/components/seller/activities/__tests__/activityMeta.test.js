/**
 * Presentation metadata for Recent Activity (M6).
 * Guarantees the shared ACTIVITY_META covers exactly the seven canonical
 * types with a label, an icon and a tint, and that the filter options expose
 * those seven in documentation order.
 */

import { describe, expect, it } from 'vitest'
import { ACTIVITY_META, ACTIVITY_FILTER_OPTIONS } from '../activityMeta'
import { ACTIVITY_TYPE } from '../../../../constants/enums'

describe('ACTIVITY_META', () => {
  it('covers exactly the seven canonical activity types', () => {
    expect(new Set(Object.keys(ACTIVITY_META))).toEqual(new Set(Object.values(ACTIVITY_TYPE)))
  })

  it('gives every type a label, an icon and a tint class', () => {
    for (const meta of Object.values(ACTIVITY_META)) {
      expect(meta.label.length).toBeGreaterThan(0)
      expect(meta.icon.length).toBeGreaterThan(0)
      expect(meta.tint).toContain('ring-')
    }
  })

  it('labels product-restore distinctly from other updates', () => {
    expect(ACTIVITY_META[ACTIVITY_TYPE.PRODUCT_RESTORED].label).toContain('draft')
    expect(ACTIVITY_META[ACTIVITY_TYPE.STORE_UPDATED].label).toContain('toko')
  })
})

describe('ACTIVITY_FILTER_OPTIONS', () => {
  it('exposes the seven canonical types in documentation order', () => {
    expect(ACTIVITY_FILTER_OPTIONS.map((option) => option.value)).toEqual([
      ACTIVITY_TYPE.PRODUCT_PUBLISHED,
      ACTIVITY_TYPE.PRODUCT_EDITED,
      ACTIVITY_TYPE.PRODUCT_SOLD_OUT,
      ACTIVITY_TYPE.PRODUCT_REACTIVATED,
      ACTIVITY_TYPE.PRODUCT_ARCHIVED,
      ACTIVITY_TYPE.PRODUCT_RESTORED,
      ACTIVITY_TYPE.STORE_UPDATED,
    ])
  })

  it('reuses the timeline labels so list and filter share one source', () => {
    for (const option of ACTIVITY_FILTER_OPTIONS) {
      expect(option.label).toBe(ACTIVITY_META[option.value].label)
    }
  })
})