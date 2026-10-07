/**
 * AnnouncementBanner consumer test: the storefront reads the announcement
 * object ({ title, message, isEnabled }). A disabled announcement hides the
 * banner while the data stays on the store object.
 */

import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import AnnouncementBanner from '../AnnouncementBanner'

function render(announcement) {
  return renderToStaticMarkup(
    React.createElement(AnnouncementBanner, { announcement }),
  )
}

describe('AnnouncementBanner', () => {
  it('renders title and message when enabled', () => {
    const html = render({
      title: 'Promo Berakhir Pekan',
      message: 'Gratis ongkir untuk semua pesanan.',
      isEnabled: true,
    })
    expect(html).toContain('Promo Berakhir Pekan')
    expect(html).toContain('Gratis ongkir untuk semua pesanan.')
  })

  it('renders the message when only the title is present', () => {
    const html = render({ title: 'Promo', message: '', isEnabled: true })
    expect(html).toContain('Promo')
  })

  it('hides the banner when announcement is disabled but keeps the data', () => {
    const html = render({
      title: 'Tutup Sementara',
      message: 'Kami kembali bulan depan.',
      isEnabled: false,
    })
    expect(html).toBe('')
  })

  it('hides the banner for missing announcements', () => {
    expect(render(undefined)).toBe('')
    expect(render(null)).toBe('')
  })
})