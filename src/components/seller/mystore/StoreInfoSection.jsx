import SectionCard from '../products/form/SectionCard'

const INPUT_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-24 resize-y`

/**
 * Store information: name, description/bio, city and single-line operating
 * hours. Optional fields can be left empty and shown as-is on the storefront.
 *
 * @param {{
 *   store: import('../../../data/models.js').Store,
 *   form: object,
 *   errors: Record<string, string>,
 *   setField: (field: string, value: string) => void,
 *   children: React.ReactNode,
 * }} props
 */
function StoreInfoSection({ store, form, errors, setField, children }) {
  return (
    <SectionCard
      icon="info"
      title="Informasi Toko"
      subtitle="Detail yang ditampilkan pada storefront."
      actions={children}
    >
      <div className="flex flex-col gap-5">
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="store-city"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Kota{' '}
              <span className="font-normal lowercase text-secondary">(opsional)</span>
            </label>
            <input
              id="store-city"
              type="text"
              value={form.city}
              onChange={(event) => setField('city', event.target.value)}
              placeholder="Contoh: Jakarta"
              className={INPUT_CLASS}
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