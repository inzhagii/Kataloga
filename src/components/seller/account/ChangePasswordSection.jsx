import { useState } from 'react'
import AuthAlert from '../../auth/AuthAlert'
import OtpInput from '../../auth/OtpInput'
import TextField from '../../auth/TextField'
import useCountdown from '../../../hooks/useCountdown'
import { MIN_PASSWORD_LENGTH } from '../../../constants/auth'
import { isAuthError } from '../../../services/authErrors'
import {
  changePassword,
  requestChangePasswordOtp,
  verifyChangePasswordOtp,
} from '../../../services/authService'

/**
 * Change password (email-first + OTP + current/new/confirm).
 *
 * Step 1 sends a code to the account's verified email, step 2 verifies it, and
 * step 3 changes the password. The password and OTP live only in component
 * state and are cleared on success or cancel. Requires the account to have a
 * verified email (the ProfileForm page lets phone-only accounts set a
 * recovery email).
 *
 * @param {{
 *   user: import('../../../data/models.js').User,
 *   onSaved: () => void,
 * }} props
 */
function ChangePasswordSection({ user, onSaved }) {
  const initialEmail = user.email || (user.recoveryEmailVerified ? user.recoveryEmail : '') || ''
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { remaining, start, reset } = useCountdown()

  const hasEmail = Boolean(initialEmail)
  const inputClass =
    'w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

  function clearSensitive() {
    setCode('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    reset()
  }

  function handleCancel() {
    setStep(1)
    setError('')
    clearSensitive()
  }

  async function handleSend(event) {
    event.preventDefault()
    setError('')
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      setError('Email wajib diisi.')
      return
    }
    setSubmitting(true)
    try {
      const result = await requestChangePasswordOtp({ email: trimmed })
      start(result?.expiresAt ?? Date.now() + 60000)
      setEmail(trimmed)
      setStep(2)
    } catch (err) {
      if (isAuthError(err) && err.retryAfterSeconds) {
        start(Date.now() + err.retryAfterSeconds * 1000)
      }
      setError(err instanceof Error ? err.message : 'Gagal mengirim kode.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setError('')
    setSubmitting(true)
    try {
      const result = await requestChangePasswordOtp({ email })
      start(result?.expiresAt ?? Date.now() + 60000)
    } catch (err) {
      if (isAuthError(err) && err.retryAfterSeconds) {
        start(Date.now() + err.retryAfterSeconds * 1000)
      }
      setError(err instanceof Error ? err.message : 'Gagal mengirim ulang kode.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerify(event) {
    event.preventDefault()
    setError('')
    if (code.length !== 6) {
      setError('Masukkan 6 digit kode verifikasi.')
      return
    }
    setSubmitting(true)
    try {
      await verifyChangePasswordOtp({ email, code })
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verifikasi kode gagal.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleChange(event) {
    event.preventDefault()
    setError('')
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password baru minimal ${MIN_PASSWORD_LENGTH} karakter.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.')
      return
    }
    setSubmitting(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword })
      handleCancel()
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengganti password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-5 border-b border-outline-variant/30 pb-4">
        <h2 className="text-base font-bold text-on-surface">Keamanan Akun</h2>
        <p className="text-xs text-secondary">
          Ganti password melalui verifikasi email. Siapkan kode, lalu masukkan password saat ini
          dan password baru.
        </p>
      </div>

      {!hasEmail ? (
        <AuthAlert tone="info">
          Akun ini belum memiliki email terverifikasi. Tambahkan email pemulihan di bagian Email
          Pemulihan sebelum mengganti password.
        </AuthAlert>
      ) : null}

      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}

      {hasEmail && step === 1 ? (
        <form onSubmit={handleSend} noValidate className="flex flex-col gap-4">
          <TextField
            id="change-email"
            label="Email terverifikasi"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value)
              setError('')
            }}
            disabled={submitting}
            autoComplete="email"
            inputMode="email"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Kirim Kode'}
            </button>
          </div>
        </form>
      ) : null}

      {hasEmail && step === 2 ? (
        <form onSubmit={handleVerify} noValidate className="flex flex-col gap-4">
          <OtpInput
            id="change-otp"
            value={code}
            onChange={(value) => {
              setCode(value)
              setError('')
            }}
            hint={`Kode dikirim ke ${email}.`}
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting || remaining > 0}
              className="text-xs font-semibold text-primary transition hover:underline disabled:cursor-not-allowed disabled:text-outline"
            >
              {remaining > 0 ? `Kirim ulang dalam ${remaining}s` : 'Kirim ulang kode'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-surface-container-low"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              >
                {submitting ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {hasEmail && step === 3 ? (
        <form onSubmit={handleChange} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="change-current" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface">
              Password Saat Ini
            </label>
            <input
              id="change-current"
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value)
                setError('')
              }}
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          <TextField
            id="change-new"
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(value) => {
              setNewPassword(value)
              setError('')
            }}
            hint={`Gunakan minimal ${MIN_PASSWORD_LENGTH} karakter.`}
            autoComplete="new-password"
          />

          <TextField
            id="change-confirm"
            label="Konfirmasi Password Baru"
            type="password"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value)
              setError('')
            }}
            autoComplete="new-password"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-surface-container-low"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

export default ChangePasswordSection
