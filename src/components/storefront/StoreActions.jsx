import MarketplaceSelector from './MarketplaceSelector'
import WhatsAppIcon from '../ui/WhatsAppIcon'

/**
 * Store Landing actions, rendered inline at the bottom of the Store
 * Information card (docs/PRODUCT.md #8). These are NOT a floating bar:
 *
 *   Row 1: [Hubungi via WhatsApp] (full width).
 *   Row 2: [Marketplace] [Share] side-by-side (equal width).
 *
 * Share is NOT in the navbar — it lives only in this block. Without channels
 * the block keeps WhatsApp + Share side-by-side (no Marketplace row).
 * Marketplace uses the shared modal/bottom-sheet picker (never a dropdown).
 *
 * @param {{
 *   store: import('../../data/models.js').Store,
 *   onWhatsApp: () => void,
 *   onSelectChannel: (channel: import('../../data/models.js').ExternalChannel) => void,
 *   onShareStore: () => void,
 * }} props
 */
function StoreActions({ store, onWhatsApp, onSelectChannel, onShareStore }) {
  const hasChannels = (store.channels ?? []).length > 0

  const whatsappButton = (
    <button
      type="button"
      onClick={onWhatsApp}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-whatsapp px-4 py-2.5 text-xs font-semibold text-on-whatsapp shadow-sm transition-colors hover:brightness-95 sm:text-sm"
    >
      <WhatsAppIcon size={18} />
      <span className="whitespace-nowrap">Hubungi via WhatsApp</span>
    </button>
  )

  const shareButton = (
    <button
      type="button"
      onClick={onShareStore}
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container sm:text-sm"
    >
      <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
        share
      </span>
      <span className="whitespace-nowrap">Bagikan</span>
    </button>
  )

  return (
    <div className="mt-5 border-t border-outline-variant/20 pt-5 sm:mt-6 sm:pt-6">
      {hasChannels ? (
        <div className="flex w-full flex-col items-stretch gap-2.5">
          <div className="w-full min-w-0">{whatsappButton}</div>
          <div className="flex w-full min-w-0 items-stretch gap-2.5">
            <div className="min-w-0 flex-1">
              <MarketplaceSelector store={store} onSelectChannel={onSelectChannel} />
            </div>
            <div className="min-w-0 flex-1">{shareButton}</div>
          </div>
        </div>
      ) : (
        <div className="flex w-full min-w-0 items-stretch gap-2.5">
          <div className="min-w-0 flex-1">{whatsappButton}</div>
          <div className="min-w-0 shrink-0">{shareButton}</div>
        </div>
      )}
    </div>
  )
}

export default StoreActions