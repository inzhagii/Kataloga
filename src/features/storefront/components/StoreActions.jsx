import MarketplaceSelector from './MarketplaceSelector'
import WhatsAppIcon from '../../../components/ui/WhatsAppIcon'

/**
 * Store Landing floating action bar (docs/PRODUCT.md §8, docs/UI_RULES.md §13).
 *
 * The page renders this only while `visible` is true; visibility is produced
 * by `useFloatingActionBar`, which watches the Store Information header and
 * the footer with an IntersectionObserver (bar shown once the header leaves
 * the viewport, hidden again while the footer is visible).
 *
 * Desktop and mobile share the same bar:
 *
 *   [ Hubungi via WhatsApp ] [ Marketplace ] [ Share (smaller) ]
 *
 * Without configured channels it keeps `[ Hubungi via WhatsApp ] [ Share ]`.
 * Share lives only here — never in the navbar. Marketplace uses the shared
 * modal (desktop) / bottom sheet (mobile) picker, never a dropdown.
 *
 * @param {{
 *   store: import('../../../data/models.js').Store,
 *   visible: boolean,
 *   onWhatsApp: () => void,
 *   onSelectChannel: (channel: import('../../../data/models.js').ExternalChannel) => void,
 *   onShareStore: () => void,
 * }} props
 */
function StoreActions({ store, visible, onWhatsApp, onSelectChannel, onShareStore }) {
  if (!visible) {
    return null
  }

  const hasChannels = (store.channels ?? []).length > 0

  const whatsappButton = (
    <button
      type="button"
      onClick={onWhatsApp}
      className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-whatsapp px-3 py-2.5 text-[11px] font-semibold text-on-whatsapp shadow-sm transition-colors hover:brightness-95 sm:text-sm"
    >
      <WhatsAppIcon size={18} />
      <span className="truncate whitespace-nowrap">Hubungi via WhatsApp</span>
    </button>
  )

  const shareButton = (
    <button
      type="button"
      onClick={onShareStore}
      className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-[11px] font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container sm:text-sm"
    >
      <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
        share
      </span>
      <span className="whitespace-nowrap">Bagikan</span>
    </button>
  )

  return (
    <div
      role="region"
      aria-label="Aksi toko"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-outline-variant/30 bg-surface/95 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1140px] items-stretch gap-2.5 px-3 py-3 sm:px-4">
        {whatsappButton}
        {hasChannels ? (
          <div className="min-w-0 flex-1">
            <MarketplaceSelector store={store} onSelectChannel={onSelectChannel} />
          </div>
        ) : null}
        {shareButton}
      </div>
    </div>
  )
}

export default StoreActions
