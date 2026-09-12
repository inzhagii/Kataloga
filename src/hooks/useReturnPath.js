import { useLocation } from 'react-router-dom'

/**
 * Resolves the authentication return context.
 *
 * The return path is taken from the `?returnUrl=` query parameter
 * (canonical, used by RequireAuth and the login <-> register cross-links)
 * and falls back to `location.state.from` for in-app navigations that pass
 * router state instead.
 *
 * Only internal paths (starting with a single "/") are accepted so the page
 * never redirects to an external URL.
 */
export function useReturnPath() {
  const location = useLocation()

  function sanitize(value) {
    if (!value || typeof value !== 'string') {
      return null
    }
    const trimmed = value.trim()
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
      return null
    }
    return trimmed
  }

  const queryReturn = new URLSearchParams(location.search).get('returnUrl')
  const stateFrom =
    location.state && typeof location.state.from === 'object' && location.state.from !== null
      ? location.state.from.pathname + (location.state.from.search ?? '')
      : null

  const returnPath = sanitize(queryReturn) ?? sanitize(stateFrom)

  /**
   * Build a target href that carries the return context along.
   * @param {string} pathname
   * @returns {string}
   */
  function buildHref(pathname) {
    if (!returnPath) {
      return pathname
    }
    return `${pathname}?returnUrl=${encodeURIComponent(returnPath)}`
  }

  return {
    returnPath,
    backHref: returnPath ?? '/',
    buildHref,
  }
}

export default useReturnPath