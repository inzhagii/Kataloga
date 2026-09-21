import { Link } from 'react-router-dom'

/**
 * Brand card for the Brand Management grid. Shows the brand name, its product
 * usage count and the card actions (Edit, Lihat Product, delete). No decorative
 * icon per brand (locked rule).
 *
 * @param {{
 *   brand: import('../../../data/models.js').Brand,
 *   count: number,
 *   onEdit: (brand: import('../../../data/models.js').Brand) => void,
 *   onDelete: (brand: import('../../../data/models.js').Brand) => void,
 * }} props
 */
function BrandCard({ brand, count, onEdit, onDelete }) {
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-4 shadow-sm">
      <h3 className="truncate text-sm font-bold text-on-surface" title={brand.name}>
        {brand.name}
      </h3>
      <span className="mt-1.5 inline-flex w-fit rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
        {count} {count === 1 ? 'Product' : 'Products'}
      </span>

      <div className="mt-4 flex items-center gap-1">
        <button
          type="button"
          onClick={() => onEdit(brand)}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
          aria-label={`Edit brand ${brand.name}`}
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            edit
          </span>
          Edit
        </button>
        <Link
          to={`/seller/products?brand=${brand.id}`}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary transition-colors hover:bg-primary-container"
          aria-label={`Lihat Product untuk ${brand.name}`}
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            visibility
          </span>
          Lihat Product
        </Link>
        <button
          type="button"
          onClick={() => onDelete(brand)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
          aria-label={`Hapus brand ${brand.name}`}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            delete
          </span>
        </button>
      </div>
    </div>
  )
}

export default BrandCard
