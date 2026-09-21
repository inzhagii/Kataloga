/**
 * "Detail Produk" card: product detail attributes as clean label/value rows.
 * Category is deliberately NOT repeated here — it is shown next to Condition
 * under the price in ProductInfo. Renders available details without inventing
 * values.
 */
function ProductDetailsSection({ product }) {
  const details = product.details ?? []

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-1 flex items-center gap-2 border-b border-surface-container pb-3">
        <span className="material-symbols-outlined text-[21px] text-primary" aria-hidden="true">
          tune
        </span>
        <h2 className="text-lg font-bold text-on-surface">Detail Produk</h2>
      </div>

      <div className="flex flex-col">
        {details.length > 0 ? (
          details.map((item, index) => (
            <div
              key={`${item.label}-${item.value}`}
              className={`flex items-start justify-between gap-4 py-3 ${
                index < details.length - 1 ? 'border-b border-surface-container-low' : ''
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
    </section>
  )
}

export default ProductDetailsSection