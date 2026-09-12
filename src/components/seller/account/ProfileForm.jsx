import { useRef, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { normalizePhone, isValidEmail, isValidPhone } from '../../../services/authService'

const MAX_AVATAR_SIZE = 2 * 1024 * 1024

function AvatarPicker({ avatarUrl, error, onAvatarChange, onAvatarRemove }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(event) {
    const file = event.target.files && event.target.files[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith('image/')) {
      error('File harus berupa gambar (PNG, JPG, atau WebP).')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      error('Ukuran foto profil maksimal 2 MB.')
      return
    }
    setBusy(true)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Gagal membaca file.'))
        reader.readAsDataURL(file)
      })
      onAvatarChange(dataUrl)
    } catch {
      error('Gagal membaca foto profil.')
    } finally {
      setBusy(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container-low">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Foto profil" className="h-full w-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50" aria-hidden="true">
            account_circle
          </span>
        )}
      </div>
      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={() => inputRef.current && inputRef.current.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            photo_camera
          </span>
          {avatarUrl ? 'Ganti Foto' : 'Unggah Foto'}
        </button>
        {avatarUrl ? (
          <button
            type="button"
            onClick={onAvatarRemove}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-medium text-error transition-colors hover:bg-error-container"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              close
            </span>
            Hapus foto
          </button>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          aria-label="Unggah foto profil"
        />
      </div>
    </div>
  )
}

/**
 * Account profile form (name, email, phone, avatar). Loaded from the auth
 * context user; saves through AuthProvider.updateUser so the navbar/header
 * stay in sync.
 *
 * @param {{
 *   user: import('../../../data/models.js').User,
 *   onAvatarError: (message: string) => void,
 *   onSaved: () => void,
 * }} props
 */
function ProfileForm({ user, onAvatarError, onSaved }) {
  const { updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) {
        return current
      }
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function validate() {
    const next = {}
    if (form.email.trim() && !isValidEmail(form.email.trim())) {
      next.email = 'Format email tidak valid.'
    }
    if (form.phone.trim() && !isValidPhone(form.phone.trim())) {
      next.phone = 'Format nomor HP tidak valid.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!validate()) {
      return
    }
    setSaving(true)
    try {
      await updateUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() ? normalizePhone(form.phone.trim()) : '',
        avatarUrl: form.avatarUrl.trim() ? form.avatarUrl : undefined,
      })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-5 border-b border-outline-variant/30 pb-4">
        <h2 className="text-base font-bold text-on-surface">Informasi Akun Kamu</h2>
        <p className="text-xs text-secondary">Nama, email, nomor HP, dan foto profil kamu.</p>
      </div>

      <form onSubmit={handleSave} noValidate className="flex flex-col gap-5">
        <AvatarPicker
          avatarUrl={form.avatarUrl}
          error={onAvatarError}
          onAvatarChange={(dataUrl) => setField('avatarUrl', dataUrl)}
          onAvatarRemove={() => setField('avatarUrl', '')}
        />

        <div>
          <label
            htmlFor="account-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nama{' '}
            <span className="font-normal lowercase text-secondary">(opsional)</span>
          </label>
          <input
            id="account-name"
            type="text"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Nama kamu"
            className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor="account-email"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Email{' '}
            <span className="font-normal lowercase text-secondary">(opsional)</span>
          </label>
          <input
            id="account-email"
            type="email"
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
            placeholder="nama@email.com"
            className={`w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 ${
              errors.email ? 'border-error bg-error-container/30' : ''
            }`}
          />
          {errors.email ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                error
              </span>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="account-phone"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nomor HP{' '}
            <span className="font-normal lowercase text-secondary">(opsional)</span>
          </label>
          <input
            id="account-phone"
            type="tel"
            inputMode="tel"
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value)}
            placeholder="081234567890"
            className={`w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 ${
              errors.phone ? 'border-error bg-error-container/30' : ''
            }`}
          />
          {errors.phone ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                error
              </span>
              {errors.phone}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-secondary">
              Dipakai untuk login. Format lokal atau internasional (62) diterima.
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              save
            </span>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ProfileForm