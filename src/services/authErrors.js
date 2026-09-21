/**
 * Typed authentication errors.
 *
 * Auth flows need to branch on the *reason* a step failed (wrong code vs.
 * expired code vs. too many attempts) without leaking raw backend internals to
 * the UI. `AuthError` carries a stable `code` plus an optional retry hint, and
 * the service layer maps it to an understandable message. Raw stack traces,
 * secrets and OTP values never travel through this object.
 */

export const AUTH_ERROR_CODE = {
  INVALID_IDENTIFIER: 'invalid_identifier',
  DUPLICATE_IDENTIFIER: 'duplicate_identifier',
  INVALID_CREDENTIALS: 'invalid_credentials',
  EMAIL_UNVERIFIED: 'email_unverified',
  UNAUTHENTICATED: 'unauthenticated',
  EMAIL_MISMATCH: 'email_mismatch',
  PASSWORD_MISMATCH: 'password_mismatch',
  WEAK_PASSWORD: 'weak_password',
  INVALID_CURRENT_PASSWORD: 'invalid_current_password',
  OTP_INVALID: 'otp_invalid',
  OTP_EXPIRED: 'otp_expired',
  OTP_ATTEMPTS_EXCEEDED: 'otp_attempts_exceeded',
  OTP_COOLDOWN: 'otp_cooldown',
  OTP_NOT_VERIFIED: 'otp_not_verified',
  RECOVERY_EMAIL_MISSING: 'recovery_email_missing',
  GENERIC: 'generic',
}

const DEFAULT_MESSAGES = {
  [AUTH_ERROR_CODE.INVALID_IDENTIFIER]:
    'Masukkan email atau nomor HP yang valid saat pendaftaran.',
  [AUTH_ERROR_CODE.DUPLICATE_IDENTIFIER]: 'Email atau nomor HP sudah terdaftar.',
  [AUTH_ERROR_CODE.INVALID_CREDENTIALS]:
    'Email / no. HP atau password salah. Silakan periksa kembali data akun Anda.',
  [AUTH_ERROR_CODE.EMAIL_UNVERIFIED]:
    'Email belum diverifikasi. Verifikasi email terlebih dahulu untuk melanjutkan.',
  [AUTH_ERROR_CODE.UNAUTHENTICATED]: 'Sesi Anda telah berakhir. Silakan login kembali.',
  [AUTH_ERROR_CODE.EMAIL_MISMATCH]: 'Email tidak sesuai dengan akun yang sedang aktif.',
  [AUTH_ERROR_CODE.PASSWORD_MISMATCH]: 'Password dan konfirmasi password tidak sama.',
  [AUTH_ERROR_CODE.WEAK_PASSWORD]: 'Password belum memenuhi ketentuan.',
  [AUTH_ERROR_CODE.INVALID_CURRENT_PASSWORD]: 'Password saat ini tidak sesuai.',
  [AUTH_ERROR_CODE.OTP_INVALID]: 'Kode verifikasi salah. Periksa kembali kode Anda.',
  [AUTH_ERROR_CODE.OTP_EXPIRED]: 'Kode verifikasi sudah kedaluwarsa. Kirim ulang kode baru.',
  [AUTH_ERROR_CODE.OTP_ATTEMPTS_EXCEEDED]:
    'Terlalu banyak percobaan. Kirim ulang kode verifikasi untuk mencoba lagi.',
  [AUTH_ERROR_CODE.OTP_COOLDOWN]: 'Mohon tunggu sebelum meminta kode baru.',
  [AUTH_ERROR_CODE.OTP_NOT_VERIFIED]:
    'Verifikasi kode terlebih dahulu sebelum mengganti password.',
  [AUTH_ERROR_CODE.RECOVERY_EMAIL_MISSING]:
    'Tambahkan email pemulihan yang terverifikasi untuk pemulihan password.',
  [AUTH_ERROR_CODE.GENERIC]: 'Terjadi kesalahan. Silakan coba lagi.',
}

export class AuthError extends Error {
  /**
   * @param {{
   *   code?: string,
   *   message?: string,
   *   retryAfterSeconds?: number|null,
   *   remainingAttempts?: number|null,
   * }} [options]
   */
  constructor({ code = AUTH_ERROR_CODE.GENERIC, message, retryAfterSeconds, remainingAttempts } = {}) {
    super(message || DEFAULT_MESSAGES[code] || DEFAULT_MESSAGES[AUTH_ERROR_CODE.GENERIC])
    this.name = 'AuthError'
    this.code = code
    if (retryAfterSeconds !== undefined && retryAfterSeconds !== null) {
      this.retryAfterSeconds = retryAfterSeconds
    }
    if (remainingAttempts !== undefined && remainingAttempts !== null) {
      this.remainingAttempts = remainingAttempts
    }
  }
}

/**
 * @param {unknown} error
 * @returns {boolean}
 */
export function isAuthError(error) {
  return error instanceof AuthError
}
