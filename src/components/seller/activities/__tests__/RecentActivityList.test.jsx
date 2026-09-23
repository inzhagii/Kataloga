/**
 * Consumer test: the Recent Activity timeline renders the canonical activity
 * types (docs/AGENTS.md §20) as clean rows — a per-type icon bubble, a
 * DD.MM.YYYY · HH:MM datetime and the short activity message. No wrapped
 * product chips and no separate type-label row (the message already carries
 * product context).
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RecentActivityList from '../RecentActivityList'
import { ACTIVITY_META } from '../activityMeta'
import { ACTIVITY_TYPE } from '../../../../constants/enums'

function mk(id, type, message, productName = null) {
  return {
    id,
    storeId: 'toko-komputer-jaya',
    type,
    message,
    productId: productName ? id : null,
    productName,
    date: '2026-09-12T07:30:00',
  }
}

const canonicalTypes = [
  mk(1, ACTIVITY_TYPE.PRODUCT_PUBLISHED, 'Laptop A berhasil dipublikasi.', 'Laptop A'),
  mk(2, ACTIVITY_TYPE.PRODUCT_EDITED, 'Laptop B diperbarui.', 'Laptop B'),
  mk(3, ACTIVITY_TYPE.PRODUCT_SOLD_OUT, 'Laptop C ditandai Sold Out.', 'Laptop C'),
  mk(4, ACTIVITY_TYPE.PRODUCT_REACTIVATED, 'Laptop D kembali aktif.', 'Laptop D'),
  mk(5, ACTIVITY_TYPE.PRODUCT_ARCHIVED, 'Laptop E diarsipkan.', 'Laptop E'),
  mk(6, ACTIVITY_TYPE.PRODUCT_RESTORED, 'Laptop F dikembalikan ke draft.', 'Laptop F'),
  mk(7, ACTIVITY_TYPE.CATEGORY_CREATED, 'Kategori dibuat: Gaming.', null),
  mk(8, ACTIVITY_TYPE.CATEGORY_UPDATED, 'Kategori diperbarui: Laptop.', null),
  mk(9, ACTIVITY_TYPE.ANNOUNCEMENT_CREATED, 'Pengumuman dibuat: Promo.', null),
  mk(10, ACTIVITY_TYPE.ANNOUNCEMENT_UPDATED, 'Pengumuman diperbarui: Promo.', null),
  mk(11, ACTIVITY_TYPE.STORE_UPDATED, 'Informasi toko diperbarui.', null),
]

describe('RecentActivityList', () => {
  it('renders the overall empty state when there are no activities', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={[]} />)
    expect(html).toContain('Belum ada aktivitas')
    expect(html).not.toContain('<li')
  })

  it('renders all canonical activity messages once each', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={canonicalTypes} />)
    for (const activity of canonicalTypes) {
      expect(html).toContain(activity.message)
    }
  })

  it('renders a raw external PRODUCT_UPDATED record with the product-update treatment', () => {
    const raw = mk(12, 'PRODUCT_UPDATED', 'Laptop G diperbarui oleh backend.', 'Laptop G')
    const html = renderToStaticMarkup(
      <RecentActivityList activities={[raw, canonicalTypes[0]]} />,
    )
    expect(html).toContain('Laptop G diperbarui oleh backend.')
  })

  it('never renders non-canonical activity types', () => {
    const stray = mk(99, 'PRODUCT_VIEW', 'Melihat produk — bukan activity seller.')
    const html = renderToStaticMarkup(
      <RecentActivityList activities={[stray, canonicalTypes[0]]} />,
    )
    expect(html).not.toContain('Melihat produk')
    expect(html).not.toContain('PRODUCT_VIEW')
    expect(html).toContain('Laptop A berhasil dipublikasi.')
  })

  it('renders store events without any product chip', () => {
    const storeOnly = renderToStaticMarkup(
      <RecentActivityList activities={[canonicalTypes[10]]} />,
    )
    expect(storeOnly).toContain('Informasi toko diperbarui.')
    expect(storeOnly).not.toContain('inventory_2')
  })

  it('displays timestamps in the canonical DD.MM.YYYY · HH:MM format', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={[canonicalTypes[0]]} />)
    expect(html).toContain('12.09.2026')
    expect(html).toContain('07:30')
    expect(html).toContain('12.09.2026 · 07:30')
  })

  it('renders a per-type icon bubble and datetime on every row (no label/chip)', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={[canonicalTypes[0]]} />)
    const item = html.slice(html.indexOf('<li'), html.indexOf('</li>'))
    expect(item).toContain('12.09.2026 · 07:30')
    expect(item).toContain('Laptop A berhasil dipublikasi.')
    expect(item).toContain('material-symbols-outlined')
    expect(item).not.toContain('inventory_2')
    expect(item).not.toContain('>Produk dipublikasi<')
  })

  it('uses the intended icon for every known activity type', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={canonicalTypes} />)
    const icons = Object.values(ACTIVITY_META).map((meta) => meta.icon)
    expect(icons.length).toBe(Object.keys(ACTIVITY_META).length)
    for (const icon of icons) {
      expect(html).toContain(`>${icon}<`)
    }
  })
})