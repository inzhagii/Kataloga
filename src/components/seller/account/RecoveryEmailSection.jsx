import { useState } from 'react'
import AuthAlert from '../../auth/AuthAlert'
import OtpInput from '../../auth/OtpInput'
import TextField from '../../auth/TextField'
import useCountdown from '../../../hooks/useCountdown'
import { useAuth } from '../../../hooks/useAuth'
import { isValidEmail, sendRecoveryEmailOtp } from '../../../services/authService'
import { isAuthError } from '../../../services/authErrors'

/**
 * Recovery email management for the authenticated account.
 *
 * A verified recovery email lets phone-only accounts (which register without a
 * login email) use password recovery and change password. The email is
 * confirmed with a code before it is saved.
 *
 * @param {{ user: import('../../../data/models.js').User }} props
 */
function RecoveryEmailSection({ user }) {
  const { verifyRecoveryEmail } = useAuth()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(user.recoveryEmail || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { remaining, start, reset } = useCountdown()

  function clearSensitive() {
    setCode('')
    reset()
  }

  async function handleSend(event) {
    event.preventDefault()
    setError('')
    setInfo('')
    const trimmed = email.trim().toLowerCase()
    if (!isValidEmail(trimmed)) {
      setError('Masukkan alamat email yang valid.')
      return
    }
    setSubmitting(true)
    try {
      const result = await sendRecoveryEmailOtp({ email: trimmed })
      start(result?.expiresAt ?? Date.now() + 60000)
      setEmail(trimmed)
      setInfo(`Kode verifikasi dikirim ke ${trimmed}.`)
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
      const result = await sendRecoveryEmailOtp({ email })
      start(result?.expiresAt ?? Date.now() + 60000)
      setInfo(`Kode verifikasi dikirim ulang ke ${email}.`)
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
      await verifyRecoveryEmail({ email, code })
      clearSensitive()
      setStep(1)
      setInfo('Email pemulihan berhasil diverifikasi.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verifikasi kode gagal.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancel() {
    setStep(1)
    setCode('')
    setError('')
    setInfo('')
    reset()
  }

  return (
    <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-5 border-b border-outline-variant/30 pb-4">
        <h2 className="text-base font-bold text-on-surface">Email Pemulihan</h2>
        <p className="text-xs text-secondary">
          Gunakan email aktif untuk menerima kode pemulihan password dan verifikasi penggantian
          password.
        </p>
      </div>

      {user.recoveryEmailVerified && user.recoveryEmail ? (
        <p className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs font-medium text-green-800">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            verified
          </span>
          Email pemulihan terverifikasi: {user.recoveryEmail}
        </p>
      ) : null}

      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
      {info ? <AuthAlert tone="success">{info}</AuthAlert> : null}

      {step === 1 ? (
        <form onSubmit={handleSend} noValidate className="flex flex-col gap-4">
          <TextField
            id="recovery-email"
            label="Email Pemulihan"
            type="email"
            value={email}
            onChange={(value) => {
              setEmail(value)
              setError('')
              setInfo('')
            }}
            disabled={submitting}
            placeholder="nama@email.com"
            autoComplete="email"
            inputMode="email"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : user.recoveryEmailVerified ? 'Ganti Email' : 'Kirim Kode'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} noValidate className="flex flex-col gap-4">
          <OtpInput
            id="recovery-otp"
            value={code}
            onChange={(value) => {
              setCode(value)
              setError('')
            }}
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
                {submitting ? 'Memverifikasi...' : 'Verifikasi Email'}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  )
}

export default RecoveryEmailSection
