import { Link } from 'react-router-dom'
import ProductThumb from './ProductThumb'
import ProductRowMenu from './ProductRowMenu'
import { ProductStatusBadge, FeaturedTag } from './ProductBadges'
import { formatPrice } from '../../../utils/price'

const CONDITION_LABEL = { NEW: 'New', SECOND: 'Second' }

/**
 * Mobile card list view of the seller product list (only below md).
 * @param {{
 *   products: import('../../../data/models.js').Product[],
 *   onPublish: (product: import('../../../data/models.js').Product) => void,
 *   onToggleFeatured: (product: import('../../../data/models.js').Product) => void,
 *   onArchive: (product: import('../../../data/models.js').Product) => void,
 *   onMarkSoldOut: (product: import('../../../data/models.js').Product) => void,
 *   onReactivate: (product: import('../../../data/models.js').Product) => void,
 *   onRestore: (product: import('../../../data/models.js').Product) => void,
 * }} props
 */
function ProductCardList({
  products,
  onPublish,
  onToggleFeatured,
  onArchive,
  onMarkSoldOut,
  onReactivate,
  onRestore,
}) {
  return (
    <div className="space-y-3 bg-surface-container-low/40 p-3.5 md:hidden">
      {products.map((product) => (
        <div
          key={product.id}
          className="relative rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3.5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-3">
              <ProductThumb
                image={product.mainImage || product.images?.[0]}
                alt={product.name}
                className="h-12 w-12 rounded-xl"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/seller/products/${product.id}/edit`}
                    className="block truncate text-sm font-bold text-on-surface hover:text-primary"
                  >
                    {product.name}
                  </Link>
                  {product.featured ? <FeaturedTag /> : null}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded bg-surface-container-low px-2 py-0.5 text-[10px] font-semibold text-on-surface">
                    {product.category}
                  </span>
                  <span className="text-[11px] text-outline">
                    • {CONDITION_LABEL[product.condition] || product.condition}
                  </span>
                </div>
              </div>
            </div>
            <ProductRowMenu
              product={product}
              onPublish={onPublish}
              onToggleFeatured={onToggleFeatured}
              onArchive={onArchive}
              onMarkSoldOut={onMarkSoldOut}
              onReactivate={onReactivate}
              onRestore={onRestore}
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-outline-variant/30 pt-2.5">
            <span className="text-sm font-bold text-primary">
              {formatPrice(product.priceValue)}
            </span>
            <div className="flex items-center gap-2">
              <ProductStatusBadge status={product.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductCardList