/**
 * Static rendering checks for the Brand add/edit dialog (create mode: [Batal]
 * [Buat Brand]; edit mode: [Batal] [Simpan]).
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import BrandFormModal from '../BrandFormModal'

function render(props = {}) {
  return renderToStaticMarkup(
    <BrandFormModal
      open={false}
      mode="create"
      brand={null}
      onClose={() => {}}
      onSubmit={() => Promise.resolve({})}
      {...props}
    />,
  )
}

describe('BrandFormModal', () => {
  it('renders nothing while closed', () => {
    expect(render({})).toBe('')
  })

  it('renders the create form with a name field and the locked button labels', () => {
    const html = render({ open: true })
    expect(html).toContain('Buat Brand')
    expect(html).toContain('brand-name')
    expect(html).toContain('Nama Brand')
    expect(html).toContain('Batal')
  })

  it('renders the edit form with Simpan and the current name', () => {
    const html = render({
      open: true,
      mode: 'edit',
      brand: { id: 3, name: 'Asus', storeId: 'toko-komputer-jaya' },
    })
    expect(html).toContain('Edit Brand')
    expect(html).toContain('Simpan')
    expect(html).toContain('value="Asus"')
  })
})
