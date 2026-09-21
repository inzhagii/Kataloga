/**
 * Seller route access helpers.
 *
 * An authenticated account without a store is normally routed into the Create
 * Store flow. The Profile route (`/seller/account`) is exempt: it is the only
 * place a phone-registered account can add the verified recovery email the
 * locked password-recovery flow requires (docs/PRODUCT.md, docs/ROUTES.md §23,
 * docs/UX-FLOW.md §37). The seller navigation and route table are unchanged.
 */

/** Seller paths reachable without an owned store. */
export const NO_STORE_EXEMPT_PATHS = ['/seller/account']

/**
 * Whether reaching `pathname` requires the account to own a store.
 * @param {string} pathname
 * @returns {boolean}
 */
export function requiresStore(pathname) {
  return !NO_STORE_EXEMPT_PATHS.includes(pathname)
}
