import SectionCard from './SectionCard'
import { CTA_ICONS, ctaTypeLabel, withDefaultCtaOptions } from '../../../../constants/cta'
import { CTA_TYPE } from '../../../../constants/enums'

/**
 * Product CTA selector (docs/PRODUCT.md §16/§23). The product selects ONE CTA
 * option from the store's CTA options (Store CTA Options, managed in My
 * Store). It never creates a new CTA definition and never offers "no CTA":
 * every product always carries exactly one selection, defaulting to the
 * store's BUY ("Beli") option.
 *
 * The store's CUSTOM options are listed with their configured label; the
 * CUSTOM build/label editing lives in My Store, not here.
 *
 * @param {{
 *   form: object,
 *   setField: (field: string, value: unknown) => void,
 *   options: import('../../../../data/models.js').CTAOption[],
 * }} props
 */
function ProductCTASelector({ form, setField, options = [] }) {
  const list = withDefaultCtaOptions(options)
  const cta = form.cta ?? null

  function select(option) {
    setField('cta', { type: option.type, label: option.label })
  }

  function isSelected(option) {
    if (!cta?.type) {
      return option.type === CTA_TYPE.BUY
    }
    if (cta.type !== option.type) {
      return false
    }
    // CUSTOM options are distinguished by label (several may exist).
    if (option.type === CTA_TYPE.CUSTOM) {
      return (cta.label ?? '').toLowerCase() === (option.label ?? '').toLowerCase()
    }
    return true
  }

  return (
    <SectionCard
      icon="ads_click"
      title="Product CTA"
      subtitle="Tombol aksi utama di halaman produk, dipilih dari opsi CTA toko kamu (default: Beli)."
    >
      <div className="flex flex-col gap-3">
        <p className="text-[11px] text-secondary">
          Kelola daftar opsi (tambah/hapus opsi Custom) di My Store &rarr; Product CTA Options.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {list.map((option) => {
            const selected = isSelected(option)
            return (
              <button
                key={`${option.type}-${option.label}`}
                type="button"
                onClick={() => select(option)}
                className={ctaButtonClass(selected)}
                aria-pressed={selected}
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  {CTA_ICONS[option.type]}
                </span>
                <span className="text-xs font-bold">{ctaTypeLabel(option.type, option.label)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}

function ctaButtonClass(selected) {
  return `inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 transition-colors ${
    selected
      ? 'border-primary/40 bg-primary/10 text-primary'
      : 'border-outline-variant/40 bg-surface text-on-surface hover:bg-surface-container'
  }`
}

export default ProductCTASelector