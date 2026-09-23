import { formatDateTime } from '../../../utils/datetime'
import {
  countCustomerActivities,
  customerDisplayName,
  customerSupportingIdentity,
  productContextOf,
} from '../../../utils/customerInterest'
import ChannelBadge from './ChannelBadge'
import CustomerAvatar from './CustomerAvatar'

/**
 * Customer interest list: desktop table + mobile cards.
 * @param {{
 *   interests: import('../../../data/models.js').CustomerInterest[],
 *   allInterests: import('../../../data/models.js').CustomerInterest[],
 *   productById: Map<number, import('../../../data/models.js').Product>,
 *   definitions?: import('../../../data/models.js').ChannelDefinition[],
 *   onSelect: (interest: import('../../../data/models.js').CustomerInterest) => void,
 * }} props
 */
function InterestList({ interests, allInterests, productById, definitions = [], onSelect }) {
  if (interests.length === 0) {
    return null
  }

  return (
    <div className="mb-8 overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant text-xs uppercase tracking-wider">
              <th className="px-4 py-3.5 font-medium sm:px-6">Customer</th>
              <th className="px-4 py-3.5 font-medium">Produk Dituju</th>
              <th className="px-4 py-3.5 font-medium">Aktivitas</th>
              <th className="px-4 py-3.5 font-medium">Waktu Aktivitas</th>
              <th className="px-4 py-3.5 text-right font-medium sm:pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high/40">
            {interests.map((record) => {
              const { product, name, icon } = productContextOf(record, productById)
              const count = countCustomerActivities(allInterests, record)
              return (
                <tr
                  key={record.id}
                  className="group transition-colors hover:bg-surface-container-low/60"
                >
                  <td className="px-4 py-3.5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-semibold text-on-surface">
                            {customerDisplayName(record)}
                          </span>
                          <span className="rounded bg-surface-container px-1.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
                            {count}x interaksi
                          </span>
                        </div>
                        {customerSupportingIdentity(record) ? (
                          <span className="text-[11px] text-on-surface-variant">
                            {customerSupportingIdentity(record)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="material-symbols-outlined shrink-0 text-[20px] text-primary"
                        aria-hidden="true"
                      >
                        {icon}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-on-surface">{name}</p>
                        {product ? (
                          <p className="text-xs text-on-surface-variant">{product.price}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col items-start gap-1">
                      <ChannelBadge
                        channelType={record.channelType}
                        channel={record.channel}
                        channelId={record.channelId}
                        definitions={definitions}
                      />
                      {record.context ? (
                        <span className="text-[11px] text-on-surface-variant">
                          {record.context}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-[13px] text-on-surface-variant">
                    {formatDateTime(record.date)}
                  </td>
                  <td className="px-4 py-3.5 text-right sm:pr-6">
                    <button
                      type="button"
                      onClick={() => onSelect(record)}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/5 hover:text-primary-container"
                    >
                      Lihat Detail
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 p-4 md:hidden">
        {interests.map((record) => {
          const { product, name, icon } = productContextOf(record, productById)
          const count = countCustomerActivities(allInterests, record)
          return (
            <li
              key={record.id}
              className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <CustomerAvatar className="h-9 w-9" iconClassName="h-4 w-4" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[13px] font-semibold text-on-surface">
                      {customerDisplayName(record)}
                    </span>
                    <span className="shrink-0 rounded bg-surface-container px-1.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
                      ({count}x interaksi)
                    </span>
                  </div>
                  {customerSupportingIdentity(record) ? (
                    <span className="truncate text-[11px] text-on-surface-variant">
                      {customerSupportingIdentity(record)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="material-symbols-outlined shrink-0 text-[20px] text-primary"
                    aria-hidden="true"
                  >
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-on-surface">{name}</p>
                    {product ? (
                      <p className="truncate text-xs text-on-surface-variant">{product.price}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <ChannelBadge
                    channelType={record.channelType}
                    channel={record.channel}
                    channelId={record.channelId}
                    definitions={definitions}
                  />
                  {record.context ? (
                    <span className="text-[10px] text-on-surface-variant">{record.context}</span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-outline-variant/30 pt-3">
                <span className="text-[11px] text-outline">ID: INT-{record.id}</span>
                <button
                  type="button"
                  onClick={() => onSelect(record)}
                  className="inline-flex items-center gap-1 rounded-lg py-1 pl-2 pr-1 text-[13px] font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Lihat Detail
                  <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default InterestList