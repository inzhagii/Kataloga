import { useRef, useState } from 'react'
import SectionCard from '../products/form/SectionCard'
import StoreIdField from './StoreIdField'

const MAX_LOGO_SIZE = 2 * 1024 * 1024

function LogoPicker({ logoUrl, error, onLogoChange, onLogoRemove, onLogoError }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(event) {
    const file = event.target.files && event.target.files[0]
    if (!file) {
      return
    }
    onLogoError('')
    if (!file.type.startsWith('image/')) {
      onLogoError('File harus berupa gambar (PNG, JPG, atau WebP).')
      return
    }
    if (file.size > MAX_LOGO_SIZE) {
      onLogoError('Ukuran logo maksimal 2 MB.')
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
      onLogoChange(dataUrl)
    } catch (readError) {
      onLogoError(readError instanceof Error ? readError.message : 'Gagal membaca logo.')
    } finally {
      setBusy(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface">
        Logo Toko
      </span>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo toko" className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[28px] text-on-surface-variant/50" aria-hidden="true">
              storefront
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
              photo_library
            </span>
            {logoUrl ? 'Ganti Logo' : 'Unggah Logo'}
          </button>
          {logoUrl ? (
            <button
              type="button"
              onClick={onLogoRemove}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-medium text-error transition-colors hover:bg-error-container"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                close
              </span>
              Hapus logo
            </button>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            aria-label="Unggah logo toko"
          />
        </div>
      </div>
      <p className="mt-2 text-[11px] text-secondary">PNG, JPG, atau WebP maksimal 2 MB.</p>
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-error">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            error
          </span>
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Store identity: Store ID (with 30-day cooldown + availability check) and
 * the store logo. Saving the Store ID here propagates to products, custom
 * categories and the account user via storeService.
 *
 * @param {{
 *   form: { storeId: string, logoUrl?: string },
 *   savedStoreId: string,
 *   errors: Record<string, string>,
 *   availability: 'idle'|'checking'|'available'|'taken',
 *   cooldown: { locked: boolean, nextChangeLabel: string },
 *   onStoreIdChange: (value: string) => void,
 *   onStoreIdBlur: () => void,
 *   onLogoChange: (dataUrl: string) => void,
 *   onLogoRemove: () => void,
 *   onLogoError: (message: string) => void,
 *   children: React.ReactNode,
 * }} props
 */
function StoreIdentitySection({
  form,
  savedStoreId,
  errors,
  availability,
  cooldown,
  onStoreIdChange,
  onStoreIdBlur,
  onLogoChange,
  onLogoRemove,
  onLogoError,
  children,
}) {
  return (
    <SectionCard
      icon="storefront"
      title="Identitas Toko"
      subtitle="Store ID adalah alamat publik toko kamu."
      actions={children}
    >
      <div className="mt-1.5 flex flex-col gap-6">
        <StoreIdField
          storeId={form.storeId}
          savedStoreId={savedStoreId}
          error={errors.storeId}
          availability={availability}
          cooldown={cooldown}
          onChange={onStoreIdChange}
          onBlur={onStoreIdBlur}
        />
        <LogoPicker
          logoUrl={form.logoUrl}
          error={errors.logo}
          onLogoChange={onLogoChange}
          onLogoRemove={onLogoRemove}
          onLogoError={onLogoError}
        />
      </div>
    </SectionCard>
  )
}

export default StoreIdentitySection