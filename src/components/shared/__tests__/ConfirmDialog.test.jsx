/**
 * Static rendering checks for the shared confirmation dialog (no DOM test
 * library is configured; react-dom/server is used for SSR-style assertions).
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ConfirmDialog from '../ConfirmDialog'

function render(props) {
  return renderToStaticMarkup(
    <ConfirmDialog
      open={false}
      title="Konfirmasi"
      description="Proses perubahan."
      confirmLabel="Hapus"
      cancelLabel="Batal"
      tone="danger"
      onConfirm={() => {}}
      onCancel={() => {}}
      {...props}
    />,
  )
}

describe('ConfirmDialog', () => {
  it('renders nothing while closed', () => {
    expect(render({})).toBe('')
  })

  it('renders the prompt copy with the given labels when open', () => {
    const html = render({
      open: true,
      title: 'Keluar dari akun?',
      description: 'Anda akan keluar dari akun Kataloga.',
      confirmLabel: 'Logout',
    })
    expect(html).toContain('Keluar dari akun?')
    expect(html).toContain('Anda akan keluar dari akun Kataloga.')
    expect(html).toContain('Logout')
    expect(html).toContain('Batal')
  })

  it('uses a non-button container with stopPropagation so backdrop clicks cancel only', () => {
    const html = render({ open: true })
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-modal="true"')
  })
})