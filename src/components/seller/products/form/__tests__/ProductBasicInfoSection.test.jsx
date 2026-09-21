/**
 * Static rendering checks for the brand control in the shared product form
 * (M7 Add/Edit Product integration): existing brands are selectable and a new
 * brand can be typed inline.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductBasicInfoSection from '../ProductBasicInfoSection'

const brands = [
  { id: 3, name: 'Asus', storeId: 'toko-komputer-jaya' },
  { id: 4, name: 'Lenovo', storeId: 'toko-komputer-jaya' },
]

function render(brand) {
  return renderToStaticMarkup(
    <ProductBasicInfoSection
      form={{ name: 'Laptop', category: 'Laptop', brand }}
      errors={{}}
      categories={[]}
      brands={brands}
      setField={() => {}}
    />,
  )
}

describe('ProductBasicInfoSection brand control', () => {
  it('lists the store brands and the new-brand option', () => {
    const html = render('')
    expect(html).toContain('Pilih brand')
    expect(html).toContain('Asus')
    expect(html).toContain('Lenovo')
    expect(html).toContain('+ Brand Baru')
    expect(html).not.toContain('Nama brand baru')
  })

  it('keeps an existing brand selected without showing the new-brand input', () => {
    const html = render('Asus')
    expect(html).toContain('Asus')
    expect(html).not.toContain('Nama brand baru')
  })

  it('shows the inline new-brand input for a name outside the store list', () => {
    const html = render('Framework')
    expect(html).toContain('Nama brand baru')
    expect(html).toContain('value="Framework"')
  })
})
