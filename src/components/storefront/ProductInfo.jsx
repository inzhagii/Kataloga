import { CONDITION, PRODUCT_STATUS } from '../../constants/enums'
import ProductActions from './ProductActions'

/**
 * Product information card. Hierarchy follows docs/PRODUCT.md: Brand
 * (top-left, if available) > Product Unggulan (top-right, if featured) >
 * Product Name > Price (bold) > Category + Condition side-by-side. The
 * category/condition row sits below the price and is not repeated in the
 * Product Details card. Actions are CTA (primary) + Share (secondary) — no
 * WhatsApp, no Marketplace on Product Detail. For SOLD_OUT products only Share
 * stays available.
 */
function ProductInfo({ product, onSelectDestination, onShare }) {
  const conditionLabel = product.condition === CONDITION.SECOND ? 'Second' : 'New'
  const isSoldOut = product.status === PRODUCT_STATUS.SOLD_OUT

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6 lg:p-7">
      {product.brand || product.featured ? (
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand ? (
              <span className="text-xs font-semibold text-on-surface sm:text-sm">
                Brand : {product.brand}
              </span>
            ) : null}
          </div>

          {product.featured ? (
            <span
              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 ring-1 ring-amber-200 sm:text-[11px]"
              role="img"
              aria-label="Product Unggulan"
              title="Product Unggulan"
            >
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                star
              </span>
              Product Unggulan
            </span>
          ) : null}
        </div>
      ) : null}

      <h1 className="text-2xl font-bold leading-tight tracking-tight text-on-surface sm:text-3xl lg:text-[32px]">
        {product.name}
      </h1>

      <div className="mt-5 rounded-xl bg-surface-container-low p-4 sm:p-5">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-secondary sm:text-[11px]">
          Harga
        </span>
        <span className="block text-2xl font-bold leading-tight tracking-tight text-primary sm:text-[30px]">
          {product.price}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-surface-container px-2.5 py-1 text-[10px] font-semibold text-secondary sm:text-[11px]">
          {product.category}
        </span>
        <span
          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:text-[11px] ${
            conditionLabel === 'New'
              ? 'bg-primary text-on-primary'
              : 'bg-secondary text-on-secondary'
          }`}
        >
          {conditionLabel}
        </span>
      </div>

      {isSoldOut ? (
        <div className="mt-5 flex items-center gap-2.5 rounded-lg border border-outline-variant/60 bg-surface-container px-4 py-3">
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant" aria-hidden="true">
            block
          </span>
          <div className="text-left">
            <p className="text-sm font-bold text-on-surface">Sold Out</p>
            <p className="text-xs text-on-surface-variant">
              Produk ini sedang Sold Out. Bagikan untuk tetap menyimpan referensi.
            </p>
          </div>
        </div>
      ) : null}

      <ProductActions product={product} onSelectDestination={onSelectDestination} onShare={onShare} />
    </div>
  )
}

export default ProductInfo