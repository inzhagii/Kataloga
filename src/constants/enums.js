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

export const INTEREST_TYPE = {
  WHATSAPP_CLICK: 'WHATSAPP_CLICK',
  MARKETPLACE_CLICK: 'MARKETPLACE_CLICK',
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
 * Recent Activity types. Exactly the seven locked seller/store activity types
 * (docs/PRODUCT.md / docs/API-CONTRACT.md). Category and Announcement events
 * are NOT part of Recent Activity and must never appear here.
 *
 * PRODUCT_EDITED is the existing/internal canonical name for the external
 * "PRODUCT_UPDATED" concept — the mapping is explicit in the activity mapper.
 */
export const ACTIVITY_TYPE = {
  PRODUCT_PUBLISHED: 'PRODUCT_PUBLISHED',
  PRODUCT_EDITED: 'PRODUCT_EDITED',
  PRODUCT_SOLD_OUT: 'PRODUCT_SOLD_OUT',
  PRODUCT_REACTIVATED: 'PRODUCT_REACTIVATED',
  PRODUCT_ARCHIVED: 'PRODUCT_ARCHIVED',
  PRODUCT_RESTORED: 'PRODUCT_RESTORED',
  STORE_UPDATED: 'STORE_UPDATED',
}