/**
 * Product Details hybrid system: recommended attributes per category
 * (category-based) + free custom attributes added by the seller.
 * Keys are leaf category names from the mock category data.
 */

export const RECOMMENDED_DETAILS = {
  Laptop: ['Processor', 'RAM', 'Storage', 'Screen Size', 'GPU', 'Weight', 'Battery Capacity'],
  Smartphone: ['Processor', 'RAM', 'Storage', 'Screen Size', 'Battery Capacity', 'Kamera', 'Konektivitas'],
  'Gadget Gaming': ['Brand', 'Koneksi', 'Warna', 'Garansi'],
  Aksesoris: ['Brand', 'Warna', 'Material', 'Koneksi'],
  Elektronik: ['Brand', 'Garansi', 'Berat'],
  Pakaian: ['Bahan', 'Ukuran', 'Warna'],
  Fashion: ['Bahan', 'Ukuran', 'Warna'],
  Gaming: ['Kompatibilitas', 'Koneksi', 'Garansi'],
}

/** Fallback recommended details when a category has no specific mapping. */
export const DEFAULT_RECOMMENDED_DETAILS = ['Brand', 'Model', 'Warna', 'Garansi']

/** Suggestions shown when adding a custom detail. */
export const DETAIL_NAME_SUGGESTIONS = [
  'RAM',
  'Storage',
  'Processor',
  'Screen Size',
  'Battery Capacity',
  'Weight',
  'GPU',
  'Warna',
  'Garansi',
  'Material',
  'Koneksi',
  'Ukuran',
  'Operating System',
  'Kamera',
]

/**
 * Recommended detail labels for a category.
 * @param {string} category
 * @returns {string[]}
 */
export function getRecommendedDetails(category) {
  return RECOMMENDED_DETAILS[category] || DEFAULT_RECOMMENDED_DETAILS
}