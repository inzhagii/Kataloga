import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import AuthAlert from '../../components/auth/AuthAlert'
import TextField from '../../components/auth/TextField'
import useReturnPath from '../../hooks/useReturnPath'
import { isValidIdentifier, requestPasswordReset } from '../../services/authService'
import { setAuthFlowIdentifier } from '../../utils/authFlowStorage'

/**
 * Password recovery step 1: request a reset code.
 *
 * The response is intentionally generic ("if the account exists...") so the
 * flow never reveals whether an identifier is registered. The account must
 * already have a verified email (or verified recovery email) to receive a code.
 */
function ForgotPasswordPage() {
  const { backHref } = useReturnPath()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setFieldError('')
    setGlobalError('')

    const trimmed = identifier.trim()
    if (!trimmed) {
      setFieldError('Email atau nomor HP wajib diisi.')
      return
    }
    if (!isValidIdentifier(trimmed)) {
      setFieldError('Masukkan email atau nomor HP yang valid.')
      return
    }

    setSubmitting(true)
    try {
      await requestPasswordReset({ identifier: trimmed })
      setAuthFlowIdentifier(trimmed)
      navigate('/reset-password', { state: { identifier: trimmed } })
    } catch (error) {
      setSubmitting(false)
      setGlobalError(
        error instanceof Error ? error.message : 'Tidak dapat memproses permintaan. Coba lagi.',
      )
    }
  }

  return (
    <AuthShell
      title="Lupa Password?"
      subtitle="Masukkan email atau nomor HP akun Anda untuk menerima kode pemulihan."
      backHref={backHref}
    >
      {globalError ? <AuthAlert tone="error">{globalError}</AuthAlert> : null}
      <AuthAlert tone="info">
        Jika akun terdaftar dan memiliki email terverifikasi, kode pemulihan akan dikirim.
      </AuthAlert>

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <TextField
          id="forgot-identifier"
          label="Email atau No. HP"
          type="text"
          value={identifier}
          onChange={(value) => {
            setIdentifier(value)
            setFieldError('')
            setGlobalError('')
          }}
          error={fieldError}
          placeholder="nama@email.com atau 0812..."
          autoComplete="username"
          inputMode="email"
        />

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-primary-brand text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Mengirim...' : 'Kirim Kode Pemulihan'}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-6 text-center">
        <p className="text-xs text-slate-500">
          Ingat password Anda?
          <Link to="/login" className="ml-1 font-semibold text-primary-brand hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

export default ForgotPasswordPage
