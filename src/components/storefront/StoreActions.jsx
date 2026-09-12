import MarketplaceSelector from './MarketplaceSelector'

/**
 * Store actions: WhatsApp (primary, full-width) on top, then Marketplace and
 * Share side-by-side. Same stacked layout on desktop and mobile, following the
 * approved store landing reference.
 */
function StoreActions({ store, onWhatsApp, onSelectChannel, onShareStore }) {
  return (
    <div className="mt-6 flex w-full max-w-[560px] flex-col gap-2.5">
      <button
        type="button"
        onClick={onWhatsApp}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700 sm:text-sm"
      >
        <span
          className="material-symbols-outlined text-[18px]"
          aria-hidden="true"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          chat
        </span>
        <span className="whitespace-nowrap">Hubungi via WhatsApp</span>
      </button>

      <div className="grid w-full grid-cols-2 gap-2.5">
        <div className="min-w-0">
          <MarketplaceSelector store={store} onSelectChannel={onSelectChannel} />
        </div>
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
      </div>
    </div>
  )
}

export default StoreActions