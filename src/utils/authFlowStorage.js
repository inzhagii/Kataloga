/**
 * Auth-flow context that survives a page reload.
 *
 * Stores only the non-secret login identifier (email / phone) between steps so
 * the verification and reset pages keep working after a refresh. No OTP code,
 * password or token is ever written here.
 */

const IDENTIFIER_KEY = 'kataloga.auth.identifier'

/**
 * @param {string} identifier
 */
export function setAuthFlowIdentifier(identifier) {
  try {
    if (identifier) {
      sessionStorage.setItem(IDENTIFIER_KEY, identifier)
    }
  } catch {
    // sessionStorage unavailable (private mode); navigation state still works.
  }
}

/**
 * @returns {string|null}
 */
export function getAuthFlowIdentifier() {
  try {
    return sessionStorage.getItem(IDENTIFIER_KEY)
  } catch {
    return null
  }
}

export function clearAuthFlowIdentifier() {
  try {
    sessionStorage.removeItem(IDENTIFIER_KEY)
  } catch {
    // Ignore.
  }
}
