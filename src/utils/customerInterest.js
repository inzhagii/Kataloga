/**
 * Customer identity helpers for Customer Interest.
 *
 * A customer is identified by their account id when available, otherwise by
 * their display name. This keeps "same customer stays ONE customer" true even
 * when the display name changes on the account.
 */

/**
 * Resolve a stable identity key for a customer interest record.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {string}
 */
export function customerIdentityOf(interest) {
  if (interest.customerId != null) {
    return `u-${interest.customerId}`
  }
  return `n-${interest.customerName.toLowerCase()}`
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