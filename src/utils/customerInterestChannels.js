/**
 * Channel derivation for the Customer Interest UI.
 *
 * Channels are NOT fixed: cards are built from WhatsApp plus the store's
 * currently configured external channels (docs/PRODUCT.md §16). Deleted or
 * renamed channels remain reachable as filter options — each interest record
 * snapshots its channel name — but never as active cards. There is no generic
 * "Lainnya" channel: every entry is derived from real data.
 */

import { INTEREST_TYPE } from '../constants/enums'
import { FILTER_ALL } from './customerInterestFilter'

const WHATSAPP_NAME = 'WhatsApp'

/**
 * Build the complete channel option set.
 *
 * `current` = WhatsApp + the store's configured external channels (deduped)
 * — these become the channel cards. `historical` = channels that only exist as
 * snapshots on interest records (deleted/renamed) — filter options only.
 * `all` = every selectable channel, current first, historical last.
 *
 * @param {{
 *   interests: import('../data/models.js').CustomerInterest[],
 *   channels?: import('../data/models.js').ExternalChannel[],
 * }} params
 * @returns {{ current: object[], historical: object[], all: object[] }}
 */
export function buildChannelOptions({ interests = [], channels = [] }) {
  const seen = new Set()
  const current = []

  current.push({
    id: 'whatsapp',
    name: WHATSAPP_NAME,
    kind: INTEREST_TYPE.WHATSAPP_CLICK,
    isCurrent: true,
    isHistorical: false,
  })
  seen.add(WHATSAPP_NAME)

  for (const channel of channels) {
    const name = String(channel.name || '').trim()
    if (!name || seen.has(name)) {
      continue
    }
    seen.add(name)
    current.push({
      id: `marketplace:${name}`,
      name,
      kind: INTEREST_TYPE.MARKETPLACE_CLICK,
      isCurrent: true,
      isHistorical: false,
    })
  }

  const historical = []
  for (const interest of interests) {
    const name = String(interest.channel || '').trim()
    if (!name || seen.has(name)) {
      continue
    }
    seen.add(name)
    historical.push({
      id: `marketplace:${name}`,
      name,
      kind: INTEREST_TYPE.MARKETPLACE_CLICK,
      isCurrent: false,
      isHistorical: true,
    })
  }

  return { current, historical, all: [...current, ...historical] }
}

/**
 * Count interest records whose channel snapshot matches `name`.
 * @param {import('../data/models.js').CustomerInterest[]} interests
 * @param {string} name
 * @returns {number}
 */
export function countByChannel(interests, name) {
  const target = String(name || '').trim().toLowerCase()
  if (!target) {
    return 0
  }
  return interests.filter(
    (interest) => String(interest.channel || '').trim().toLowerCase() === target,
  ).length
}

/**
 * True when `channel` is the default "show everything" option.
 * @param {string|undefined} channel
 * @returns {boolean}
 */
export function isAnyChannel(channel) {
  return channel == null || channel === FILTER_ALL
}

export { FILTER_ALL }