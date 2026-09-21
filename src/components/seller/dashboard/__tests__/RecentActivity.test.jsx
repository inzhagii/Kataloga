/**
 * Consumer test: the Dashboard Recent Activity section is a compact preview
 * of the 4 most recent activities (docs/UI_RULES.md §20) with a "Lihat Semua"
 * link to /seller/activities (locked route).
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import RecentActivity from '../RecentActivity'
import { ACTIVITY_TYPE } from '../../../../constants/enums'

function mk(id, productName) {
  return {
    id,
    storeId: 'toko-komputer-jaya',
    type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    message: `${productName} berhasil dipublikasi.`,
    productId: id,
    productName,
    date: `2026-09-${String(id).padStart(2, '0')}T07:30:00`,
  }
}

const sixActivities = [mk(6, 'P6'), mk(5, 'P5'), mk(4, 'P4'), mk(3, 'P3'), mk(2, 'P2'), mk(1, 'P1')]

describe('RecentActivity (dashboard preview)', () => {
  it('links "Lihat Semua" to the locked /seller/activities route', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RecentActivity activities={[]} />
      </MemoryRouter>,
    )
    expect(html).toContain('Lihat Semua')
    expect(html).toContain('href="/seller/activities"')
  })

  it('shows at most the 4 most recent activities', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RecentActivity activities={sixActivities} />
      </MemoryRouter>,
    )
    expect(html).toContain('P6')
    expect(html).toContain('P5')
    expect(html).toContain('P4')
    expect(html).toContain('P3')
    expect(html).not.toContain('P2')
    expect(html).not.toContain('P1')
  })

  it('renders the empty state when the store has no activities yet', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RecentActivity activities={[]} />
      </MemoryRouter>,
    )
    expect(html).toContain('Belum ada aktivitas')
  })

  it('exposes the section heading for accessibility', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RecentActivity activities={sixActivities.slice(0, 2)} />
      </MemoryRouter>,
    )
    expect(html).toContain('recent-activity-heading')
  })
})