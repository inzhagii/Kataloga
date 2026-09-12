import { Link } from 'react-router-dom'
import ProductThumb from './ProductThumb'
import ProductRowMenu from './ProductRowMenu'
import { ProductStatusBadge, FeaturedTag } from './ProductBadges'
import { formatPrice } from '../../../utils/price'

const CONDITION_LABEL = { NEW: 'New', SECOND: 'Second' }

/**
 * Desktop/tablet table view of the seller product list (md+).
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
function ProductTable({
  products,
  onPublish,
  onToggleFeatured,
  onArchive,
  onMarkSoldOut,
  onReactivate,
  onRestore,
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-outline-variant/50 bg-surface-container-low/50 text-xs font-semibold uppercase tracking-wider text-outline">
          <tr>
            <th scope="col" className="px-4 py-3.5">
              Produk
            </th>
            <th scope="col" className="px-4 py-3.5">
              Kategori
            </th>
            <th scope="col" className="px-4 py-3.5">
              Status
            </th>
            <th scope="col" className="px-5 py-3.5 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/30 text-sm">
          {products.map((product) => (
            <tr key={product.id} className="transition-colors hover:bg-surface-container-low/50">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <ProductThumb
                    image={product.mainImage || product.images?.[0]}
                    alt={product.name}
                    className="h-11 w-11 rounded-xl"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/seller/products/${product.id}/edit`}
                        className="block max-w-[240px] truncate font-bold text-on-surface transition-colors hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      {product.featured ? <FeaturedTag /> : null}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">
                        {formatPrice(product.priceValue)}
                      </span>
                      <span className="text-[11px] text-outline">
                        • {CONDITION_LABEL[product.condition] || product.condition}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className="inline-block rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-on-surface">
                  {product.category}
                </span>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <ProductStatusBadge status={product.status} />
                </div>
              </td>
              <td className="px-5 py-3.5 text-right">
                <ProductRowMenu
                  product={product}
                  onPublish={onPublish}
                  onToggleFeatured={onToggleFeatured}
                  onArchive={onArchive}
                  onMarkSoldOut={onMarkSoldOut}
                  onReactivate={onReactivate}
                  onRestore={onRestore}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable