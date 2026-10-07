import { Link } from 'react-router-dom'

/**
 * The single "Archive" access on the Seller Products page. Archive is a
 * navigation item (not a status tab) and is intentionally absent from the
 * sidebar and the mobile bottom navigation. Rendered exactly once per
 * breakpoint: desktop right-aligned in the StatusTabs row, mobile beside
 * Filter in the ProductsToolbar (responsive classes passed via className).
 * It links to the existing Archived Products route; no second archive page is
 * created.
 * @param {{ count: number, className?: string }} props
 */
function ArchivedProductsLink({ count, className = '' }) {
  return (
    <Link
      to="/seller/products/archived"
      className={`inline-flex shrink-0 items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:border-outline ${className}`}
    >
      <span className="material-symbols-outlined text-[16px] text-outline" aria-hidden="true">
        archive
      </span>
      Archive
      <span className="rounded-full bg-surface-container px-2 py-0.5 text-xs font-semibold text-secondary">
        {count}
      </span>
    </Link>
  )
}

export default ArchivedProductsLink
