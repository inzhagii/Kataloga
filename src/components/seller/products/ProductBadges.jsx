import { PRODUCT_STATUS } from '../../../constants/enums'

/**
 * Status pill: Published / Draft / Sold Out / Archived.
 * @param {{ status: string }} props
 */
export function ProductStatusBadge({ status }) {
  const styles = {
    [PRODUCT_STATUS.PUBLISHED]: {
      chip: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      dot: 'bg-emerald-500',
      label: 'Published',
    },
    [PRODUCT_STATUS.DRAFT]: {
      chip: 'border-amber-200 bg-amber-50 text-amber-700',
      dot: 'bg-amber-500',
      label: 'Draft',
    },
    [PRODUCT_STATUS.SOLD_OUT]: {
      chip: 'border-rose-200 bg-rose-50 text-rose-700',
      dot: 'bg-rose-500',
      label: 'Sold Out',
    },
    [PRODUCT_STATUS.ARCHIVED]: {
      chip: 'border-outline-variant bg-surface-container-low text-secondary',
      dot: 'bg-outline',
      label: 'Archived',
    },
  }
  const style = styles[status] || styles[PRODUCT_STATUS.DRAFT]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  )
}

/**
 * Featured tag shown on the product name row.
 */
export function FeaturedTag() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
      <span aria-hidden="true">★</span> Featured
    </span>
  )
}