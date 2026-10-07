import {
  changePassword,
  requestChangePasswordOtp,
  sendRecoveryEmailOtp,
  verifyChangePasswordOtp,
} from '../../../services/authService'
import { getMyStore } from '../../../services/storeService'

/**
 * Service access for the Account page sections. Returns the (stable) service
 * functions so the presentational components depend on a hook instead of the
 * service layer directly.
 */
export function useAccountServices() {
  return {
    getMyStore,
    sendRecoveryEmailOtp,
    requestChangePasswordOtp,
    verifyChangePasswordOtp,
    changePassword,
  }
}
