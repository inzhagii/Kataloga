import { INTEREST_TYPE } from '../../../constants/enums'

/**
 * Channel badge for a customer interest activity.
 * WhatsApp uses a single accent; marketplace shows the exact configured
 * channel name with brand-ish colors for known channels and a neutral
 * fallback otherwise. No logos or integration icons (channels are generic).
 * @param {{ channelType: 'WHATSAPP_CLICK'|'MARKETPLACE_CLICK', channel: string|null }} props
 */
function ChannelBadge({ channelType, channel }) {
  if (channelType === INTEREST_TYPE.WHATSAPP_CLICK) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-tertiary-fixed/30 px-2.5 py-1 text-[11px] font-semibold text-tertiary">
        <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
          chat
        </span>
        <span>WhatsApp Click</span>
      </span>
    )
  }

  const channelName = channel || 'Marketplace'
  let badgeClass = 'bg-orange-100 text-orange-800 border border-orange-200'
  if (channelName === 'Tokopedia') {
    badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200'
  } else if (channelName === 'Shopee') {
    badgeClass = 'bg-orange-100 text-orange-700 border border-orange-200'
  } else if (channelName === 'Blibli') {
    badgeClass = 'bg-sky-100 text-sky-800 border border-sky-200'
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}
    >
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
        shopping_bag
      </span>
      <span>{channelName}</span>
    </span>
  )
}

export default ChannelBadge