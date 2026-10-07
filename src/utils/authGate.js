/**
 * Authentication gate used by customer storefront actions (WhatsApp /
 * Marketplace / CTA) before they record Customer Interest or redirect.
 *
 * The auth bootstrap starts with `user = null` and `authLoaded = false`
 * (app/providers/AuthProvider.jsx). A guest decision must NEVER be taken while the
 * session is still loading, otherwise an authenticated customer would be
 * treated as a guest on the first render. The gate therefore returns HOLD
 * until `authLoaded` is true.
 */

export const AUTH_GATE = {
  HOLD: 'hold',
  GUEST: 'guest',
  AUTHENTICATED: 'authenticated',
}

/**
 * Resolve the action gate from the auth bootstrap state.
 * @param {{ authLoaded: boolean, user: object|null|undefined }} state
 * @returns {'hold'|'guest'|'authenticated'}
 */
export function resolveAuthGate({ authLoaded, user }) {
  if (!authLoaded) {
    return AUTH_GATE.HOLD
  }
  return user ? AUTH_GATE.AUTHENTICATED : AUTH_GATE.GUEST
}
