import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import AuthAlert from '../../components/auth/AuthAlert'
import OtpInput from '../../components/auth/OtpInput'
import { useAuth } from '../../hooks/useAuth'
import useCountdown from '../../hooks/useCountdown'
import useReturnPath from '../../hooks/useReturnPath'
import { isAuthError } from '../../services/authErrors'
import { isApiMode } from '../../services/apiConfig'
import { DEMO_OTP_CODE } from '../../services/authService'
import { OTP_LENGTH } from '../../constants/auth'
import {
  clearAuthFlowIdentifier,
  getAuthFlowIdentifier,
  setAuthFlowIdentifier,
} from '../../utils/authFlowStorage'

/**
 * Email OTP verification for new email-based accounts.
 * A code issued at registration must be confirmed before the account is
 * authenticated. The email address travels in navigation state (persisted in
 * sessionStorage for reloads); the code is never stored or placed in the URL.
 */
function VerifyEmailPage() {
  const { user, authLoaded, verifyEmail, resendVerification } = useAuth()
  const { returnPath, backHref } = useReturnPath()
  const navigate = useNavigate()
  const location = useLocation()

  const [identifier] = useState(
    () => location.state?.identifier || getAuthFlowIdentifier() || '',
  )
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const { remaining, start, reset } = useCountdown()

  useEffect(() => {
    if (identifier) {
      setAuthFlowIdentifier(identifier)
    }
  }, [identifier])

  useEffect(() => {
    if (authLoaded && user) {
      const fallback = returnPath && returnPath !== '/login' && returnPath !== '/register'
        ? returnPath
        : user.hasStore
          ? '/seller/dashboard'
          : '/create-store'
      navigate(fallback, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, user])

  async function handleResend() {
    setError('')
    setInfo('')
    setResending(true)
    try {
      const result = await resendVerification(identifier)
      start(result?.expiresAt ?? Date.now() + 60000)
      setInfo('Kode verifikasi baru telah dikirim ke email Anda.')
    } catch (err) {
      if (isAuthError(err) && err.retryAfterSeconds) {
        start(Date.now() + err.retryAfterSeconds * 1000)
      }
      setError(err instanceof Error ? err.message : 'Tidak dapat mengirim kode. Coba lagi.')
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setInfo('')

    if (code.length !== 6) {
      setError('Masukkan 6 digit kode verifikasi.')
      return
    }

    setSubmitting(true)
    try {
      await verifyEmail({ identifier, code })
      clearAuthFlowIdentifier()
      reset()
    } catch (err) {
      setSubmitting(false)
      setError(err instanceof Error ? err.message : 'Verifikasi gagal. Silakan coba lagi.')
    }
  }

  if (!identifier) {
    return (
      <AuthShell title="Verifikasi Email" subtitle="Konfirmasi alamat email akun Anda." backHref="/">
        <AuthAlert tone="info">
          Tidak ada proses verifikasi yang aktif. Daftar terlebih dahulu untuk memulai.
        </AuthAlert>
        <Link
          to="/register"
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-brand text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Daftar
        </Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Verifikasi Email"
      subtitle={`Masukkan kode ${OTP_LENGTH} digit yang dikirim ke ${identifier}.`}
      backHref={backHref}
    >
      {error ? <AuthAlert tone="error">{error}</AuthAlert> : null}
      {info ? <AuthAlert tone="success">{info}</AuthAlert> : null}
      {!isApiMode() ? <AuthAlert tone="info">Mode demo: gunakan kode {DEMO_OTP_CODE}.</AuthAlert> : null}

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <OtpInput id="verify-otp" value={code} onChange={(value) => {
          setCode(value)
          setError('')
        }} />

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-brand text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Memverifikasi...' : 'Verifikasi Email'}
        </button>
      </form>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || remaining > 0}
          className="text-xs font-semibold text-primary-brand transition hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
        >
          {remaining > 0 ? `Kirim ulang dalam ${remaining}s` : 'Kirim ulang kode'}
        </button>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-6 text-center">
        <p className="text-xs text-slate-500">
          Sudah terverifikasi?
          <Link to="/login" className="ml-1 font-semibold text-primary-brand hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

export default VerifyEmailPage
