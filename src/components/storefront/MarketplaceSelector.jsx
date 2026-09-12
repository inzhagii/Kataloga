import { useEffect, useRef, useState } from 'react'
import BottomSheet from './BottomSheet'

/**
 * Marketplace selector: shows the seller-configured external channels.
 * Channel selection triggers the authentication check in the page before any
 * navigation happens. Desktop uses a dropdown/popover; mobile uses a bottom
 * sheet. Channels are plain {name,url} — no marketplace icons/logos.
 * The `compact` variant targets the storefront navbar.
 * @param {{ store: import('../../data/models.js').Store, onSelectChannel: (channel: import('../../data/models.js').ExternalChannel) => void, compact?: boolean }} props
 */
function MarketplaceSelector({ store, onSelectChannel, compact = false }) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)
  const channels = store.channels ?? []
  const hasChannels = channels.length > 0

  useEffect(() => {
    if (!open || !hasChannels) {
      return undefined
    }
    function handleClose(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClose)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClose)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, hasChannels])

  function toggle() {
    if (hasChannels) {
      setOpen((value) => !value)
    }
  }

  function selectChannel(channel) {
    setOpen(false)
    onSelectChannel(channel)
  }

  function channelList(onPick) {
    return (
      <div className="flex flex-col gap-1">
        {channels.map((channel) => (
          <button
            key={`${channel.name}-${channel.url}`}
            type="button"
            onClick={() => onPick(channel)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-on-surface transition-colors hover:bg-surface-container"
          >
            <span className="truncate font-medium">{channel.name}</span>
            <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant" aria-hidden="true">
              open_in_new
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" ref={anchorRef}>
      <button
        type="button"
        onClick={toggle}
        disabled={!hasChannels}
        aria-haspopup="true"
        aria-expanded={open}
        title={hasChannels ? undefined : 'Belum ada saluran'}
        className={
          compact
            ? 'inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant/50 bg-surface/80 px-2.5 py-1.5 text-xs font-medium text-on-surface transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60'
            : 'inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-2.5 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm'
        }
      >
        <span className="material-symbols-outlined text-[16px] shrink-0 text-primary sm:text-[18px]" aria-hidden="true">
          storefront
        </span>
        <span className={compact ? 'hidden md:inline whitespace-nowrap' : 'whitespace-nowrap'}>Marketplace</span>
        <span className="material-symbols-outlined text-[16px] sm:text-[18px]" aria-hidden="true">
          expand_more
        </span>
      </button>

      {/* Desktop dropdown */}
      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 hidden rounded-xl bg-surface-container-lowest p-2 shadow-xl md:block">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-secondary">
            Pilih Saluran Resmi
          </div>
          {channelList(selectChannel)}
        </div>
      ) : null}

      {/* Mobile bottom sheet */}
      <div className="md:hidden">
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Pilih Saluran"
          icon="storefront"
        >
          {channelList(selectChannel)}
        </BottomSheet>
      </div>
    </div>
  )
}

export default MarketplaceSelector