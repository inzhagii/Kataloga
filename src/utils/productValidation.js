/**
 * Product validation rules (locked in docs/PRODUCT.md and UI_RULES.md).
 * Publish requires: name, >=1 photo, category, product details, description,
 * condition, price. Save Draft only requires a name.
 */

/**
 * Validate a product form for Publish.
 * Returns a map of field -> error message plus a valid flag.
 * @param {import('../data/models.js').Product} product
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateProductForPublish(product) {
  const errors = {}

  if (!product.name || !product.name.trim()) {
    errors.name = 'Nama produk wajib diisi.'
  }

  if (!product.images || product.images.length === 0) {
    errors.photos = 'Minimal 1 foto produk wajib diunggah.'
  }

  if (!product.category) {
    errors.category = 'Pilih kategori produk.'
  }

  const details =
    product.details || []
  if (details.length === 0 || details.some((detail) => !detail.label || !detail.value)) {
    errors.details = 'Minimal 1 detail produk wajib diisi.'
  }

  if (!product.description || !product.description.trim()) {
    errors.description = 'Deskripsi produk wajib diisi.'
  }

  if (!product.condition) {
    errors.condition = 'Pilih kondisi produk (New / Second).'
  }

  if (!product.priceValue || product.priceValue <= 0) {
    errors.price = 'Harga produk wajib diisi dan lebih dari 0.'
  }

  return { errors, valid: Object.keys(errors).length === 0 }
}

/**
 * Validate a product form for Save Draft (basic form state only).
 * @param {import('../data/models.js').Product} product
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateDraftBasics(product) {
  const errors = {}
  if (!product.name || !product.name.trim()) {
    errors.name = 'Nama produk wajib diisi untuk menyimpan draft.'
  }
  return { errors, valid: Object.keys(errors).length === 0 }
}