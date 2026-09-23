/**
 * External channel reference helpers (docs/PRODUCT.md §16).
 *
 * Store `channels` and Product `externalLinks` are persisted as references:
 * `{ channelId, url }`. Channel name/logo always come from the shared channel
 * master (CMS, or seller-created store-scoped custom channels), never from the
 * referencing record — so records cannot carry duplicated channel metadata.
 *
 * These helpers are pure and receive their inputs explicitly; the CMS registry
 * lives in src/data/mock/channels.js.
 */

import { CHANNEL_SOURCE } from '../constants/enums'
import { CUSTOM_CHANNEL_ID_PREFIX, CUSTOM_CHANNEL_LOGO } from '../data/mock/channels'

/**
 * True when `ref` is a persisted channel reference ({ channelId, url }).
 * @param {unknown} ref
 * @returns {boolean}
 */
export function isChannelRef(ref) {
  return Boolean(ref) && typeof ref.channelId === 'string' && ref.channelId.length > 0
}

/**
 * True when a channel definition is a seller-created (store-scoped) channel.
 * Custom definitions are flagged with `custom` and/or a "CUSTOM:" id prefix.
 * @param {import('../data/models.js').ChannelDefinition|undefined} definition
 * @returns {boolean}
 */
export function isCustomChannelDefinition(definition) {
  if (!definition || typeof definition !== 'object') {
    return false
  }
  return Boolean(definition.custom) || String(definition.id ?? '').startsWith(CUSTOM_CHANNEL_ID_PREFIX)
}

/**
 * The source (CMS vs CUSTOM) of a channel definition.
 * @param {import('../data/models.js').ChannelDefinition|undefined} definition
 * @returns {string} CHANNEL_SOURCE.CMS | CHANNEL_SOURCE.CUSTOM
 */
export function channelDefinitionSource(definition) {
  return isCustomChannelDefinition(definition) ? CHANNEL_SOURCE.CUSTOM : CHANNEL_SOURCE.CMS
}

/**
 * Resolve a reference's channelId against a set of definitions.
 * @param {string} channelId
 * @param {import('../data/models.js').ChannelDefinition[]} definitions
 * @returns {import('../data/models.js').ChannelDefinition|null}
 */
export function resolveChannelDefinition(channelId, definitions) {
  if (!Array.isArray(definitions)) {
    return null
  }
  return definitions.find((definition) => definition && definition.id === channelId) ?? null
}

/**
 * The complete set of channel definitions available to a store: the shared CMS
 * channels plus that store's custom channels. Used by channel selectors and
 * destination sheets (modal desktop / bottom sheet mobile, never a dropdown).
 * @param {import('../data/models.js').Store} store
 * @param {import('../data/models.js').ChannelDefinition[]} cmsChannels
 * @returns {import('../data/models.js').ChannelDefinition[]}
 */
export function listStoreChannelDefinitions(store, cmsChannels = []) {
  const custom = Array.isArray(store?.customChannels) ? store.customChannels : []
  return [...cmsChannels, ...custom]
}

/**
 * True when the array of references contains the same channelId more than once.
 * A store/product configuration must never reference the same channel twice.
 * @param {Array<{ channelId?: string }>|undefined} refs
 * @returns {boolean}
 */
export function hasDuplicateChannelId(refs = []) {
  const seen = new Set()
  let duplicate = false
  for (const ref of refs) {
    if (!ref || typeof ref.channelId !== 'string') {
      continue
    }
    if (seen.has(ref.channelId)) {
      duplicate = true
      break
    }
    seen.add(ref.channelId)
  }
  return duplicate
}

/**
 * Resolve a list of channel references to ready-to-render display records
 * ({ channelId, url, name, logo }). Name/logo come from the resolved channel
 * definition (CMS or the store's custom channels); an unresolvable channelId
 * falls back to the raw id as the name and the generic custom logo. Plain
 * `{name, url}` entries (legacy display records) pass through unchanged.
 *
 * Used by channel selectors / destination sheets (Store marketplace picker,
 * Product CTA destination picker) so refs are never rendered with blank names.
 * @param {Array<{ channelId?: string, url?: string, name?: string }>|undefined} refs
 * @param {import('../data/models.js').ChannelDefinition[]} definitions
 * @returns {Array<{ channelId: string, url: string, name: string, logo: string }>}
 */
export function resolveChannelRefsForDisplay(refs = [], definitions = []) {
  return refs.map((ref) => {
    if (!isChannelRef(ref)) {
      return ref
    }
    const definition = resolveChannelDefinition(ref.channelId, definitions)
    return {
      channelId: ref.channelId,
      url: ref.url,
      name: definition?.name ?? ref.channelId,
      logo: definition?.logo ?? CUSTOM_CHANNEL_LOGO,
    }
  })
}

export const EXTERNAL_URL_REQUIRED = 'URL external wajib diisi.'
export const CUSTOM_CHANNEL_NAME_REQUIRED = 'Nama channel custom wajib diisi.'
export const CUSTOM_CHANNEL_NAME_DUPLICATE = 'Channel custom dengan nama tersebut sudah ada.'

/**
 * Build a seller-created custom channel definition (docs/PRODUCT.md §16).
 * Custom channels are store-scoped: the id starts with `CUSTOM:`, points back
 * to the owning `storeId`, and always uses the generic logo. The id is derived
 * from the trimmed name (normalized to uppercase alphanumerics + dashes) and
 * de-duplicated against the store's existing custom channel ids. An empty name
 * or a name that duplicates an existing custom channel (case-insensitive) is
 * rejected so one store never has two definitions spelled identically.
 * @param {{
 *   storeId: string,
 *   name: string,
 *   existingChannelIds?: string[],
 *   existingNames?: string[],
 * }} options
 * @returns {import('../data/models.js').CustomChannelDefinition}
 */
export function buildCustomChannelDefinition({
  storeId,
  name,
  existingChannelIds = [],
  existingNames = [],
}) {
  const trimmed = String(name ?? '').trim()
  if (!trimmed) {
    throw new Error(CUSTOM_CHANNEL_NAME_REQUIRED)
  }
  if (existingNames.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error(CUSTOM_CHANNEL_NAME_DUPLICATE)
  }

  let base =
    trimmed
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'CHANNEL'
  let id = `${CUSTOM_CHANNEL_ID_PREFIX}${base}`
  let suffix = 2
  while (existingChannelIds.includes(id)) {
    id = `${CUSTOM_CHANNEL_ID_PREFIX}${base}-${suffix}`
    suffix += 1
  }

  return {
    id,
    storeId,
    name: trimmed,
    logo: CUSTOM_CHANNEL_LOGO,
    custom: true,
  }
}

/**
 * Validate persisted channel references (store channels or product external
 * links). Every selected channel must carry a non-empty URL. Errors are keyed
 * per entry (`channel-<index>`) so the form can highlight the affected channel.
 *
 * A channel pending URL selection stays editable, but Save/Publish is blocked
 * while any selected channel has an empty URL (docs/PRODUCT.md §16).
 * @param {Array<{ channelId?: string, url?: string }>|undefined} refs
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateChannelRefs(refs = []) {
  const errors = {}
  refs.forEach((ref, index) => {
    const key = `channel-${index}`
    if (!isChannelRef(ref)) {
      errors[key] = EXTERNAL_URL_REQUIRED
    } else if (!String(ref.url ?? '').trim()) {
      errors[key] = EXTERNAL_URL_REQUIRED
    }
  })
  return { errors, valid: Object.keys(errors).length === 0 }
}