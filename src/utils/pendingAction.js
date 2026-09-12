const STORAGE_KEY = 'kataloga.pendingAction'

/**
 * Pending-action context that survives a guest login/register round-trip.
 * The returnUrl already restores the page; this stores the action ("open
 * WhatsApp" / "open marketplace channel") that must auto-continue after auth.
 */

/**
 * Save a pending action for the given return path.
 * @param {string} path
 * @param {{ type: string, [key: string]: any }} action
 */
export function setPendingAction(path, action) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ path, action }))
  } catch {
    // sessionStorage unavailable (private mode); the user can retry the action
  }
}

/**
 * Read and clear the pending action for a path.
 * @param {string} path
 * @returns {object|null}
 */
export function consumePendingAction(path) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.path !== path) {
      return null
    }
    sessionStorage.removeItem(STORAGE_KEY)
    return parsed.action ?? null
  } catch {
    return null
  }
}