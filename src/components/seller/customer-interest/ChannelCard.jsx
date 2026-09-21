import { INTEREST_TYPE } from '../../../constants/enums'
import WhatsAppIcon from '../../ui/WhatsAppIcon'

/**
 * Single channel card in the Customer Interest channel row. Cards are derived
 * from real channel data (WhatsApp + configured external channels), never
 * hardcoded. Clicking a card toggles the channel filter; pressing again
 * clears it. Locked hierarchy (docs/UI_RULES.md):
 *   1. Channel name on top
 *   2. Channel icon aligned right
 *   3. Activity count large and bold as the focal point
 *   4. Supporting text "aktivitas minat"
 * Icon is a visual anchor only — no brand logos (channels are generic).
 * On mobile cards may scroll horizontally; on desktop they share the row
 * width equally.
 * @param {{
 *   channel: { id: string, name: string, kind: string },
 *   count: number,
 *   active: boolean,
 *   onClick: () => void,
 * }} props
 */
function ChannelCard({ channel, count, active, onClick }) {
  const isWhatsApp = channel.kind === INTEREST_TYPE.WHATSAPP_CLICK
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-w-[150px] shrink-0 flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-all sm:min-w-[150px] md:min-w-0 ${
        active
          ? 'border-primary bg-primary-container/20 shadow-sm ring-1 ring-primary/25'
          : 'border-outline-variant/60 bg-surface-container-lowest shadow-sm hover:border-outline hover:bg-surface-container-low'
      }`}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <span className="w-full truncate text-[13px] font-semibold text-on-surface">
          {channel.name}
        </span>
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isWhatsApp
              ? 'bg-whatsapp-container text-whatsapp'
              : 'bg-primary-container/15 text-primary'
          }`}
          aria-hidden="true"
        >
          {isWhatsApp ? (
            <WhatsAppIcon size={17} />
          ) : (
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
          )}
        </span>
      </div>
      <div>
        <span className="block text-2xl font-extrabold tracking-tight text-on-surface">{count}</span>
        <span className="text-[11px] font-medium text-on-surface-variant">aktivitas minat</span>
      </div>
    </button>
  )
}

export default ChannelCard