import { useState } from 'react'

/**
 * Number of attribute rows shown before the "Lihat selengkapnya" toggle kicks
 * in. Content-based (row count) collapse so short detail blocks stay fully
 * visible.
 */
const DETAILS_PREVIEW_COUNT = 5

/**
 * "Detail Produk" card: product detail attributes as clean label/value rows,
 * collapsed to a short preview by default. Long lists (more than
 * DETAILS_PREVIEW_COUNT rows) show a "Lihat selengkapnya" / "Tutup" toggle;
 * expanded shows every row. Category is deliberately NOT repeated here — it is
 * shown next to Condition under the price in ProductInfo. Renders available
 * details without inventing values.
 */
function ProductDetailsSection({ product }) {
  const [expanded, setExpanded] = useState(false)
  const details = product.details ?? []
  const isLong = details.length > DETAILS_PREVIEW_COUNT
  const visibleDetails = isLong && !expanded ? details.slice(0, DETAILS_PREVIEW_COUNT) : details

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-1 flex items-center gap-2 border-b border-surface-container pb-3">
        <span className="material-symbols-outlined text-[21px] text-primary" aria-hidden="true">
          tune
        </span>
        <h2 className="text-lg font-bold text-on-surface">Detail Produk</h2>
      </div>

      <div className="flex flex-col">
        {visibleDetails.length > 0 ? (
          visibleDetails.map((item, index) => (
            <div
              key={`${item.label}-${item.value}`}
              className={`flex items-start justify-between gap-4 py-3 ${
                index < visibleDetails.length - 1 ? 'border-b border-surface-container-low' : ''
              }`}
            >
              <span className="text-xs text-secondary">{item.label}</span>
              <span className="text-right text-xs font-semibold text-on-surface sm:text-sm">{item.value}</span>
            </div>
          ))
        ) : (
          <p className="py-3 text-xs text-secondary">Belum ada detail produk.</p>
        )}
      </div>

      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-blue-700"
        >
          {expanded ? 'Tutup' : 'Lihat selengkapnya'}
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      ) : null}
    </section>
  )
}

export default ProductDetailsSection