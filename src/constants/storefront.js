import { CONDITION } from './enums'

/**
 * Searchable product fields used by the catalog relevance search.
 */
export const SEARCH_FIELDS = ['name', 'brand', 'category', 'details', 'description']

/**
 * Sort options available on the public Store Landing.
 * Availability is never a selectable sort option.
 */
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevansi' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price-asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price-desc', label: 'Harga: Tinggi ke Rendah' },
]

/**
 * Condition filter options for the public catalog.
 */
export const CONDITION_OPTIONS = [
  { value: 'all', label: 'Semua Kondisi' },
  { value: CONDITION.NEW, label: 'Baru (New)' },
  { value: CONDITION.SECOND, label: 'Second' },
]