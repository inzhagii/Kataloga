/**
 * Presentation metadata for Recent Activity types, shared by the timeline
 * list (icon anchors, labels, tint) and the /seller/activities filter bar.
 * Only the seven canonical types exist; anything else is filtered before
 * rendering (threats: legacy/mock records with non-canonical types).
 */

import { ACTIVITY_TYPE } from '../../../constants/enums'
import { ACTIVITY_TYPE_ORDER } from '../../../utils/recentActivityFilter'

export const ACTIVITY_META = {
  [ACTIVITY_TYPE.PRODUCT_PUBLISHED]: {
    label: 'Produk dipublikasi',
    icon: 'publish',
    tint: 'bg-primary/10 text-primary ring-primary/10',
  },
  [ACTIVITY_TYPE.PRODUCT_EDITED]: {
    label: 'Produk diperbarui',
    icon: 'edit_note',
    tint: 'bg-amber-500/10 text-amber-700 ring-amber-500/10',
  },
  [ACTIVITY_TYPE.PRODUCT_SOLD_OUT]: {
    label: 'Produk Sold Out',
    icon: 'sell',
    tint: 'bg-red-500/10 text-red-600 ring-red-500/10',
  },
  [ACTIVITY_TYPE.PRODUCT_REACTIVATED]: {
    label: 'Produk diaktifkan kembali',
    icon: 'refresh',
    tint: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/10',
  },
  [ACTIVITY_TYPE.PRODUCT_ARCHIVED]: {
    label: 'Produk diarsipkan',
    icon: 'archive',
    tint: 'bg-slate-400/10 text-slate-600 ring-slate-400/10',
  },
  [ACTIVITY_TYPE.PRODUCT_RESTORED]: {
    label: 'Produk direstore ke draft',
    icon: 'unarchive',
    tint: 'bg-sky-500/10 text-sky-700 ring-sky-500/10',
  },
  [ACTIVITY_TYPE.STORE_UPDATED]: {
    label: 'Informasi toko diperbarui',
    icon: 'storefront',
    tint: 'bg-violet-500/10 text-violet-700 ring-violet-500/10',
  },
}

/**
 * Select options for the activity-type filter, in documentation order.
 * @type {{ value: string, label: string }[]}
 */
export const ACTIVITY_FILTER_OPTIONS = ACTIVITY_TYPE_ORDER.map((value) => ({
  value,
  label: ACTIVITY_META[value].label,
}))