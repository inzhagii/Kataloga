import SectionCard from './SectionCard'

/**
 * Description: wajib untuk Publish. Counter 0/2000 dan error inline.
 * @param {{
 *   form: object,
 *   errors: Record<string, string>,
 *   setField: (field: string, value: unknown) => void,
 * }} props
 */
function ProductDescriptionSection({ form, errors, setField }) {
  const length = String(form.description || '').length
  const MAX_LENGTH = 2000

  return (
    <SectionCard
      icon="description"
      title="Description"
      subtitle="Gambaran lengkap, highlight utama, serta kelengkapan paket."
    >
      <label
        htmlFor="product-description"
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
      >
        Deskripsi Produk <span className="text-error">*</span>
      </label>
      <textarea
        id="product-description"
        rows={5}
        maxLength={MAX_LENGTH}
        value={form.description}
        onChange={(event) => setField('description', event.target.value)}
        placeholder="Deskripsikan produk ini, highlight utama, isi paket, dan informasi garansi..."
        className="w-full rounded-lg border border-outline-variant bg-surface p-3.5 text-sm leading-relaxed text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
        data-error={Boolean(errors.description)}
      />
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <p className="text-secondary">
          Tip: deskripsi yang rapi dan terstruktur membantu customer memahami produk.
        </p>
        <span className="text-outline">
          {length.toLocaleString('id-ID')} / {MAX_LENGTH.toLocaleString('id-ID')}
        </span>
      </div>
      {errors.description ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            error
          </span>
          {errors.description}
        </p>
      ) : null}
    </SectionCard>
  )
}

export default ProductDescriptionSection