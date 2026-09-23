/**
 * Presentation metadata for Recent Activity (M6).
 * Guarantees the shared ACTIVITY_META covers every canonical activity type
 * (docs/AGENTS.md §20) plus the external "PRODUCT_UPDATED" alias with a label,
 * an icon and a tint, and that the filter options expose the canonical types
 * in documentation order.
 */

import { describe, expect, it } from 'vitest'
import { ACTIVITY_META, ACTIVITY_FILTER_OPTIONS } from '../activityMeta'
import { ACTIVITY_TYPE } from '../../../../constants/enums'

const PRODUCT_UPDATED_ALIAS = 'PRODUCT_UPDATED'

describe('ACTIVITY_META', () => {
  it('covers every canonical activity type plus the PRODUCT_UPDATED alias', () => {
    expect(new Set(Object.keys(ACTIVITY_META))).toEqual(
      new Set([...Object.values(ACTIVITY_TYPE), PRODUCT_UPDATED_ALIAS]),
    )
  })

  it('gives every type a label, an icon and a tint class', () => {
    for (const meta of Object.values(ACTIVITY_META)) {
      expect(meta.label.length).toBeGreaterThan(0)
      expect(meta.icon.length).toBeGreaterThan(0)
      expect(meta.tint).toContain('ring-')
    }
  })

  it('gives the external PRODUCT_UPDATED alias the same treatment as PRODUCT_EDITED', () => {
    expect(ACTIVITY_META[PRODUCT_UPDATED_ALIAS]).toEqual(
      ACTIVITY_META[ACTIVITY_TYPE.PRODUCT_EDITED],
    )
  })

  it('labels product-restore distinctly from other updates', () => {
    expect(ACTIVITY_META[ACTIVITY_TYPE.PRODUCT_RESTORED].label).toContain('draft')
    expect(ACTIVITY_META[ACTIVITY_TYPE.STORE_UPDATED].label).toContain('toko')
  })

  it('labels category and announcement events with their own copy', () => {
    expect(ACTIVITY_META[ACTIVITY_TYPE.CATEGORY_CREATED].label).toContain('Kategori')
    expect(ACTIVITY_META[ACTIVITY_TYPE.CATEGORY_UPDATED].label).toContain('Kategori')
    expect(ACTIVITY_META[ACTIVITY_TYPE.ANNOUNCEMENT_CREATED].label).toContain('Pengumuman')
    expect(ACTIVITY_META[ACTIVITY_TYPE.ANNOUNCEMENT_UPDATED].label).toContain('Pengumuman')
  })
})

describe('ACTIVITY_FILTER_OPTIONS', () => {
  it('exposes the canonical types in documentation order, one option per type', () => {
    expect(ACTIVITY_FILTER_OPTIONS.map((option) => option.value)).toEqual([
      ACTIVITY_TYPE.PRODUCT_PUBLISHED,
      ACTIVITY_TYPE.PRODUCT_EDITED,
      ACTIVITY_TYPE.PRODUCT_SOLD_OUT,
      ACTIVITY_TYPE.PRODUCT_REACTIVATED,
      ACTIVITY_TYPE.PRODUCT_ARCHIVED,
      ACTIVITY_TYPE.PRODUCT_RESTORED,
      ACTIVITY_TYPE.CATEGORY_CREATED,
      ACTIVITY_TYPE.CATEGORY_UPDATED,
      ACTIVITY_TYPE.ANNOUNCEMENT_CREATED,
      ACTIVITY_TYPE.ANNOUNCEMENT_UPDATED,
      ACTIVITY_TYPE.STORE_UPDATED,
    ])
  })

  it('uses the timeline labels so list and filter share one source', () => {
    for (const option of ACTIVITY_FILTER_OPTIONS) {
      expect(option.label).toBe(ACTIVITY_META[option.value].label)
    }
  })
})