import { useLocation } from 'react-router-dom'
import { sanitizeReturnPath } from '../utils/returnUrl'

/**
 * Resolves the authentication return context.
 *
 * The return path is taken from the `?returnUrl=` query parameter
 * (canonical, used by RequireAuth and the login <-> register cross-links)
 * and falls back to `location.state.from` for in-app navigations that pass
 * router state instead.
 *
 * Sanitization rejects external URLs, protocol-relative paths, script/data
 * URLs and control characters so the page never performs an open redirect.
 */
export function useReturnPath() {
  const location = useLocation()

  const queryReturn = new URLSearchParams(location.search).get('returnUrl')
  const stateFrom =
    location.state && typeof location.state.from === 'object' && location.state.from !== null
      ? `${location.state.from.pathname ?? ''}${location.state.from.search ?? ''}`
      : null

  const returnPath = sanitizeReturnPath(queryReturn) ?? sanitizeReturnPath(stateFrom)

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