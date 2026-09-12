/**
 * Customer Interest page.
 * Displays meaningful customer activities (WhatsApp Click, Marketplace Click)
 * with informational summary cards, search, activity filter, and a display-only
 * detail modal that groups history by customer identity.
 * This is an activity list — not a CRM.
 */

import { useMemo, useState } from 'react'
import { useCustomerInterest } from '../../hooks/useCustomerInterest'
import EmptyState from '../../components/shared/EmptyState'
import InterestFilters from '../../components/seller/customer-interest/InterestFilters'
import InterestSummary from '../../components/seller/customer-interest/InterestSummary'
import InterestList from '../../components/seller/customer-interest/InterestList'
import InterestDetailModal from '../../components/seller/customer-interest/InterestDetailModal'

function CustomerInterestPage() {
  const { status, error, interests, summary, productById, reload } = useCustomerInterest()
  const [query, setQuery] = useState('')
  const [activityFilter, setActivityFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return interests
      .filter((record) => {
        if (activityFilter !== 'ALL' && record.channelType !== activityFilter) {
          return false
        }
        if (!q) {
          return true
        }
        return (
          record.customerName.toLowerCase().includes(q) ||
          (record.productName || '').toLowerCase().includes(q) ||
          record.channel.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [interests, query, activityFilter])

  const canReset = query.trim() !== '' || activityFilter !== 'ALL'

  function handleReset() {
    setQuery('')
    setActivityFilter('ALL')
  }

  if (status === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-xl bg-surface-container-high/60" />
          ))}
        </div>
        <div className="h-12 w-full animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-surface-container-high/60" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Customer Interest
        </h1>
        <EmptyState
          icon="error"
          title="Gagal memuat customer interest"
          description={error}
          action={
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    )
  }

  if (interests.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Customer Interest
        </h1>
        <p className="mt-1 text-sm text-secondary">Data prospek dan minat pelanggan.</p>
        <div className="mt-6">
          <InterestSummary
            totalInterest={summary.totalInterest}
            whatsappClicks={summary.whatsappClicks}
            marketplaceClicks={summary.marketplaceClicks}
          />
        </div>
        <EmptyState
          icon="favorite_border"
          title="Belum ada minat pelanggan"
          description="Customer yang menekan WhatsApp atau memilih kanal marketplace akan muncul di sini."
        />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
        Customer Interest
      </h1>
      <p className="mt-1 text-sm text-secondary">Data prospek dan minat pelanggan.</p>

      <div className="mt-6">
        <InterestSummary
          totalInterest={summary.totalInterest}
          whatsappClicks={summary.whatsappClicks}
          marketplaceClicks={summary.marketplaceClicks}
        />
      </div>

      <div className="mt-6">
        <InterestFilters
          query={query}
          onQueryChange={setQuery}
          activityFilter={activityFilter}
          onActivityFilterChange={setActivityFilter}
          onReset={handleReset}
          canReset={canReset}
        />
      </div>

      <p className="mb-4 mt-4 text-xs text-on-surface-variant sm:text-right">
        Menampilkan <span className="font-semibold text-on-surface">{filtered.length}</span>{' '}
        aktivitas
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon="filter_list_off"
          title="Tidak ada aktivitas yang cocok"
          description="Coba gunakan kata kunci lain atau ubah filter aktivitas untuk menemukan log customer."
          action={
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                restart_alt
              </span>
              Reset Filter / Cari Ulang
            </button>
          }
        />
      ) : (
        <InterestList
          interests={filtered}
          allInterests={interests}
          productById={productById}
          onSelect={setSelected}
        />
      )}

      <InterestDetailModal
        record={selected}
        interests={interests}
        productById={productById}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}

export default CustomerInterestPage