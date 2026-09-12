import { useNavigate } from 'react-router-dom'
import { CONDITION } from '../../constants/enums'

/**
 * Public product card used on the Store Landing (grid + featured tracks).
 * Shows condition badge, image, name, category, price, "Lihat Detail" and a
 * share action. Does NOT show brand, WhatsApp or marketplace actions, and has
 * no availability/sold-out state (the active catalog only contains PUBLISHED).
 */
function ProductCard({ product, storeId, storeName, variant = 'grid', onShare }) {
  const navigate = useNavigate()
  const conditionLabel = product.condition === CONDITION.SECOND ? 'SECOND' : 'NEW'
  const detailUrl = `/${storeId}/products/${product.id}`

  function handleShare(event) {
    event.stopPropagation()
    if (onShare) {
      onShare(product)
    }
  }

  function handleDetail() {
    navigate(detailUrl)
  }

  const containerClasses =
    variant === 'featured'
      ? 'min-w-[240px] max-w-[260px] snap-start'
      : ''

  return (
    <article
      className={`flex h-full flex-col justify-between rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-3 shadow-sm transition-all duration-200 hover:shadow-md sm:p-4 ${containerClasses}`}
    >
      <button
        type="button"
        onClick={handleDetail}
        className="group/text relative block w-full cursor-pointer text-left focus:outline-none"
        aria-label={`Lihat detail ${product.name}`}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-container-low">
          <span
            className={`absolute left-3 top-3 z-20 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${
              conditionLabel === 'NEW' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
            }`}
          >
            {conditionLabel}
          </span>

          <img
            src={product.mainImage ?? product.images?.[0]}
            alt={`Foto ${product.name} — ${storeName ?? 'Toko Kataloga'}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover/text:scale-105"
          />
        </div>
      </button>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col pt-3 sm:pt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {product.category}
          </span>
          <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-on-surface">
            {product.name}
          </h3>
        </div>
        <div className="mt-3 pt-1 sm:mt-4">
          <p className="text-lg font-extrabold leading-tight tracking-tight text-on-surface">
            {product.price}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-outline-variant/20 pt-3 sm:mt-4">
        <button
          type="button"
          onClick={handleDetail}
          className="flex-1 rounded-lg bg-primary py-2 text-center text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700 sm:py-2.5 sm:text-sm"
        >
          Lihat Detail
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant transition-colors hover:text-primary sm:h-9 sm:w-9"
          title="Bagikan produk"
          aria-label={`Bagikan produk ${product.name}`}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            share
          </span>
        </button>
      </div>
    </article>
  )
}

export default ProductCard