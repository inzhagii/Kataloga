import ProductGallery from '../../storefront/ProductGallery'
import ProductDetailsSection from '../../storefront/ProductDetailsSection'
import { ProductStatusBadge } from './ProductBadges'
import { formatPrice } from '../../../utils/price'
import { CONDITION } from '../../../constants/enums'

const CONDITION_LABEL = { [CONDITION.NEW]: 'New', [CONDITION.SECOND]: 'Second' }

/**
 * Read-only internal product detail view, used on the Archive page when the
 * seller clicks "Detail Product". Shows all product information without any
 * customer-facing actions (no WhatsApp/Marketplace/Share, no Edit/Save).
 * Reached only via the archived products list, not from the public storefront.
 */
function ArchivedProductDetail({ product, storeName, onBack }) {
  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            arrow_back
          </span>
          Kembali
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-2">
          <ProductGallery product={product} storeName={storeName} />
        </div>

        <div className="lg:col-span-3 lg:pt-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-start gap-3">
              <ProductStatusBadge status={product.status} />
              {product.brand ? (
                <span className="text-sm font-semibold text-on-surface">
                  Brand : {product.brand}
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
              {product.name}
            </h1>

            <p className="text-xl font-bold text-on-surface">{formatPrice(product.priceValue)}</p>

            <div className="flex items-center gap-3 text-sm text-secondary">
              <span>{product.category}</span>
              <span aria-hidden="true">•</span>
              <span>{CONDITION_LABEL[product.condition] || product.condition}</span>
            </div>

            {product.description ? (
              <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6">
                <div className="mb-2 flex items-center gap-2 border-b border-surface-container pb-3">
                  <span className="material-symbols-outlined text-[21px] text-primary" aria-hidden="true">
                    description
                  </span>
                  <h2 className="text-lg font-bold text-on-surface">Deskripsi</h2>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
                  {product.description}
                </p>
              </div>
            ) : null}

            <ProductDetailsSection product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArchivedProductDetail