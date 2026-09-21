/**
 * Shared authentication constants.
 *
 * These mirror the LOCKED auth rules (docs/UX-FLOW.md, docs/PRODUCT.md) so the
 * frontend UX and the (future) backend contract use the same numbers. The
 * backend stays authoritative for OTP expiry/attempts/cooldown and sessions;
 * the mock auth service enforces identical values so the UI can be validated
 * before the API exists.
 */

export const OTP_LENGTH = 6
export const OTP_EXPIRY_MS = 10 * 60 * 1000
export const OTP_MAX_ATTEMPTS = 5
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000

/** Minimum password length shared by Register and every password-change flow. */
export const MIN_PASSWORD_LENGTH = 8

/** Duration a successful OTP verification stays valid for the change-password form (mock only). */
export const OTP_VERIFICATION_TTL_MS = 5 * 60 * 1000

/**
 * OTP purposes. Kept explicit so a code issued for one flow can never be
 * replayed in another.
 */
export const OTP_PURPOSE = {
  REGISTER: 'REGISTER',
  RECOVERY: 'RECOVERY',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  RECOVERY_EMAIL: 'RECOVERY_EMAIL',
}
