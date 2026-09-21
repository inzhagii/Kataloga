import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import AuthAlert from '../../components/auth/AuthAlert'
import OtpInput from '../../components/auth/OtpInput'
import TextField from '../../components/auth/TextField'
import useReturnPath from '../../hooks/useReturnPath'
import { OTP_LENGTH, MIN_PASSWORD_LENGTH } from '../../constants/auth'
import { isApiMode } from '../../services/apiConfig'
import { DEMO_OTP_CODE, resetPassword } from '../../services/authService'
import { clearAuthFlowIdentifier, getAuthFlowIdentifier } from '../../utils/authFlowStorage'

/**
 * Password recovery step 2: confirm the code and set a new password.
 * The identifier comes from navigation state (sessionStorage fallback). The
 * OTP and new password are never persisted or placed in the URL.
 */
function ResetPasswordPage() {
  const { backHref } = useReturnPath()
  const navigate = useNavigate()
  const location = useLocation()

  const [identifier] = useState(
    () => location.state?.identifier || getAuthFlowIdentifier() || '',
  )
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [codeError, setCodeError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setCodeError('')
    setPasswordError('')
    setConfirmError('')
    setGlobalError('')

    let valid = true
    if (code.length !== OTP_LENGTH) {
      setCodeError(`Masukkan ${OTP_LENGTH} digit kode verifikasi.`)
      valid = false
    }
    if (!password) {
      setPasswordError('Password baru wajib diisi.')
      valid = false
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`)
      valid = false
    }
    if (!confirmPassword) {
      setConfirmError('Konfirmasi password wajib diisi.')
      valid = false
    } else if (confirmPassword !== password) {
      setConfirmError('Password tidak cocok.')
      valid = false
    }
    if (!valid) {
      return
    }

    setSubmitting(true)
    try {
      await resetPassword({ identifier, code, newPassword: password, confirmPassword })
      clearAuthFlowIdentifier()
      setDone(true)
    } catch (error) {
      setSubmitting(false)
      setGlobalError(
        error instanceof Error ? error.message : 'Reset password gagal. Silakan coba lagi.',
      )
    }
  }

  if (!identifier) {
    return (
      <AuthShell title="Reset Password" subtitle="Atur ulang password akun Anda." backHref="/">
        <AuthAlert tone="info">
          Sesi reset password tidak ditemukan. Mulai ulang proses lupa password.
        </AuthAlert>
        <Link
          to="/forgot-password"
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-brand text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Lupa Password
        </Link>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell title="Password Berhasil Diubah" subtitle="Password baru Anda sudah aktif." backHref="/login">
        <AuthAlert tone="success">Anda dapat masuk kembali menggunakan password baru.</AuthAlert>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-brand text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Masuk
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle={`Masukkan kode yang dikirim ke ${identifier} dan password baru Anda.`}
      backHref={backHref}
    >
      {globalError ? <AuthAlert tone="error">{globalError}</AuthAlert> : null}
      {!isApiMode() ? <AuthAlert tone="info">Mode demo: gunakan kode {DEMO_OTP_CODE}.</AuthAlert> : null}

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <OtpInput
          id="reset-otp"
          value={code}
          onChange={(value) => {
            setCode(value)
            setCodeError('')
            setGlobalError('')
          }}
          error={codeError}
        />

        <TextField
          id="reset-password"
          label="Password Baru"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            setPasswordError('')
            setGlobalError('')
          }}
          error={passwordError}
          hint={`Gunakan minimal ${MIN_PASSWORD_LENGTH} karakter.`}
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
        />

        <TextField
          id="reset-password-confirm"
          label="Konfirmasi Password Baru"
          type="password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value)
            setConfirmError('')
            setGlobalError('')
          }}
          error={confirmError}
          placeholder="Ulangi password baru"
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-brand text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-6 text-center">
        <Link to="/login" className="text-xs font-semibold text-primary-brand hover:underline">
          Kembali ke Masuk
        </Link>
      </div>
    </AuthShell>
  )
}

export default ResetPasswordPage
