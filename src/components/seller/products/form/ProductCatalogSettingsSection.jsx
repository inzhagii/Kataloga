import SectionCard from './SectionCard'

/**
 * Catalog Settings: featured flag only. No stock/quantity settings on V1.
 * @param {{
 *   form: object,
 *   setField: (field: string, value: unknown) => void,
 * }} props
 */
function ProductCatalogSettingsSection({ form, setField }) {
  return (
    <SectionCard
      icon="settings"
      title="Pengaturan Katalog"
      subtitle="Preferensi tampilan storefront dan sorotan produk."
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border border-outline-variant/40 bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-amber-50 text-amber-600">
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              grade
            </span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Featured Product</p>
            <p className="mt-0.5 text-xs text-secondary">
              Produk unggulan dapat tampil menonjol di katalog toko kamu.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.featured}
          onClick={() => setField('featured', !form.featured)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            form.featured ? 'bg-primary' : 'bg-outline-variant/60'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              form.featured ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </SectionCard>
  )
}

export default ProductCatalogSettingsSection