import SectionCard from '../products/form/SectionCard'

const INPUT_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[72px] resize-y`

const SELECT_CLASS = `${INPUT_CLASS} appearance-none pr-10 font-medium disabled:cursor-not-allowed disabled:bg-surface-container-high/50`

/**
 * Store information: name, description/bio and location. Location requires a
 * Province and a City/Regency that belongs to it; Full Address is optional.
 * Changing the province resets an incompatible city.
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
}) {
  const cityError = errors.city

  return (
    <SectionCard
      icon="info"
      title="Informasi Toko"
      subtitle="Detail yang ditampilkan pada storefront."
      actions={children}
    >
      <div className="mt-1.5 flex flex-col gap-6">
        <div>
          <label
            htmlFor="store-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nama Toko <span className="text-error">*</span>
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
            Deskripsi / Bio{' '}
            <span className="font-normal lowercase text-secondary">(opsional)</span>
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
              Provinsi <span className="text-error">*</span>
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
              Kota / Kabupaten <span className="text-error">*</span>
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

          <div>
            <label
              htmlFor="store-full-address"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Alamat Lengkap{' '}
              <span className="font-normal lowercase text-secondary">(opsional)</span>
            </label>
            <textarea
              id="store-full-address"
              value={form.fullAddress}
              onChange={(event) => setField('fullAddress', event.target.value)}
              placeholder="Contoh: Jl. Raya Merdeka No. 10, Kec. Coblong"
              rows={2}
              className={TEXTAREA_CLASS}
            />
          </div>

          <div>
            <label
              htmlFor="store-hours"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Jam Operasional{' '}
              <span className="font-normal lowercase text-secondary">(opsional)</span>
            </label>
            <input
              id="store-hours"
              type="text"
              value={form.operatingHours}
              onChange={(event) => setField('operatingHours', event.target.value)}
              placeholder="Contoh: Senin - Sabtu, 09.00 - 18.00"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

export default StoreInfoSection