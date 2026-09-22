import { useState } from 'react'
import BottomSheet from './BottomSheet'
import { destinationIcon } from '../../constants/destinationPresets'

/**
 * Shared destination/channel picker (modal on desktop, bottom sheet on mobile —
 * never a dropdown). Used for choosing an external sales channel (store) or a
 * product CTA destination. Destinations are plain {name, url}; icons are
 * derived frontend-owned from the V1 presets.
 *
 * The picker only renders the trigger + sheet; authentication gating and any
 * navigation after selection are handled by the caller.
 *
 * `renderTrigger` may be provided to fully customize the trigger button (e.g.
 * a primary CTA). It receives `{ toggle, hasItems, open, isDefault }`; when
 * absent a default secondary button is rendered using triggerLabel/triggerIcon.
 *
 * @param {{
 *   destinations: import('../../data/models.js').ExternalChannel[],
 *   onPick: (destination: import('../../data/models.js').ExternalChannel) => void,
 *   triggerLabel: string,
 *   triggerIcon?: string,
 *   sheetTitle: string,
 *   sheetIcon?: string,
 *   compact?: boolean,
 *   renderTrigger?: (ctx: { toggle: () => void, hasItems: boolean, open: boolean }) => import('react').ReactNode,
 * }} props
 */
function DestinationPicker({
  destinations,
  onPick,
  triggerLabel,
  triggerIcon = 'open_in_new',
  sheetTitle,
  sheetIcon = 'storefront',
  compact = false,
  renderTrigger,
}) {
  const [open, setOpen] = useState(false)
  const items = destinations ?? []
  const hasItems = items.length > 0

  function toggle() {
    if (hasItems) {
      setOpen((value) => !value)
    }
  }

  function pick(destination) {
    setOpen(false)
    onPick(destination)
  }

  const defaultTrigger = (
    <button
      type="button"
      onClick={toggle}
      disabled={!hasItems}
      aria-haspopup="dialog"
      aria-expanded={open}
      title={hasItems ? undefined : 'Belum ada saluran'}
      className={
        compact
          ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface/80 px-2.5 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60'
          : 'inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-2.5 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm'
      }
    >
      <span className="material-symbols-outlined text-[16px] shrink-0 text-primary sm:text-[18px]" aria-hidden="true">
        {triggerIcon}
      </span>
      <span className={compact ? 'hidden md:inline whitespace-nowrap' : 'whitespace-nowrap'}>{triggerLabel}</span>
      <span className="material-symbols-outlined text-[16px] sm:text-[18px]" aria-hidden="true">
        expand_more
      </span>
    </button>
  )

  return (
    <>
      {renderTrigger ? renderTrigger({ toggle, hasItems, open }) : defaultTrigger}

      <BottomSheet open={open} onClose={() => setOpen(false)} title={sheetTitle} icon={sheetIcon}>
        <div className="flex flex-col gap-1">
          {items.map((item) => (
            <button
              key={`${item.name}-${item.url}`}
              type="button"
              onClick={() => pick(item)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-on-surface transition-colors hover:bg-surface-container"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant"
                  aria-hidden="true"
                >
                  {destinationIcon(item.name)}
                </span>
                <span className="truncate font-medium">{item.name}</span>
              </span>
              <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant" aria-hidden="true">
                open_in_new
              </span>
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}

export default DestinationPicker