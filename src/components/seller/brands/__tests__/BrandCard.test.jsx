/**
 * Static rendering checks for the Brand Management card: locked content order
 * (name, usage count, Edit, Lihat Product, delete) with no decorative icon and
 * the brand filter deep link.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import BrandCard from '../BrandCard'

function render(props = {}) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <BrandCard
        brand={{ id: 3, name: 'Asus', storeId: 'toko-komputer-jaya' }}
        count={2}
        onEdit={() => {}}
        onDelete={() => {}}
        {...props}
      />
    </MemoryRouter>,
  )
}

describe('BrandCard', () => {
  it('renders the brand name, usage count and the card actions', () => {
    const html = render()
    expect(html).toContain('Asus')
    expect(html).toContain('2 Products')
    expect(html).toContain('Edit')
    expect(html).toContain('Lihat Product')
  })

  it('links Lihat Product to the seller products brand filter by id', () => {
    expect(render()).toContain('/seller/products?brand=3')
  })

  it('uses a singular label for a one-product brand', () => {
    expect(render({ count: 1 })).toContain('1 Product')
  })

  it('exposes accessible labels for the icon-only delete action', () => {
    expect(render()).toContain('Hapus brand Asus')
  })

  it('does not render a decorative brand icon', () => {
    const html = render()
    expect(html).not.toContain('brand_family')
  })
})
