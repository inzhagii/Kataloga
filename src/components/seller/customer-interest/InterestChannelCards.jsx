import ChannelCard from './ChannelCard'

/**
 * Responsive channel cards row for the Customer Interest page.
 *
 * Shows every current channel card: WhatsApp first, then the store's
 * configured external channels. Historical (deleted) channels are charted as
 * filter options, never as cards. Total Interest placement follows the number
 * of current channels: fewer than 4 -> Total card sits inline in the row ends;
 * 4 or more -> the caller shows Total in the page header instead.
 *
 * Mobile: cards scroll horizontally (equal compact width per card).
 * Desktop: cards share the available row width equally (no forced widths).
 *
 * @param {{
 *   channels: { id: string, name: string, kind: string }[],
 *   counts: Record<string, number>,
 *   activeChannel: string,
 *   onSelectChannel: (name: string) => void,
 *   total: number,
 * }} props
 */
function InterestChannelCards({ channels, counts, activeChannel, onSelectChannel, total }) {
  const showInlineTotal = channels.length < 4
  const cardCount = channels.length + (showInlineTotal ? 1 : 0)
  const columns = cardCount > 4 ? 4 : cardCount

  return (
    <div
      aria-label="Kanal minat pelanggan"
      className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:px-0 md:pb-0"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {showInlineTotal ? (
        <div className="flex min-w-[150px] shrink-0 flex-col justify-between gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3.5 shadow-sm sm:min-w-[150px] md:min-w-0">
          <div className="flex w-full items-start justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
              Total Interest
            </span>
            <span
              className="material-symbols-outlined text-[18px] text-secondary"
              aria-hidden="true"
            >
              favorite_border
            </span>
          </div>
          <div>
            <span className="block text-2xl font-extrabold tracking-tight text-on-surface">
              {total}
            </span>
            <span className="text-[11px] font-medium text-on-surface-variant">
              aktivitas minat
            </span>
          </div>
        </div>
      ) : null}

      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          count={counts[channel.name] ?? 0}
          active={activeChannel === channel.name}
          onClick={() => onSelectChannel(channel.name)}
        />
      ))}
    </div>
  )
}

export default InterestChannelCards