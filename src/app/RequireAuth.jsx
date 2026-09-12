import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Route guard for authenticated routes (/seller/* and /create-store).
 * Redirects guests to /login while preserving the return path via query
 * parameter so the context survives login <-> register cross-navigation.
 */
function RequireAuth() {
  const { user, authLoaded } = useAuth()
  const location = useLocation()

  if (!authLoaded) {
    return null
  }

  if (!user) {
    const returnUrl = location.pathname + location.search + location.hash
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />
  }

  return <Outlet />
}

export default RequireAuth