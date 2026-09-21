/**
 * Customer identity helpers for Customer Interest.
 *
 * A customer is identified by their account id when available, otherwise by
 * the strongest identity available on the record (name > email > phone). This
 * keeps "same customer stays ONE customer" true even when the display name
 * changes on the account. Records without any identity collapse to their own
 * record id so they never leak into another customer's history.
 */

import { toDMY } from './datetime'

/**
 * Resolve a stable identity key for a customer interest record.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {string}
 */
export function customerIdentityOf(interest) {
  if (interest.customerId != null) {
    return `u-${interest.customerId}`
  }
  const key = customerIdentityValue(interest)
  if (key) {
    return `n-${key}`
  }
  return `r-${interest.id}`
}

/**
 * Pick the strongest available identity value (name > email > phone), or null
 * when the record carries none.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {string|null}
 */
export function customerIdentityValue(interest) {
  const value = interest.customerName || interest.customerEmail || interest.customerPhone || null
  return value == null ? null : String(value).trim().toLowerCase() || null
}

/**
 * Resolve the best display name for a customer interest record, falling back
 * from name → email → phone. Never fabricates a placeholder for a missing
 * identity.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {string|null}
 */
export function customerDisplayName(interest) {
  return interest.customerName || interest.customerEmail || interest.customerPhone || null
}

/**
 * Best supporting identity line for a customer interest record, shown below
 * the primary display name. Never duplicates the primary value and never
 * fabricates a placeholder when no supporting identity exists.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {string|null}
 */
export function customerSupportingIdentity(interest) {
  const primary = customerDisplayName(interest)
  if (primary !== interest.customerName) {
    return null
  }
  return interest.customerEmail || interest.customerPhone || null
}

/**
 * Count all activities of the same customer (across the full store list).
 * @param {import('../data/models.js').CustomerInterest[]} interests
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {number}
 */
export function countCustomerActivities(interests, interest) {
  const identity = customerIdentityOf(interest)
  return interests.filter((item) => customerIdentityOf(item) === identity).length
}

/**
 * List every activity of the same customer, newest first.
 * @param {import('../data/models.js').CustomerInterest[]} interests
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {import('../data/models.js').CustomerInterest[]}
 */
export function customerActivities(interests, interest) {
  const identity = customerIdentityOf(interest)
  return interests
    .filter((item) => customerIdentityOf(item) === identity)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

/**
 * Group a customer's activities by calendar date (newest group first, newest
 * activity first inside each group). Handles null/invalid record dates by
 * skipping them. Group label uses the canonical DD.MM.YYYY format.
 * @param {import('../data/models.js').CustomerInterest[]} interests
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {{ dateKey: string, label: string, items: import('../data/models.js').CustomerInterest[] }[]}
 */
export function groupCustomerActivitiesByDate(interests, interest) {
  const history = customerActivities(interests, interest)
  const groups = []
  for (const activity of history) {
    const parts = toDMY(activity.date)
    if (parts === null) {
      continue
    }
    const last = groups[groups.length - 1]
    if (last && last.dateKey === parts.ddmmyyyy) {
      last.items.push(activity)
    } else {
      groups.push({ dateKey: parts.ddmmyyyy, label: parts.ddmmyyyy, items: [activity] })
    }
  }
  return groups
}

/**
 * Resolve the display context for an interest's related product.
 * The product name is a snapshot from record time (safe when the product is
 * later archived or deleted); price is read from the current product only
 * when it still exists.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @param {Map<number, object>} productById
 * @returns {{ product: object|undefined, name: string, icon: string }}
 */
export function productContextOf(interest, productById) {
  const product = interest.productId != null ? productById.get(interest.productId) : undefined
  const isProductLevel = interest.productId != null
  return {
    product,
    name: interest.productName || 'Toko',
    icon: isProductLevel ? 'inventory_2' : 'storefront',
  }
}