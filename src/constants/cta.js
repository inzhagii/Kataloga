import { CTA_TYPE } from './enums'

/**
 * CTA icon mapping (frontend-owned). Icons per CTA type used on the Product
 * Detail CTA button, the Add/Edit Product CTA selector, and the My Store CTA
 * Options list. The backend never stores icon assets (docs/PRODUCT.md §16).
 */
export const CTA_ICONS = {
  [CTA_TYPE.BUY]: 'shopping_bag',
  [CTA_TYPE.BARGAIN]: 'handshake',
  [CTA_TYPE.CUSTOM]: 'arrow_forward',
}

/**
 * Permanent store CTA defaults (docs/PRODUCT.md §16): BUY -> "Beli" and
 * BARGAIN -> "Tawar". These are always present on a store and cannot be
 * deleted; sellers may add CUSTOM options with their own label.
 */
export const DEFAULT_CTA_OPTIONS = [
  { type: CTA_TYPE.BUY, label: 'Beli' },
  { type: CTA_TYPE.BARGAIN, label: 'Tawar' },
]

/**
 * Resolve the UI label for a CTA type + label pair.
 * BUY -> Beli, BARGAIN -> Tawar, CUSTOM -> the configured label (or fallback).
 * @param {string} type
 * @param {string} [label]
 * @returns {string}
 */
export function ctaTypeLabel(type, label) {
  if (type === CTA_TYPE.BUY) {
    return 'Beli'
  }
  if (type === CTA_TYPE.BARGAIN) {
    return 'Tawar'
  }
  return label || 'Custom'
}

/**
 * Normalize a product CTA selection to exactly one valid option.
 *
 * A product always carries exactly one CTA (docs/PRODUCT.md §16): BUY "Beli"
 * is the documented default. A missing, unknown, or label-less CUSTOM value is
 * resolved explicitly to that default instead of being silently dropped to
 * `undefined` (which would look like an intentional absence). A CUSTOM
 * selection keeps its seller-defined label. "Intentionally unavailable" CTA is
 * a Product Detail display concern derived from empty destinations — it is NOT
 * represented by an absent/undefined CTA here.
 * @param {import('../data/models.js').ProductCTA|{ type?: string, label?: string }|null|undefined} cta
 * @returns {import('../data/models.js').ProductCTA}
 */
export function normalizeCtaOption(cta) {
  const type = cta?.type
  if (type === CTA_TYPE.BARGAIN) {
    return { type: CTA_TYPE.BARGAIN, label: 'Tawar' }
  }
  if (type === CTA_TYPE.CUSTOM) {
    const label = String(cta.label ?? '').trim()
    return label ? { type: CTA_TYPE.CUSTOM, label } : { type: CTA_TYPE.BUY, label: 'Beli' }
  }
  return { type: CTA_TYPE.BUY, label: 'Beli' }
}

/**
 * Normalize a store CTA options list so the permanent BUY/BARGAIN defaults are
 * always present, followed by the seller's CUSTOM options. Missing defaults are
 * restored from DEFAULT_CTA_OPTIONS; extra fields are stripped to {type,label}.
 * @param {Array<import('../data/models.js').CTAOption>} [options]
 * @returns {import('../data/models.js').CTAOption[]}
 */
export function withDefaultCtaOptions(options) {
  const source = Array.isArray(options) ? options : []
  const defaults = [
    source.find((option) => option.type === CTA_TYPE.BUY) ?? DEFAULT_CTA_OPTIONS[0],
    source.find((option) => option.type === CTA_TYPE.BARGAIN) ?? DEFAULT_CTA_OPTIONS[1],
  ]
  const customs = source
    .filter((option) => option.type === CTA_TYPE.CUSTOM)
    .map((option) => ({ type: CTA_TYPE.CUSTOM, label: String(option.label ?? '').trim() }))
    .filter((option) => option.label.length > 0)
  return [
    ...defaults.map((option) => ({ type: option.type, label: option.label })),
    ...customs,
  ]
}