import SectionCard from './SectionCard'
import { getRecommendedDetails } from '../../../../constants/productDetails'

const FIELD_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20'

/**
 * Product Details: hybrid approach combining recommended attributes for the
 * selected category with seller-added custom attributes.
 * @param {{
 *   form: object,
 *   errors: Record<string, string>,
 *   addDetail: (label?: string) => void,
 *   updateDetail: (index: number, patch: object) => void,
 *   removeDetail: (index: number) => void,
 * }} props
 */
function ProductDetailsSection({ form, errors, addDetail, updateDetail, removeDetail }) {
  const details = form.details || []
  const recommended = getRecommendedDetails(form.category)
  const availableRecommended = recommended.filter(
    (label) =>
      !details.some(
        (detail) =>
          String(detail.label).trim().toLowerCase() === String(label).toLowerCase(),
      ),
  )

  return (
    <SectionCard
      icon="tune"
      title="Detail Produk"
      subtitle="Spesifikasi yang membantu customer memahami produk ini."
      actions={
        <button
          type="button"
          onClick={() => addDetail('')}
          className="inline-flex items-center gap-1 rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-blue-50"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add
          </span>
          + Tambah Detail Kustom
        </button>
      }
    >
      {form.category ? (
        <div className="mb-5 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4">
          <div className="mb-2.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">
              auto_awesome
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Detail yang Direkomendasikan untuk {form.category}
            </span>
          </div>
          {availableRecommended.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableRecommended.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => addDetail(label)}
                  className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface transition-all hover:border-primary hover:text-primary"
                >
                  + {label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary">
              Semua rekomendasi sudah ditambahkan atau kamu bisa menambah detail kustom.
            </p>
          )}
        </div>
      ) : null}

      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">
        Spesifikasi Produk
      </p>
      <div className="flex flex-col gap-3" data-error={Boolean(errors.details)}>
        {details.length === 0 ? (
          <p className="text-sm text-secondary">
            {form.category
              ? 'Belum ada detail. Pilih dari rekomendasi kategori atau tambah detail kustom.'
              : 'Pilih kategori terlebih dahulu untuk melihat detail yang direkomendasikan.'}
          </p>
        ) : (
          details.map((detail, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-outline-variant/60 bg-surface-container-lowest p-3 sm:flex-row sm:items-center"
            >
              <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-40">
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={detail.label}
                  onChange={(event) => updateDetail(index, { label: event.target.value })}
                  placeholder="Nama detail (misal: RAM)"
                  className={`${FIELD_CLASS} font-bold`}
                  aria-label={`Nama detail ${index + 1}`}
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={detail.value}
                  onChange={(event) => updateDetail(index, { value: event.target.value })}
                  placeholder="Nilai (misal: 16 GB)"
                  className={FIELD_CLASS}
                  aria-label={`Nilai detail ${index + 1}`}
                />
              </div>
              <div className="flex justify-end sm:justify-start">
                <button
                  type="button"
                  onClick={() => removeDetail(index)}
                  className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-error-container hover:text-error"
                  aria-label={`Hapus detail ${index + 1}`}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {errors.details ? (
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-error">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            error
          </span>
          {errors.details}
        </p>
      ) : null}
    </SectionCard>
  )
}

export default ProductDetailsSection