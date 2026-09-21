import { useEffect, useState } from 'react'
import { formatDateTime } from '../../../utils/datetime'
import { buildStoreProductUrl, resolveProductSlug } from '../../../utils/storefrontUrl'
import {
  countCustomerActivities,
  customerDisplayName,
  customerSupportingIdentity,
  groupCustomerActivitiesByDate,
  productContextOf,
} from '../../../utils/customerInterest'
import ChannelBadge from './ChannelBadge'
import CustomerAvatar from './CustomerAvatar'

/**
 * Desktop modal / mobile bottom-sheet for a customer interest detail.
 * Shows customer identity, related product, activity, time and storefront
 * context, plus the customer's interaction history grouped by date. Clicking a
 * history entry switches the active detail to that record. Actions open the
 * customer-facing product detail only ("Lihat Product"); there is no contact
 * CTA — recording an interest does not mean the customer can be contacted.
 *
 * @param {{
 *   record: import('../../../data/models.js').CustomerInterest | null,
 *   interests: import('../../../data/models.js').CustomerInterest[],
 *   productById: Map<number, object>,
 *   onClose: () => void,
 * }} props
 */
function InterestDetailModal({ record, interests, productById, onClose }) {
  const [activeRecord, setActiveRecord] = useState(record)

  useEffect(() => {
    if (!record) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [record, onClose])

  if (!record || !activeRecord) {
    return null
  }

  const current = activeRecord
  const count = countCustomerActivities(interests, record)
  const groups = groupCustomerActivitiesByDate(interests, record)
  const { product, name: productName, icon: productIcon } = productContextOf(current, productById)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <div
        className="fixed inset-0 bg-on-background/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detail customer interest"
        className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface-container-lowest shadow-xl md:max-h-none md:rounded-2xl"
      >
        <div className="flex items-center justify-center pb-1 pt-2.5 md:hidden">
          <span className="h-1 w-10 rounded-full bg-outline-variant" />
        </div>

        <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container/10 text-primary">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                feed
              </span>
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-on-surface md:text-base">
                Customer Interest Detail
              </h2>
              <p className="text-[11px] text-on-surface-variant">
                INT-{current.id} &middot; Log Minat
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto px-4 py-4 md:px-5 md:py-5">
          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <CustomerAvatar className="h-10 w-10 md:h-11 md:w-11" iconClassName="h-5 w-5" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {customerDisplayName(current)}
                </p>
                {customerSupportingIdentity(current) ? (
                  <p className="truncate text-[11px] text-on-surface-variant">
                    {customerSupportingIdentity(current)}
                  </p>
                ) : null}
                <p className="text-[11px] text-primary">
                  {count}x aktivitas minat di katalog toko kamu
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant/40 bg-surface p-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-outline">
              Produk Terkait
            </span>
            <div className="mt-2 flex items-center gap-3">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary md:h-14 md:w-14"
                aria-hidden="true"
              >
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">
                  {productIcon}
                </span>
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-on-surface">{productName}</p>
                {product ? (
                  <p className="truncate text-xs text-on-surface-variant">{product.price}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-outline-variant/40 bg-surface p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-outline">
                Aktivitas
              </span>
              <div className="mt-2">
                <ChannelBadge channelType={current.channelType} channel={current.channel} />
              </div>
            </div>
            <div className="rounded-xl border border-outline-variant/40 bg-surface p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-outline">
                Waktu
              </span>
              <p className="mt-2 text-sm font-semibold text-on-surface">
                {formatDateTime(current.date)}
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant/40 bg-surface p-3">
              <span className="text-[11px] font-medium uppercase tracking-wider text-outline">
                Konteks
              </span>
              <p className="mt-2 text-sm font-semibold text-on-surface">
                {current.context || '\u2014'}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-low p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-on-surface">Riwayat Customer</span>
              <span className="text-[11px] text-primary">
                {count}x interaksi &middot; {groups.reduce((sum, g) => sum + g.items.length, 0)}{' '}
                aktivitas terdata
              </span>
            </div>
            <div className="max-h-[18rem] space-y-3 overflow-y-auto pr-1">
              {groups.map((group) => (
                <div key={group.dateKey}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-outline">
                    {group.label}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((act) => {
                      const ctx = productContextOf(act, productById)
                      const isActive = act.id === current.id
                      return (
                        <button
                          type="button"
                          key={act.id}
                          onClick={() => setActiveRecord(act)}
                          className={`flex w-full flex-col gap-1 rounded-lg p-2 text-left transition-colors ${
                            isActive
                              ? 'border border-primary/20 bg-primary/10'
                              : 'bg-surface-container-low/70 hover:bg-surface-container/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="min-w-0 truncate text-xs font-medium text-on-surface">
                              <span
                                className="material-symbols-outlined align-middle text-[16px] text-outline"
                                aria-hidden="true"
                              >
                                {ctx.icon}
                              </span>{' '}
                              {ctx.name}
                            </span>
                            <span className="flex shrink-0 items-center gap-1.5">
                              {isActive ? (
                                <span className="rounded bg-primary px-1 py-0.5 text-[10px] font-semibold text-on-primary">
                                  Aktif
                                </span>
                              ) : null}
                              <ChannelBadge channelType={act.channelType} channel={act.channel} />
                            </span>
                          </div>
                          <p className="text-[11px] text-on-surface-variant">
                            {formatDateTime(act.date)}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-outline-variant/30 bg-surface-container-low px-4 py-3 md:px-5 md:py-4">
          {product ? (
            <a
              href={buildStoreProductUrl(product.storeId, product.id, resolveProductSlug(product))}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant/50 px-4 text-[13px] font-semibold text-on-surface transition-colors hover:bg-surface-container hover:text-on-surface md:px-5"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                visibility
              </span>
              Lihat Product
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-lg border border-outline-variant/50 px-4 text-[13px] font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:px-5"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default InterestDetailModal