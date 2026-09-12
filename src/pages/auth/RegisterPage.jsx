import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import TextField from '../../components/auth/TextField'
import { useAuth } from '../../hooks/useAuth'
import useReturnPath from '../../hooks/useReturnPath'
import { isValidIdentifier } from '../../services/authService'

const MIN_PASSWORD_LENGTH = 8

function RegisterPage() {
  const { user, authLoaded, register } = useAuth()
  const { returnPath, backHref, buildHref } = useReturnPath()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [repassword, setRepassword] = useState('')
  const [identifierError, setIdentifierError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [repasswordError, setRepasswordError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function destination(targetUser) {
    if (returnPath && returnPath !== '/login' && returnPath !== '/register') {
      return returnPath
    }
    return targetUser.hasStore ? '/seller/dashboard' : '/create-store'
  }

  useEffect(() => {
    if (authLoaded && user) {
      navigate(destination(user), { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoaded, user])

  function resetErrors() {
    setIdentifierError('')
    setPasswordError('')
    setRepasswordError('')
    setGlobalError('')
  }

  function validateIdentifier(value) {
    const trimmed = value.trim()
    if (!trimmed) {
      setIdentifierError('Email atau nomor HP wajib diisi.')
      return false
    }
    if (!isValidIdentifier(trimmed)) {
      setIdentifierError('Masukkan email atau nomor HP yang valid.')
      return false
    }
    return true
  }

  function validatePassword(value) {
    if (!value) {
      setPasswordError('Password wajib diisi.')
      return false
    }
    if (value.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password minimal ${MIN_PASSWORD_LENGTH} karakter.`)
      return false
    }
    return true
  }

  function validateRepassword(repass, pass = password) {
    if (!repass) {
      setRepasswordError('Konfirmasi password wajib diisi.')
      return false
    }
    if (repass !== pass) {
      setRepasswordError('Password tidak cocok. Pastikan penulisan sama persis.')
      return false
    }
    return true
  }

  function checkMatchOnType(pass, repass) {
    if (repass && pass !== repass) {
      setRepasswordError('Password tidak cocok.')
    } else {
      setRepasswordError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    resetErrors()

    const trimmedName = name.trim()
    const trimmedIdentifier = identifier.trim()

    const identifierOk = validateIdentifier(trimmedIdentifier)
    const passwordOk = validatePassword(password)
    const repasswordOk = validateRepassword(repassword)

    if (!identifierOk || !passwordOk || !repasswordOk) {
      return
    }

    setSubmitting(true)

    try {
      const registered = await register({
        emailOrPhone: trimmedIdentifier,
        password,
        repassword,
        name: trimmedName || null,
      })
      navigate(destination(registered), { replace: true })
    } catch (error) {
      setSubmitting(false)
      setGlobalError(
        error instanceof Error ? error.message : 'Tidak dapat terhubung ke server. Silakan coba lagi.'
      )
    }
  }

  return (
    <AuthShell
      title="Buat akun Kataloga"
      subtitle="Daftar untuk mulai menggunakan Kataloga."
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

      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
        <TextField
          id="reg-name"
          label="Nama lengkap"
          optional
          type="text"
          value={name}
          onChange={(value) => {
            setName(value)
            resetErrors()
          }}
          placeholder="Contoh: Budi Santoso"
          autoComplete="name"
        />

        <TextField
          id="reg-identifier"
          label="Email atau No. Handphone"
          type="text"
          value={identifier}
          onChange={(value) => {
            setIdentifier(value)
            resetErrors()
          }}
          error={identifierError}
          placeholder="nama@email.com atau 0812..."
          autoComplete="username"
          inputMode="email"
        />

        <TextField
          id="reg-password"
          label="Password"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            resetErrors()
            checkMatchOnType(value, repassword)
          }}
          error={passwordError}
          hint={`Gunakan minimal ${MIN_PASSWORD_LENGTH} karakter.`}
          placeholder="Minimal 8 karakter"
          autoComplete="new-password"
        />

        <TextField
          id="reg-password-confirm"
          label="Konfirmasi Password"
          type="password"
          value={repassword}
          onChange={(value) => {
            setRepassword(value)
            resetErrors()
            checkMatchOnType(password, value)
          }}
          error={repasswordError}
          placeholder="Ulangi password di atas"
          autoComplete="new-password"
        />

        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          Dengan mendaftar, kamu menyetujui Syarat &amp; Ketentuan dan Kebijakan Privasi Kataloga.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-brand px-4 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-primary-brand/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Memproses...</span>
            </>
          ) : (
            'Daftar Sekarang'
          )}
        </button>
      </form>

      <div className="mt-5 border-t border-slate-100 pt-5 text-center">
        <p className="text-xs text-slate-500">
          Sudah punya akun?
          <Link
            to={buildHref('/login')}
            className="ml-1 font-semibold text-primary-brand transition hover:text-blue-700 hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-2 text-[11px] text-slate-400 sm:flex-row sm:gap-5">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
            verified_user
          </span>
          Data terenkripsi
        </div>
        <div className="hidden sm:block">•</div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
            storefront
          </span>
          Satu akun untuk Kataloga
        </div>
      </div>
    </AuthShell>
  )
}

export default RegisterPage