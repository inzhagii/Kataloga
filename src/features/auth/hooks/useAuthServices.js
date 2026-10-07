import { requestPasswordReset, resetPassword } from '../../../services/authService'

/**
 * Auth flow service access for the recovery pages (forgot / reset password).
 * Keeps the service layer out of the presentational page components.
 */
export function useAuthServices() {
  return { requestPasswordReset, resetPassword }
}
