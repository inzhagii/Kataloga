import { useRef, useState } from 'react'
import SectionCard from '../products/form/SectionCard'
import { INPUT_CLASS, SELECT_CLASS, TEXTAREA_CLASS } from './formClasses'

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
 * Informasi Toko: logo, Store Name, description/bio and location (Province +
 * City/Regency). Store ID and the store link live in the separate "Store ID &
 * Link" section. Full Address and Jam Operasional live in their own separate
 * sections.
 *
 * @param {{
 *   store: import('../../../data/models.js').Store,
 *   form: object,
 *   errors: Record<string, string>,
 *   setField: (field: string, value: string) => void,
 *   children: React.ReactNode,
 *   provinces: string[],
 *   cities: string[],
 *   provincesStatus: 'loading'|'ready'|'error',
 *   citiesStatus: 'idle'|'loading'|'ready'|'error',
 *   regionsError: string,
 *   onLogoChange: (dataUrl: string) => void,
 *   onLogoRemove: () => void,
 *   onLogoError: (message: string) => void,
 * }} props
 */
function StoreInfoSection({
  store,
  form,
  errors,
  setField,
  children,
  provinces,
  cities,
  provincesStatus,
  citiesStatus,
  regionsError,
  onLogoChange,
  onLogoRemove,
  onLogoError,
}) {
  const cityError = errors.city

  return (
    <SectionCard
      icon="info"
      title="Informasi Toko"
      subtitle="Logo, nama, dan lokasi toko kamu."
      actions={children}
    >
      <div className="mt-1.5 flex flex-col gap-6">
        <LogoPicker
          logoUrl={form.logoUrl}
          error={errors.logo}
          onLogoChange={onLogoChange}
          onLogoRemove={onLogoRemove}
          onLogoError={onLogoError}
        />

        <div>
          <label
            htmlFor="store-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nama Toko
          </label>
          <input
            id="store-name"
            type="text"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder={store.name}
            className={INPUT_CLASS}
            data-error={Boolean(errors.name)}
          />
          {errors.name ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                error
              </span>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="store-description"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Deskripsi / Bio
          </label>
          <textarea
            id="store-description"
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
            placeholder="Ceritakan sedikit tentang toko kamu..."
            rows={3}
            className={TEXTAREA_CLASS}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="store-province"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Provinsi
            </label>
            <div className="relative">
              <select
                id="store-province"
                value={form.province}
                onChange={(event) => {
                  setField('province', event.target.value)
                  setField('city', '')
                }}
                className={`${SELECT_CLASS} ${form.province ? '' : 'text-outline'}`}
                data-error={Boolean(errors.province)}
              >
                <option value="">
                  {provincesStatus === 'loading' ? 'Memuat...' : 'Pilih Provinsi'}
                </option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-outline"
                aria-hidden="true"
              >
                unfold_more
              </span>
            </div>
            {errors.province ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  error
                </span>
                {errors.province}
              </p>
            ) : null}
            {provincesStatus === 'error' && regionsError ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  error
                </span>
                {regionsError}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="store-city"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Kota / Kabupaten
            </label>
            <div className="relative">
              <select
                id="store-city"
                value={form.city}
                onChange={(event) => setField('city', event.target.value)}
                disabled={!form.province || citiesStatus === 'loading'}
                className={`${SELECT_CLASS} ${form.city ? '' : 'text-outline'}`}
                data-error={Boolean(cityError)}
                aria-invalid={Boolean(cityError)}
                aria-describedby={cityError ? 'store-city-error' : undefined}
              >
                <option value="">
                  {citiesStatus === 'loading'
                    ? 'Memuat...'
                    : !form.province
                      ? 'Pilih provinsi terlebih dahulu'
                      : 'Pilih Kota/Kabupaten'}
                </option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <span
                className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-outline"
                aria-hidden="true"
              >
                unfold_more
              </span>
            </div>
            {cityError ? (
              <p
                id="store-city-error"
                className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  error
                </span>
                {cityError}
              </p>
            ) : null}
            {citiesStatus === 'error' && regionsError ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  error
                </span>
                {regionsError}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

export default StoreInfoSection