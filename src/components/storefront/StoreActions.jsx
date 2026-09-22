import MarketplaceSelector from './MarketplaceSelector'
import WhatsAppIcon from '../ui/WhatsAppIcon'

/**
 * Store Landing floating action bar (docs/PRODUCT.md #8). appear whenever the
 * store header is scrolled out of view; hides again when the footer enters the
 * viewport. Visibility is decided by useFloatingActionVisibility
 * (IntersectionObserver) and passed in as `show`.
 *
 * Desktop: [Hubungi via WhatsApp] [Marketplace] [Share (smaller)].
 * Mobile: [Hubungi via WhatsApp] [Marketplace] — Share lives in the navbar.
 * Without channels: WhatsApp + Share (desktop) / WhatsApp only (mobile).
 *
 * The bar stays mounted and visibility is toggled with classes so static
 * markup keeps the actions; Marketplace uses the shared modal/bottom-sheet
 * picker (never a dropdown).
 *
 * @param {{
 *   store: import('../../data/models.js').Store,
 *   show: boolean,
 *   onWhatsApp: () => void,
 *   onSelectChannel: (channel: import('../../data/models.js').ExternalChannel) => void,
 *   onShareStore: () => void,
 * }} props
 */
function StoreActions({ store, show, onWhatsApp, onSelectChannel, onShareStore }) {
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
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-all duration-300 md:px-6 md:pb-5 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[560px] items-stretch gap-2.5">
        {hasChannels ? (
          <>
            <div className="min-w-0 flex-1">{whatsappButton}</div>
            <div className="min-w-0 flex-1">
              <MarketplaceSelector store={store} onSelectChannel={onSelectChannel} />
            </div>
            <div className="hidden min-w-0 shrink-0 md:block">{shareButton}</div>
          </>
        ) : (
          <>
            <div className="min-w-0 flex-1">{whatsappButton}</div>
            <div className="hidden min-w-0 shrink-0 md:block">{shareButton}</div>
          </>
        )}
      </div>
    </div>
  )
}

export default StoreActions