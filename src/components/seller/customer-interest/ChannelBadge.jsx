import { INTEREST_TYPE } from '../../../constants/enums'
import { resolveInterestChannel } from '../../../utils/customerInterestChannels'
import WhatsAppIcon from '../../ui/WhatsAppIcon'

/**
 * Channel badge for a customer interest activity.
 * An optional `channelId` resolves the channel name/logo through the shared
 * channel master (CMS + the store's custom channels); a legacy record without
 * a channelId keeps its recorded `channel` name snapshot and resolves the logo
 * from a matching definition or the frontend-owned destination preset. WhatsApp
 * uses the single WhatsApp-accent treatment; marketplace badges keep the
 * name-based color hint (Shopee / Tokopedia / Blibli) with no uploaded logos.
 * @param {{
 *   channelType: 'WHATSAPP_CLICK'|'MARKETPLACE_CLICK',
 *   channel: string|null,
 *   channelId?: string|null,
 *   definitions?: import('../../../data/models.js').ChannelDefinition[],
 * }} props
 */
function ChannelBadge({
  channelType,
  channel,
  channelId,
  definitions = [],
}) {
  if (channelType === INTEREST_TYPE.WHATSAPP_CLICK) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-whatsapp-container px-2.5 py-1 text-[11px] font-semibold text-on-whatsapp-container">
        <WhatsAppIcon size={14} />
        <span>WhatsApp Click</span>
      </span>
    )
  }

  const { name: channelName, logo } = resolveInterestChannel(
    { channelType, channel, channelId },
    definitions,
  )
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
        {logo}
      </span>
      <span>{channelName}</span>
    </span>
  )
}

export default ChannelBadge