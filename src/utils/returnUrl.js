/**
 * Return-URL sanitizer.
 *
 * Authentication redirects must only ever send the user to an internal,
 * single-leading-slash path. Anything that could become an open redirect or a
 * script/data URL (absolute URLs, protocol-relative `//host`, backslashes,
 * control characters, or percent-encoded variants) is rejected by returning
 * null. Callers then fall back to a safe default.
 */

const SCHEME_PREFIX = /^[a-z][a-z0-9+.-]*:/i

/**
 * Detect ASCII control characters without a control-char regex (lint-safe).
 * @param {string} value
 * @returns {boolean}
 */
function hasControlChars(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 0x1f || code === 0x7f) {
      return true
    }
  }
  return false
}

function decodeOnce(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

function hasUnsafeScheme(value) {
  return SCHEME_PREFIX.test(value.replace(/^\/+/, ''))
}

/**
 * @param {unknown} value
 * @returns {string|null} A safe internal path, or null when the value is not safe.
 */
export function sanitizeReturnPath(value) {
  if (!value || typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (hasControlChars(trimmed)) {
    return null
  }

  if (trimmed.includes('\\')) {
    return null
  }

  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null
  }

  if (hasUnsafeScheme(trimmed)) {
    return null
  }

  const decoded = decodeOnce(trimmed)
  if (decoded !== null) {
    if (decoded.includes('\\') || decoded.startsWith('//') || hasControlChars(decoded)) {
      return null
    }
    if (hasUnsafeScheme(decoded)) {
      return null
    }
  }

  return trimmed
}

export default sanitizeReturnPath
