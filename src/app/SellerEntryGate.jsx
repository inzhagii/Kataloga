import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Entry gateway for the seller area (/seller). Resolves where an account
 * should land without a dedicated backend endpoint: auth + store status are
 * read from the session.
 *
 * - Guest → /login (return path preserved so the user returns to /seller).
 * - Authenticated without a store → /create-store.
 * - Authenticated with a store → /seller/dashboard.
 */
function SellerEntryGate() {
  const { user, authLoaded } = useAuth()

  if (!authLoaded) {
    return null
  }

  if (!user) {
    return <Navigate to="/login?returnUrl=%2Fseller" replace />
  }

  if (!user.hasStore) {
    return <Navigate to="/create-store" replace />
  }

  return <Navigate to="/seller/dashboard" replace />
}

export default SellerEntryGate