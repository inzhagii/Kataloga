/**
 * Shared mock channel registry (CMS-provided channel master).
 *
 * Store external channels and Product external links reference these channel
 * definitions by `channelId` instead of duplicating name/logo into every
 * record (docs/PRODUCT.md §16, docs/API-CONTRACT.md). The real CMS/backend is
 * the future source of truth; this registry models the channel master locally.
 *
 * The mocked CMS channel set is LOCKED to exactly three channels: Shopee,
 * Tokopedia, Lazada. Do NOT add more CMS channels (e.g. TikTok Shop, Blibli)
 * to the mock unless a separate requirement is approved.
 *
 * `logo` is a frontend-owned icon reference (a Material symbol token here);
 * the backend never sends/stores icon assets on V1.
 */

/** @type {import('../models.js').ChannelDefinition[]} */
export const CMS_CHANNELS = [
  { id: 'SHOPEE', name: 'Shopee', logo: 'shopping_bag' },
  { id: 'TOKOPEDIA', name: 'Tokopedia', logo: 'storefront' },
  { id: 'LAZADA', name: 'Lazada', logo: 'local_mall' },
]

/**
 * Icon reference used for seller-created custom channels. Custom channels are
 * store-scoped, use a generic icon, and never upload their own logo.
 */
export const CUSTOM_CHANNEL_LOGO = 'link'

/** Stable id prefix for seller-created custom channel definitions. */
export const CUSTOM_CHANNEL_ID_PREFIX = 'CUSTOM:'