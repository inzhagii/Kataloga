import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import TextField from '../../components/auth/TextField'
import { useAuth } from '../../hooks/useAuth'
import useReturnPath from '../../hooks/useReturnPath'
import { isValidIdentifier } from '../../services/authService'

function LoginPage() {
  const { user, authLoaded, login } = useAuth()
  const { returnPath, backHref, buildHref } = useReturnPath()
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [identifierError, setIdentifierError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [credentialInvalid, setCredentialInvalid] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function destination(targetUser = user) {
    if (returnPath && returnPath !== '/login' && returnPath !== '/register') {
      return returnPath
    }
    return targetUser.hasStore ? '/seller/dashboard' : '/create-store'
  }

  useEffect(() => {
    if (authLoaded && user) {
      navigate(destination(), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, user])

  async function handleSubmit(event) {
    event.preventDefault()

    setIdentifierError('')
    setPasswordError('')
    setGlobalError('')
    setCredentialInvalid(false)

    const trimmedIdentifier = identifier.trim()

    if (!trimmedIdentifier) {
      setIdentifierError('Email atau nomor HP wajib diisi.')
      return
    }

    if (!isValidIdentifier(trimmedIdentifier)) {
      setIdentifierError('Masukkan email atau nomor HP yang valid.')
      return
    }

    if (!password) {
      setPasswordError('Password wajib diisi.')
      return
    }

    setSubmitting(true)

    try {
      const loggedIn = await login({ emailOrPhone: trimmedIdentifier, password })
      navigate(destination(loggedIn), { replace: true })
    } catch (error) {
      setSubmitting(false)
      setCredentialInvalid(true)
      setGlobalError(
        error instanceof Error ? error.message : 'Tidak dapat terhubung ke server. Silakan coba lagi.'
      )
    }
  }

  function clearFieldErrors() {
    setIdentifierError('')
    setPasswordError('')
    setCredentialInvalid(false)
    setGlobalError('')
  }

  return (
    <AuthShell
      title="Masuk ke Kataloga"
      subtitle="Masuk untuk melanjutkan ke akun Anda."
      backHref={backHref}
    >
      {globalError ? (
        <div
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
          role="alert"
          aria-live="polite"
        >
          <span className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-red-600" aria-hidden="true">
            error
          </span>
          <p className="text-xs font-medium leading-relaxed text-red-800">{globalError}</p>
        </div>
      ) : null}

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        <TextField
          id="identifier"
          label="Email atau No. HP"
          type="text"
          value={identifier}
          onChange={(value) => {
            setIdentifier(value)
            clearFieldErrors()
          }}
          invalid={credentialInvalid}
          error={identifierError}
          placeholder="Masukkan email atau nomor HP"
          autoComplete="username"
          inputMode="email"
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            clearFieldErrors()
          }}
          invalid={credentialInvalid}
          error={passwordError}
          placeholder="Masukkan password"
          autoComplete="current-password"
        />

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-brand text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-primary-brand/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-6 text-center">
        <p className="text-xs text-slate-500">
          Belum punya akun?
          <Link
            to={buildHref('/register')}
            className="ml-1 font-semibold text-primary-brand transition hover:text-blue-700 hover:underline"
          >
            Daftar
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}

export default LoginPage