export const PRODUCT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SOLD_OUT: 'SOLD_OUT',
  ARCHIVED: 'ARCHIVED',
}

export const CONDITION = {
  NEW: 'NEW',
  SECOND: 'SECOND',
}

/**
 * Product CTA types (docs/PRODUCT.md §23). Only three types exist — BUY, BARGAIN,
 * CUSTOM. CTA options are owned at store level (My Store): Kataloga provides the
 * default BUY ("Beli") and BARGAIN ("Tawar") options, and sellers may add CUSTOM
 * options with their own label. Products select exactly one option from the
 * store's CTA options; they never create new CTA definitions.
 */
export const CTA_TYPE = {
  BUY: 'BUY',
  BARGAIN: 'BARGAIN',
  CUSTOM: 'CUSTOM',
}

export const INTEREST_TYPE = {
  WHATSAPP_CLICK: 'WHATSAPP_CLICK',
  MARKETPLACE_CLICK: 'MARKETPLACE_CLICK',
}

/**
 * Where a channel definition comes from. CMS = Kataloga-provided channel
 * master (mock: exactly Shopee, Tokopedia, Lazada); CUSTOM = seller-created
 * channel scoped to their store (docs/PRODUCT.md §16).
 */
export const CHANNEL_SOURCE = {
  CMS: 'CMS',
  CUSTOM: 'CUSTOM',
}

/**
 * Storefront context where a Customer Interest interaction originated.
 * Values are the exact user-facing context strings (docs/UX-FLOW.md), used as
 * the canonical internal values so display and filtering share one source.
 */
export const INTEREST_CONTEXT = {
  STORE_LANDING: 'Store Landing',
  PRODUCT_DETAIL: 'Product Detail',
}

/**
 * Recent Activity types. The eleven canonical seller/store activity types the
 * UI must render (docs/AGENTS.md §20): product lifecycle events, category and
 * announcement management events, and store updates.
 *
 * PRODUCT_EDITED is the existing/internal canonical name for the external
 * "PRODUCT_UPDATED" concept — the mapping is explicit in the activity mapper.
 * Customer activity (WhatsApp/marketplace clicks, views, shares, login, etc.)
 * is NEVER part of Recent Activity.
 */
export const ACTIVITY_TYPE = {
  PRODUCT_PUBLISHED: 'PRODUCT_PUBLISHED',
  PRODUCT_EDITED: 'PRODUCT_EDITED',
  PRODUCT_SOLD_OUT: 'PRODUCT_SOLD_OUT',
  PRODUCT_REACTIVATED: 'PRODUCT_REACTIVATED',
  PRODUCT_ARCHIVED: 'PRODUCT_ARCHIVED',
  PRODUCT_RESTORED: 'PRODUCT_RESTORED',
  CATEGORY_CREATED: 'CATEGORY_CREATED',
  CATEGORY_UPDATED: 'CATEGORY_UPDATED',
  ANNOUNCEMENT_CREATED: 'ANNOUNCEMENT_CREATED',
  ANNOUNCEMENT_UPDATED: 'ANNOUNCEMENT_UPDATED',
  STORE_UPDATED: 'STORE_UPDATED',
}