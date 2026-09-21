/**
 * Static rendering checks for the category form modal: create mode offers a
 * "Kategori Utama" form (name only) and a "Sub Kategori" form (name + parent),
 * headings match the approved terminology, and edit mode keeps the promotion
 * option. Uses react-dom/server and React.createElement (Vitest matches
 * *.test.js).
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CategoryFormModal from '../CategoryFormModal'

const parents = [
  { id: 1, name: 'Gadget Gaming', parentId: null, custom: true },
  { id: 2, name: 'Computer', parentId: null, custom: true },
]

function render({ mode = 'create', category = null, open = true } = {}) {
  return renderToStaticMarkup(
    React.createElement(CategoryFormModal, {
      open,
      mode,
      category,
      parents,
      onClose: () => {},
      onSubmit: () => Promise.resolve({ id: 99 }),
    }),
  )
}

describe('CategoryFormModal', () => {
  it('renders the Kategori Utama create form with only a name field', () => {
    const html = render()
    expect(html).toContain('>Tambah Kategori Utama<')
    expect(html).toContain('Nama Kategori Utama')
    expect(html).toContain('>Buat Kategori Utama<')
    expect(html).toContain('>Kategori Utama<')
    expect(html).toContain('>Sub Kategori<')
    expect(html).not.toContain('category-parent')
    expect(html).not.toContain('Buat Kategori Utama Baru')
  })

  it('renders the segmented Jenis Kategori toggle in create mode', () => {
    const html = render()
    expect(html).toContain('Jenis Kategori')
    expect(html).toContain('aria-pressed="true"')
  })

  it('renders the Kategori Utama parent select when a Sub Kategori is edited', () => {
    const html = render({
      mode: 'edit',
      category: { id: 5, name: 'Keyboard', parentId: 1, custom: true },
    })
    expect(html).toContain('category-parent')
    expect(html).toContain('Jadikan Kategori Utama')
  })

  it('keeps the edit form with the promotion option for a Sub Kategori', () => {
    const html = render({
      mode: 'edit',
      category: { id: 5, name: 'Keyboard', parentId: 1, custom: true },
    })
    expect(html).toContain('>Edit Kategori<')
    expect(html).toContain('category-parent')
    expect(html).toContain('Jadikan Kategori Utama')
    expect(html).toContain('>Simpan<')
  })

  it('renders nothing when closed', () => {
    expect(render({ open: false })).toBe('')
  })
})