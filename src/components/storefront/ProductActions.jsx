import DestinationPicker from './DestinationPicker'
import { PRODUCT_STATUS } from '../../constants/enums'
import { CTA_ICONS, ctaTypeLabel } from '../../constants/cta'
import { resolveChannelRefsForDisplay } from '../../utils/channels'
import { CMS_CHANNELS } from '../../data/mock/channels'

/**
 * Product action row (Product Detail). CTA (primary) + Share (secondary) at
 * 70:30. NO WhatsApp, NO Marketplace (store channels).
 *
 * Responsive placement (docs/UI_RULES.md + approved mobile decision):
 * - Mobile: a floating action bar pinned to the bottom of the viewport so the
 *   CTA/Share stay reachable while the page scrolls. No customer bottom
 *   navigation on Product Detail.
 * - Desktop: inline row inside the ProductInfo card (lg:static).
 *
 * The CTA button is icon + CTA label only (no arrow, no extra symbol, no URL
 * shown). Clicking it opens the product destination menu (modal desktop /
 * bottom sheet mobile, never a dropdown) built from ALL of the product's
 * external links — the CTA itself does not own destinations and never filters
 * which destinations appear.
 *
 * Product external links are references (`{channelId, url}`); name/logo are
 * resolved against the store's channel definitions (`channelDefinitions`,
 * defaulting to the shared CMS master) so the sheet shows the correct channel
 * identity. Plain `{name, url}` entries are accepted for backward
 * compatibility with existing fixtures.
 *
 * If the product has no external destinations the CTA is not rendered (no
 * fallback — no invented WhatsApp/redirect). For SOLD_OUT products the CTA is
 * unavailable and only Share is rendered.
 *
 * Authentication gating + Customer Interest + redirect after a destination pick
 * are handled by the page via onSelectDestination.
 *
 * @param {{
 *   product: import('../../data/models.js').Product,
 *   onSelectDestination: (destination: import('../../data/models.js').ExternalProductLink) => void,
 *   onShare: () => void,
 *   channelDefinitions?: import('../../data/models.js').ChannelDefinition[],
 * }} props
 */
function ProductActions({ product, onSelectDestination, onShare, channelDefinitions }) {
  const soldOut = product.status === PRODUCT_STATUS.SOLD_OUT
  const definitions =
    Array.isArray(channelDefinitions) && channelDefinitions.length > 0
      ? channelDefinitions
      : CMS_CHANNELS
  const destinations = resolveChannelRefsForDisplay(product.externalLinks ?? [], definitions)
  const hasDestinations = destinations.length > 0
  const hasCta = Boolean(product.cta?.type) && !soldOut && hasDestinations

  const shareButton = (
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
  )

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/60 bg-surface-container-lowest px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:static lg:inset-auto lg:z-auto lg:mt-5 lg:border-0 lg:bg-transparent lg:px-0 lg:pt-0 lg:pb-0 lg:shadow-none">
      <div className="mx-auto w-full max-w-[560px] lg:max-w-none">
        <div className={`grid w-full gap-2.5 ${hasCta ? 'grid-cols-[7fr_3fr]' : 'grid-cols-1'}`}>
          {hasCta ? (
            <div className="min-w-0">
              <DestinationPicker
                destinations={destinations}
                onPick={onSelectDestination}
                sheetTitle="Pilih Tujuan"
                sheetIcon="open_in_new"
                renderTrigger={({ toggle, open }) => (
                  <button
                    type="button"
                    onClick={toggle}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className="inline-flex h-full w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:brightness-95 sm:text-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {CTA_ICONS[product.cta.type] ?? 'arrow_forward'}
                    </span>
                    <span className="whitespace-nowrap">
                      {ctaTypeLabel(product.cta.type, product.cta.label)}
                    </span>
                  </button>
                )}
              />
            </div>
          ) : null}

          <div className="min-w-0">{shareButton}</div>
        </div>
      </div>
    </div>
  )
}

export default ProductActions