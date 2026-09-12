import { Link } from 'react-router-dom'
import EmptyState from '../../shared/EmptyState'
import { formatDateTime } from '../../../utils/datetime'
import { INTEREST_TYPE } from '../../../constants/enums'
import DashboardSectionHeading from './DashboardSectionHeading'

/**
 * Dashboard section 2: Customer Interest summary.
 * Shows only WHATSAPP_CLICK / MARKETPLACE_CLICK intents, latest hits first.
 * @param {{ interests: import('../../../data/models.js').CustomerInterest[] }} props
 */
function CustomerInterestSummary({ interests }) {
  const latest = interests.slice(0, 3)

  return (
    <section
      aria-labelledby="customer-interest-heading"
      className="flex flex-col justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6"
    >
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant/60 pb-4">
          <div id="customer-interest-heading">
            <DashboardSectionHeading
              eyebrow="Customer Interest"
              description="Pelanggan yang baru berminat"
            />
          </div>
          <Link
            to="/seller/customer-interest"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-container"
          >
            Lihat Semua
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {latest.length > 0 ? (
          <ul className="space-y-3">
            {latest.map((interest) => {
              const isWhatsApp = interest.channelType === INTEREST_TYPE.WHATSAPP_CLICK
              return (
                <li
                  key={interest.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-outline-variant/60 bg-surface p-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/60 bg-surface-container text-secondary">
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                        person
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-bold text-on-surface">
                          {interest.customerName}
                        </h4>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            isWhatsApp
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                          }`}
                        >
                          {isWhatsApp ? 'WhatsApp Click' : `${interest.channel} Click`}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-secondary">
                        Tertarik dengan:{' '}
                        <strong className="font-semibold text-on-surface">
                          {interest.productName || 'Toko'}
                        </strong>
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-secondary">
                    {formatDateTime(interest.date)}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState
            icon="favorite_border"
            title="Belum ada minat pelanggan"
            description="Interest WhatsApp dan Marketplace akan muncul di sini."
          />
        )}
      </div>
    </section>
  )
}

export default CustomerInterestSummary