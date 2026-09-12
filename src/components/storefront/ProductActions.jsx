import MarketplaceSelector from './MarketplaceSelector'

/**
 * Product action row: WhatsApp (primary, full-width) on top, then Marketplace
 * and Share side-by-side. Same stacked layout as the Store Landing actions.
 * Channel selection and authentication gating are handled by the page.
 */
function ProductActions({ store, onWhatsApp, onSelectChannel, onShare }) {
  return (
    <div className="mt-5 flex flex-col gap-2.5">
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
          onClick={onShare}
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

export default ProductActions