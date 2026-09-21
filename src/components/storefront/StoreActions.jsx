import MarketplaceSelector from './MarketplaceSelector'
import WhatsAppIcon from '../ui/WhatsAppIcon'

/**
 * Store actions. With configured channels: WhatsApp (primary, full-width) on
 * top, then Marketplace and Share side-by-side. Without channels: WhatsApp and
 * Share side-by-side (no disabled Marketplace button). Same layout on desktop
 * and mobile, following the approved store landing reference.
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
      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-2.5 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container sm:text-sm"
    >
      <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
        share
      </span>
      <span className="whitespace-nowrap">Bagikan</span>
    </button>
  )

  return (
    <div className="mt-6 flex w-full max-w-[560px] flex-col gap-2.5">
      {hasChannels ? (
        <>
          {whatsappButton}
          <div className="grid w-full grid-cols-2 gap-2.5">
            <div className="min-w-0">
              <MarketplaceSelector store={store} onSelectChannel={onSelectChannel} />
            </div>
            {shareButton}
          </div>
        </>
      ) : (
        <div className="grid w-full grid-cols-2 gap-2.5">
          {whatsappButton}
          {shareButton}
        </div>
      )}
    </div>
  )
}

export default StoreActions
