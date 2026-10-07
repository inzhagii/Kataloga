/**
 * Consumer test: the Dashboard Customer Interest section renders its own
 * error state (with retry) when the interests request fails, instead of
 * disguising the failure as "no interest yet".
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import CustomerInterestSummary from '../CustomerInterestSummary'

describe('CustomerInterestSummary', () => {
  it('shows the empty state when there is genuinely no interest', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CustomerInterestSummary interests={[]} />
      </MemoryRouter>,
    )
    expect(html).toContain('Belum ada minat pelanggan')
  })

  it('shows its own error state when the request fails', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CustomerInterestSummary
          interests={[]}
          error="Interest service down"
          onRetry={() => {}}
        />
      </MemoryRouter>,
    )
    expect(html).toContain('Gagal memuat customer interest')
    expect(html).toContain('Interest service down')
    expect(html).toContain('Coba Lagi')
    expect(html).not.toContain('Belum ada minat pelanggan')
  })

  it('links "Lihat Semua" to the dedicated route', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <CustomerInterestSummary interests={[]} />
      </MemoryRouter>,
    )
    expect(html).toContain('href="/seller/customer-interest"')
  })
})
