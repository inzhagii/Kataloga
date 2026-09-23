/**
 * Customer Interest page.
 * Displays meaningful customer activities (WhatsApp Click, Marketplace Click)
 * as an activity list — not a CRM.
 *
 * Layout per docs/UI_RULES.md §31/§56:
 * - Channel cards reflect WhatsApp + the store's configured external channels.
 * - Total Interest is inline when channels < 4, in the header when >= 4.
 * - Search + filters (Aktivitas, Channel, single Tanggal, Kategori, Brand,
 *   Produk) compose; Total always follows the active filter result.
 * - Lihat Detail opens a modal with the customer's grouped interaction history.
 */

import { useMemo, useState } from 'react'
import { useCustomerInterest } from '../../hooks/useCustomerInterest'
import { ACTIVITY_FILTERS } from '../../components/seller/customer-interest/activityFilters'
import EmptyState from '../../components/shared/EmptyState'
import InterestFilters from '../../components/seller/customer-interest/InterestFilters'
import InterestChannelCards from '../../components/seller/customer-interest/InterestChannelCards'
import InterestList from '../../components/seller/customer-interest/InterestList'
import InterestDetailModal from '../../components/seller/customer-interest/InterestDetailModal'
import {
  countByChannel,
  FILTER_ALL,
} from '../../utils/customerInterestChannels'
import { filterCustomerInterests } from '../../utils/customerInterestFilter'

const DEFAULT_FILTERS = {
  activity: 'ALL',
  channel: FILTER_ALL,
  date: '',
  category: FILTER_ALL,
  brand: FILTER_ALL,
  productId: null,
}

function CustomerInterestPage() {
  const { status, error, interests, productById, categories, channelOptions, channelDefinitions, filterOptions, reload } =
    useCustomerInterest()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const result = filterCustomerInterests(interests, {
      query,
      activity: filters.activity,
      channel: filters.channel,
      date: filters.date,
      category: filters.category,
      brand: filters.brand,
      productId: filters.productId,
      productById,
      categories,
      productCategories: filterOptions.categories,
    })
    return [...result].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [interests, query, filters, productById, filterOptions, categories])

  const currentChannels = channelOptions.current
  const channelCounts = {}
  for (const channel of currentChannels) {
    channelCounts[channel.name] = countByChannel(interests, channel.name)
  }

  const activeFilterCount = [
    filters.activity !== 'ALL',
    filters.channel !== FILTER_ALL,
    filters.date !== '',
    filters.category !== FILTER_ALL,
    filters.brand !== FILTER_ALL,
    filters.productId != null,
  ].filter(Boolean).length

  const canReset = query.trim() !== '' || activeFilterCount > 0
  const hasChannels = channelOptions.current.length >= 4

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function handleSelectChannel(channelName) {
    setFilter('channel', filters.channel === channelName ? FILTER_ALL : channelName)
  }

  function handleReset() {
    setQuery('')
    setFilters(DEFAULT_FILTERS)
  }

  if (status === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 w-36 shrink-0 animate-pulse rounded-xl bg-surface-container-high/60" />
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
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Customer Interest
          </h1>
        </div>
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
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Customer Interest
          </h1>
          <p className="mt-1 text-sm text-secondary">Data prospek dan minat pelanggan.</p>
        </div>

        <div className="mt-6">
          <InterestChannelCards
            channels={channelOptions.current}
            counts={channelCounts}
            activeChannel={filters.channel}
            onSelectChannel={handleSelectChannel}
            total={0}
          />
        </div>

        <div className="mt-6">
          <EmptyState
            icon="favorite_border"
            title="Belum ada minat pelanggan"
            description="Customer yang menekan WhatsApp atau memilih kanal marketplace akan muncul di sini."
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Customer Interest
          </h1>
          <p className="mt-1 text-sm text-secondary">Data prospek dan minat pelanggan.</p>
        </div>
        {hasChannels ? (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
              favorite_border
            </span>
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary">
                Total Interest
              </span>
              <span className="text-xl font-extrabold leading-tight text-on-surface">
                {filtered.length}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <InterestChannelCards
          channels={channelOptions.current}
          counts={channelCounts}
          activeChannel={filters.channel}
          onSelectChannel={handleSelectChannel}
          total={filtered.length}
        />
      </div>

      <div className="mt-6">
        <InterestFilters
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFilterChange={setFilter}
          onReset={handleReset}
          canReset={canReset}
          activeFilterCount={activeFilterCount}
          activityFilterOptions={ACTIVITY_FILTERS}
          channelOptions={channelOptions.all}
          categoryOptions={filterOptions.categoryOptions}
          brands={filterOptions.brands}
          products={filterOptions.products}
        />
      </div>

      <p className="mb-4 mt-4 text-xs text-on-surface-variant sm:text-right">
        Menampilkan <span className="font-semibold text-on-surface">{filtered.length}</span>{' '}
        aktivitas
        {canReset ? ' sesuai filter saat ini' : ''}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon="filter_list_off"
          title="Tidak ada aktivitas yang cocok"
          description="Coba gunakan kata kunci lain atau ubah filter untuk menemukan log customer."
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
          definitions={channelDefinitions}
          onSelect={setSelected}
        />
      )}

      {selected ? (
        <InterestDetailModal
          record={selected}
          interests={interests}
          productById={productById}
          definitions={channelDefinitions}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  )
}

export default CustomerInterestPage