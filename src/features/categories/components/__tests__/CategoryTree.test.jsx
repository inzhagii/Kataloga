/**
 * Static rendering checks for the seller Category tree.
 * Covers B2: custom Kategori Utama expose edit/delete actions (default
 * categories stay read-only) and parent rows show the aggregate descendant
 * product usage supplied through `usageCounts`.
 */

import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import CategoryTree from '../CategoryTree'

const parents = [
  { id: 1, name: 'Elektronik', parentId: null, custom: false },
  { id: 4, name: 'Gaming', parentId: null, custom: true, storeId: 'store-a' },
]

const childrenByParent = {
  1: [{ id: 2, name: 'Laptop', parentId: 1, custom: false }],
  4: [{ id: 5, name: 'Gadget Gaming', parentId: 4, custom: true, storeId: 'store-a' }],
}

const usageCounts = { 1: 5, 2: 3, 4: 0, 5: 0 }

function render(overrides = {}) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <CategoryTree
        parents={parents}
        childrenByParent={childrenByParent}
        usageCounts={usageCounts}
        collapsed={new Set()}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>,
  )
}

describe('CategoryTree', () => {
  it('shows the aggregate descendant usage on a Kategori Utama row', () => {
    const html = render()
    expect(html).toContain('Elektronik')
    expect(html).toContain('5 Products')
    expect(html).toContain('3 Products')
  })

  it('exposes edit/delete actions for a custom Kategori Utama', () => {
    const html = render()
    expect(html).toContain('Tindakan untuk Gaming')
  })

  it('keeps default categories read-only (no row actions)', () => {
    const html = render()
    expect(html).not.toContain('Tindakan untuk Elektronik')
    expect(html).not.toContain('Tindakan untuk Laptop')
  })

  it('still exposes edit/delete actions for custom Sub Kategori', () => {
    const html = render()
    expect(html).toContain('Tindakan untuk Gadget Gaming')
  })

  it('links every row to the seller products filter', () => {
    const html = render()
    expect(html).toContain('href="/seller/products?category=1"')
    expect(html).toContain('href="/seller/products?category=2"')
  })
})
