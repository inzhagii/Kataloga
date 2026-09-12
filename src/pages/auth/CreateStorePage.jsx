import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import AuthShell from '../../components/auth/AuthShell'
import TextField from '../../components/auth/TextField'
import { useAuth } from '../../hooks/useAuth'
import { checkStoreIdAvailable, createStore } from '../../services/storeService'
import { normalizeStoreId, validateStoreId } from '../../utils/storeId'

function CreateStorePage() {
  const { user, authLoaded, attachStore } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [storeId, setStoreId] = useState('')
  const [nameError, setNameError] = useState('')
  const [storeIdError, setStoreIdError] = useState('')
  const [availability, setAvailability] = useState('idle')
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checkedValue, setCheckedValue] = useState('')

  if (!authLoaded) {
    return null
  }

  if (user.hasStore) {
    return <Navigate to="/seller/dashboard" replace />
  }

  async function checkAvailability(value) {
    const { valid } = validateStoreId(value)
    if (!valid) {
      return false
    }
    const formatted = normalizeStoreId(value)
    setAvailability('checking')
    try {
      const { available } = await checkStoreIdAvailable(formatted)
      setCheckedValue(formatted)
      if (available) {
        setAvailability('available')
        setStoreIdError('')
        return true
      }
      setAvailability('idle')
      setStoreIdError('Store ID sudah digunakan. Silakan pilih Store ID lain.')
      return false
    } catch (error) {
      setAvailability('idle')
      setStoreIdError(
        error instanceof Error ? error.message : 'Tidak dapat memeriksa ketersediaan Store ID.'
      )
      return false
    }
  }

  async function handleStoreIdBlur() {
    setGlobalError('')
    const formatted = normalizeStoreId(storeId)
    if (!formatted || formatted === checkedValue) {
      return
    }
    await checkAvailability(formatted)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setGlobalError('')

    let valid = true

    if (!name.trim()) {
      setNameError('Nama toko wajib diisi.')
      valid = false
    }

    const formattedStoreId = normalizeStoreId(storeId)
    const storeIdValidation = validateStoreId(storeId)

    if (!storeIdValidation.valid) {
      setStoreIdError(storeIdValidation.message)
      valid = false
    } else if (formattedStoreId !== checkedValue) {
      const available = await checkAvailability(formattedStoreId)
      if (!available) {
        return
      }
    }

    if (!valid) {
      return
    }

    setSubmitting(true)

    try {
      const created = await createStore({ name: name.trim(), storeId: formattedStoreId })
      attachStore(created.storeId)
      navigate('/seller/my-store', { replace: true })
    } catch (error) {
      setSubmitting(false)
      const message =
        error instanceof Error ? error.message : 'Tidak dapat terhubung ke server. Silakan coba lagi.'
      if (message.includes('sudah digunakan')) {
        setStoreIdError(message)
      } else {
        setGlobalError(message)
      }
    }
  }

  return (
    <AuthShell title="Buat Toko" subtitle="Mulai buat toko kamu di Kataloga.">
      {globalError ? (
        <div
          className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5"
          role="alert"
          aria-live="polite"
        >
          <span
            className="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-red-600"
            aria-hidden="true"
          >
            error
          </span>
          <p className="text-xs font-medium leading-relaxed text-red-800">{globalError}</p>
        </div>
      ) : null}

      <form className="flex flex-col gap-5" noValidate onSubmit={handleSubmit}>
        <TextField
          id="store-name"
          label="Nama Toko"
          type="text"
          value={name}
          onChange={(value) => {
            setName(value)
            setNameError('')
            setGlobalError('')
          }}
          error={nameError}
          hint="Nama yang ditampilkan pada halaman toko kamu."
          placeholder="Contoh: Toko Komputer Jaya"
          autoComplete="organization"
        />

        <div>
          <TextField
            id="store-id"
            label="Store ID"
            type="text"
            value={storeId}
            onChange={(value) => {
              setStoreId(value)
              setStoreIdError('')
              setAvailability('idle')
              setGlobalError('')
            }}
            onBlur={handleStoreIdBlur}
            error={storeIdError}
            hint="Store ID menjadi bagian dari URL toko kamu: kataloga.com/{storeId}"
            placeholder="Contoh: toko-komputer-jaya"
            autoComplete="off"
          />

          {availability === 'checking' ? (
            <p className="mt-1.5 px-1 text-[11px] text-slate-400" aria-live="polite">
              Mengecek ketersediaan...
            </p>
          ) : availability === 'available' ? (
            <p className="mt-1.5 px-1 text-[11px] font-medium text-green-600" aria-live="polite">
              Store ID &quot;{checkedValue}&quot; tersedia.
            </p>
          ) : null}
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-surface-container-low p-3.5 text-xs leading-relaxed text-on-surface-variant">
          <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px]" aria-hidden="true">
            info
          </span>
          <p>
            Setelah toko dibuat, kamu akan diarahkan ke My Store untuk melengkapi informasi toko.
          </p>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-brand px-4 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-primary-brand/20 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Membuat toko...</span>
              </>
            ) : (
              'Buat Toko'
            )}
          </button>
        </div>
      </form>
    </AuthShell>
  )
}

export default CreateStorePage