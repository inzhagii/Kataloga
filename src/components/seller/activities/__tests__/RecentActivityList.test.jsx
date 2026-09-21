/**
 * Consumer test: the Recent Activity timeline renders only the seven canonical
 * types as icon-anchored items with label, message, related product (when the
 * event carries one) and a DD.MM.YYYY · HH:MM timestamp (M6 §1/§6).
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RecentActivityList from '../RecentActivityList'
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

const allSeven = [
  mk(1, ACTIVITY_TYPE.PRODUCT_PUBLISHED, 'Laptop A berhasil dipublikasi.', 'Laptop A'),
  mk(2, ACTIVITY_TYPE.PRODUCT_EDITED, 'Laptop B diperbarui.', 'Laptop B'),
  mk(3, ACTIVITY_TYPE.PRODUCT_SOLD_OUT, 'Laptop C ditandai Sold Out.', 'Laptop C'),
  mk(4, ACTIVITY_TYPE.PRODUCT_REACTIVATED, 'Laptop D kembali aktif.', 'Laptop D'),
  mk(5, ACTIVITY_TYPE.PRODUCT_ARCHIVED, 'Laptop E diarsipkan.', 'Laptop E'),
  mk(6, ACTIVITY_TYPE.PRODUCT_RESTORED, 'Laptop F dikembalikan ke draft.', 'Laptop F'),
  mk(7, ACTIVITY_TYPE.STORE_UPDATED, 'Informasi toko diperbarui.'),
]

describe('RecentActivityList', () => {
  it('renders the overall empty state when there are no activities', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={[]} />)
    expect(html).toContain('Belum ada aktivitas')
    expect(html).not.toContain('<li')
  })

  it('renders all seven canonical activity labels once each', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={allSeven} />)
    expect(html).toContain('Produk dipublikasi')
    expect(html).toContain('Produk diperbarui')
    expect(html).toContain('Produk Sold Out')
    expect(html).toContain('Produk diaktifkan kembali')
    expect(html).toContain('Produk diarsipkan')
    expect(html).toContain('Produk direstore ke draft')
    expect(html).toContain('Informasi toko diperbarui')
  })

  it('never renders non-canonical activity types', () => {
    const stray = mk(99, 'CATEGORY_CREATED', 'Kategori dibuat.')
    const html = renderToStaticMarkup(
      <RecentActivityList activities={[stray, allSeven[0]]} />,
    )
    expect(html).not.toContain('Kategori dibuat.')
    expect(html).not.toContain('CATEGORY_CREATED')
    expect(html).toContain('Laptop A berhasil dipublikasi.')
  })

  it('shows the related product on product events and no product chip on store events', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={allSeven} />)
    expect(html).toContain('Laptop A')
    expect(html).toContain('Laptop F')

    const storeOnly = renderToStaticMarkup(
      <RecentActivityList activities={[allSeven[6]]} />,
    )
    expect(storeOnly).not.toContain('inventory_2')
  })

  it('displays timestamps in the canonical DD.MM.YYYY · HH:MM format', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={[allSeven[0]]} />)
    expect(html).toContain('12.09.2026')
    expect(html).toContain('07:30')
    expect(html).toContain('12.09.2026 · 07:30')
  })

  it('keeps label, message and timestamp hierarchy on every item', () => {
    const html = renderToStaticMarkup(<RecentActivityList activities={[allSeven[0]]} />)
    const item = html.slice(html.indexOf('<li'), html.indexOf('</li>'))
    expect(item).toContain('Produk dipublikasi')
    expect(item).toContain('Laptop A berhasil dipublikasi.')
    expect(item).toContain('12.09.2026 · 07:30')
    expect(item).toContain('Laptop A')
  })
})