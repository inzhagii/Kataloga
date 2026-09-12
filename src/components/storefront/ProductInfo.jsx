import { CONDITION } from '../../constants/enums'
import ProductActions from './ProductActions'

/**
 * Product information card: chips (brand/category/condition), name, prominent
 * price and the action buttons. Hierarchy: name > price; supporting details
 * stay secondary. No availability display on the product detail.
 */
function ProductInfo({ product, store, onWhatsApp, onSelectChannel, onShare }) {
  const conditionLabel = product.condition === CONDITION.SECOND ? 'Second' : 'New'

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6 lg:p-7">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {product.brand ? (
          <span className="rounded-lg bg-surface-container px-2.5 py-1 text-[10px] font-semibold text-on-surface sm:text-[11px]">
            {product.brand}
          </span>
        ) : null}
        <span className="rounded-lg bg-surface-container px-2.5 py-1 text-[10px] font-semibold text-secondary sm:text-[11px]">
          {product.category}
        </span>
        <span className="rounded-lg bg-surface-container px-2.5 py-1 text-[10px] font-semibold text-secondary sm:text-[11px]">
          {conditionLabel}
        </span>
      </div>

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

      <ProductActions
        store={store}
        onWhatsApp={onWhatsApp}
        onSelectChannel={onSelectChannel}
        onShare={onShare}
      />
    </div>
  )
}

export default ProductInfo