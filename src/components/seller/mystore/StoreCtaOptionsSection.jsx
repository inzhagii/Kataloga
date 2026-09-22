import { useState } from 'react'
import SectionCard from '../products/form/SectionCard'
import CtaOptionModal from './CtaOptionModal'
import { CTA_ICONS, ctaTypeLabel, withDefaultCtaOptions } from '../../../constants/cta'
import { CTA_TYPE } from '../../../constants/enums'

/**
 * Store CTA Options (My Store). Shows the store's reusable CTA option list:
 * option type + configured label. The permanent BUY ("Beli") and BARGAIN
 * ("Tawar") defaults always render and have no delete control. CUSTOM options
 * carry a seller-defined label and can be removed. A store with no CTA options
 * still gets the defaults. Adding a CUSTOM option uses the modal/bottom-sheet
 * pattern (never a dropdown).
 *
 * The section is a draft editor: it reports changes upward via onOptionsChange
 * and does not persist anything itself — the My Store Save flow owns commits
 * (docs/UI_RULES.md Store CTA Options).
 *
 * @param {{
 *   options: import('../../../data/models.js').CTAOption[],
 *   onOptionsChange: (options: import('../../../data/models.js').CTAOption[]) => void,
 *   children: React.ReactNode,
 * }} props
 */
function StoreCtaOptionsSection({ options, onOptionsChange, children }) {
  const [adding, setAdding] = useState(false)

  const list = withDefaultCtaOptions(options)
  const customs = list.filter((option) => option.type === CTA_TYPE.CUSTOM)

  function handleAdd(label) {
    onOptionsChange([...list, { type: CTA_TYPE.CUSTOM, label }])
    setAdding(false)
  }

  function handleRemove(label) {
    onOptionsChange(list.filter((option) => !(option.type === CTA_TYPE.CUSTOM && option.label === label)))
  }

  return (
    <SectionCard
      icon="ads_click"
      title="Product CTA Options"
      subtitle="Opsi tombol aksi utama yang bisa dipilih setiap produk."
      actions={children}
    >
      <div className="mt-1.5 flex flex-col gap-4">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-on-surface">
            Opsi CTA{' '}
            <span className="font-normal lowercase text-secondary">(Default tidak dapat dihapus)</span>
          </span>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              add
            </span>
            Tambah Opsi
          </button>
        </div>

        <p className="-mt-2 text-[11px] leading-relaxed text-secondary">
          Tombol aksi utama di halaman produk, dipilih dari daftar ini. Product menyeleksi satu
          opsi — kamu tidak membuat CTA baru pada form produk.
        </p>

        <ul className="space-y-2">
          {list.map((option) => {
            const isCustom = option.type === CTA_TYPE.CUSTOM
            return (
              <li
                key={`${option.type}-${option.label}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/40 bg-surface px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isCustom ? 'bg-secondary-container/50 text-secondary' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      {CTA_ICONS[option.type]}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {ctaTypeLabel(option.type, option.label)}
                    </p>
                    <p className="text-[11px] text-secondary">
                      {isCustom ? 'Custom' : option.type} — dipilih produk
                    </p>
                  </div>
                </div>

                {isCustom ? (
                  <button
                    type="button"
                    onClick={() => handleRemove(option.label)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-error-container hover:text-error"
                    aria-label={`Hapus opsi CTA ${ctaTypeLabel(option.type, option.label)}`}
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      delete
                    </span>
                  </button>
                ) : (
                  <span className="shrink-0 rounded-md bg-surface-container-high px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                    Default
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <CtaOptionModal
        open={adding}
        existingLabels={customs.map((option) => option.label)}
        onClose={() => setAdding(false)}
        onAdd={handleAdd}
      />
    </SectionCard>
  )
}

export default StoreCtaOptionsSection