import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import OtpInput from '../OtpInput'

function render(props) {
  return renderToStaticMarkup(createElement(OtpInput, { onChange: () => {}, ...props }))
}

describe('OtpInput', () => {
  it('renders an accessible numeric one-time-code field', () => {
    const html = render({ id: 'otp', value: '123456' })
    expect(html).toContain('inputMode="numeric"')
    expect(html).toContain('autoComplete="one-time-code"')
    expect(html).toContain('maxLength="6"')
    expect(html).toContain('Kode verifikasi')
  })

  it('marks the field invalid and shows the error message', () => {
    const html = render({ id: 'otp', value: '', error: 'Kode verifikasi salah.' })
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('Kode verifikasi salah.')
  })
})
