/**
 * Channel derivation for the Customer Interest UI.
 *
 * Channels are NOT fixed: cards are built from WhatsApp plus the store's
 * currently configured external channels (docs/AGENTS.md §16). Store channel
 * configurations are persisted as `{ channelId, url }` references, so names
 * and logos are resolved through the shared channel master (CMS + the store's
 * custom channels) before cards/filters are built. Deleted or renamed channels
 * remain reachable as filter options — each interest record snapshots its
 * channel name — but never as active cards. There is no generic "Lainnya"
 * channel: every entry is derived from real data.
 */

import { INTEREST_TYPE } from '../constants/enums'
import { destinationIcon } from '../constants/destinationPresets'
import { CUSTOM_CHANNEL_LOGO } from '../data/mock/channels'
import {
  resolveChannelDefinition,
  resolveChannelRefsForDisplay,
} from './channels'
import { FILTER_ALL } from './customerInterestFilter'

const WHATSAPP_NAME = 'WhatsApp'

/**
 * Find a channel definition by display name (case-insensitive). Used to give
 * legacy name-snapshot records the same icon treatment as a resolved
 * channelId reference.
 * @param {string} name
 * @param {import('../data/models.js').ChannelDefinition[]} definitions
 * @returns {import('../data/models.js').ChannelDefinition|null}
 */
export function findChannelDefinitionByName(name, definitions) {
  const target = String(name ?? '').trim().toLowerCase()
  if (!target || !Array.isArray(definitions)) {
    return null
  }
  return definitions.find(
    (definition) =>
      definition &&
      typeof definition.name === 'string' &&
      definition.name.toLowerCase() === target,
  ) ?? null
}

/**
 * Resolve the ready-to-render display icon for a channel name, preferring the
 * shared master definition when one matches and falling back to the
 * frontend-owned destination preset otherwise.
 * @param {string} name
 * @param {import('../data/models.js').ChannelDefinition[]} definitions
 * @returns {string} Material symbol token.
 */
export function resolveChannelLogo(name, definitions) {
  const definition = findChannelDefinitionByName(name, definitions)
  return (definition && definition.logo) || destinationIcon(name)
}

/**
 * Resolve the channel displayed for a single Customer Interest record: a
 * `channelId` reference resolves against the shared channel master (name +
 * logo); legacy records without a channelId keep the recorded `channel` name
 * snapshot and resolve their logo from a matching definition or the preset
 * fallback. WhatsApp is its own display (never resolves to a definition).
 * @param {{
 *   channelType?: string,
 *   channel?: string|null,
 *   channelId?: string|null,
 * }} record
 * @param {import('../data/models.js').ChannelDefinition[]} [definitions]
 * @returns {{ name: string, logo: string|null, isWhatsApp: boolean }}
 */
export function resolveInterestChannel(record, definitions = []) {
  if (record?.channelType === INTEREST_TYPE.WHATSAPP_CLICK) {
    return { name: WHATSAPP_NAME, logo: null, isWhatsApp: true }
  }
  const channel = String(record?.channel ?? '').trim()
  const channelId = record?.channelId ? String(record.channelId) : ''
  if (channelId) {
    const definition = resolveChannelDefinition(channelId, definitions)
    return {
      name: definition?.name ?? (channel || channelId),
      logo: definition?.logo
        ? definition.logo
        : channel
          ? destinationIcon(channel)
          : CUSTOM_CHANNEL_LOGO,
      isWhatsApp: false,
    }
  }
  const name = channel || 'Marketplace'
  return { name, logo: resolveChannelLogo(name, definitions), isWhatsApp: false }
}

/**
 * Build the complete channel option set.
 *
 * `current` = WhatsApp + the store's configured external channels (refs
 * resolved to names/logos through the shared master, deduped) — these become
 * the channel cards. `historical` = channels that only exist as snapshots on
 * interest records (deleted/renamed) — filter options only. `all` = every
 * selectable channel, current first, historical last.
 *
 * @param {{
 *   interests: import('../data/models.js').CustomerInterest[],
 *   channels?: import('../data/models.js').ExternalChannel[],
 *   definitions?: import('../data/models.js').ChannelDefinition[],
 * }} params
 * @returns {{ current: object[], historical: object[], all: object[] }}
 */
export function buildChannelOptions({ interests = [], channels = [], definitions = [] }) {
  const seen = new Set()
  const current = []

  current.push({
    id: 'whatsapp',
    name: WHATSAPP_NAME,
    logo: null,
    kind: INTEREST_TYPE.WHATSAPP_CLICK,
    isCurrent: true,
    isHistorical: false,
  })
  seen.add(WHATSAPP_NAME)

  const displayedChannels = resolveChannelRefsForDisplay(channels, definitions)
  for (const channel of displayedChannels) {
    const name = String(channel.name || '').trim()
    if (!name || seen.has(name)) {
      continue
    }
    seen.add(name)
    current.push({
      id: `marketplace:${name}`,
      channelId: channel.channelId,
      name,
      logo: channel.logo ?? resolveChannelLogo(name, definitions),
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
      logo: resolveChannelLogo(name, definitions),
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