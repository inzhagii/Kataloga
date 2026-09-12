import SectionCard from './SectionCard'
import { CONDITION } from '../../../../constants/enums'

const RADIO_BASE =
  'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all'

/**
 * Condition & Price: strict New/Second and the product price.
 * No stock/availability fields on V1.
 * @param {{
 *   form: object,
 *   errors: Record<string, string>,
 *   setField: (field: string, value: unknown) => void,
 *   setPrice: (input: string) => void,
 * }} props
 */
function ProductConditionSection({ form, errors, setField, setPrice }) {
  const conditionOptions = [
    { value: CONDITION.NEW, label: 'New', sub: 'Baru / segel' },
    { value: CONDITION.SECOND, label: 'Second', sub: 'Bekas berkualitas' },
  ]

  return (
    <SectionCard
      icon="verified"
      title="Kondisi & Harga"
      subtitle="Kondisi barang dan harga produk."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface">
            Kondisi <span className="text-error">*</span>
          </span>
          <div className="grid grid-cols-2 gap-3">
            {conditionOptions.map((option) => (
              <label
                key={option.value}
                className={`${RADIO_BASE} ${
                  form.condition === option.value
                    ? 'border-primary bg-surface-container-low'
                    : 'border-outline-variant bg-surface-container-lowest hover:border-outline'
                }`}
              >
                <input
                  type="radio"
                  name="product-condition"
                  value={option.value}
                  checked={form.condition === option.value}
                  onChange={() => setField('condition', option.value)}
                  className="h-4 w-4 accent-primary"
                />
                <div>
                  <p className="text-xs font-bold text-on-surface">{option.label}</p>
                  <p className="text-[11px] text-secondary">{option.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="product-price"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Harga <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="pointer-events-none absolute left-3.5 text-xs font-bold text-secondary">
              Rp
            </span>
            <input
              id="product-price"
              type="text"
              inputMode="numeric"
              value={form.priceInput}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-11 pr-3.5 text-sm font-semibold text-on-surface transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
              data-error={Boolean(errors.price)}
            />
          </div>
          <p className="mt-1 text-xs text-outline">
            Contoh: Rp 12.850.000 — masukkan angka saja, otomatis diformat.
          </p>
          {errors.price ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                error
              </span>
              {errors.price}
            </p>
          ) : null}
        </div>
      </div>
    </SectionCard>
  )
}

export default ProductConditionSection