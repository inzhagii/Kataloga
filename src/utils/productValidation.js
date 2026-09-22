/**
 * Product validation rules (locked in docs/PRODUCT.md and UI_RULES.md).
 * Publish requires: name, >=1 photo, category, product details, description,
 * condition, price. Save Draft only requires a name. Every selected external
 * link must carry a non-empty URL before Publish (docs/PRODUCT.md §16).
 */

import { validateChannelRefs } from './channels'

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

  const externalLinks = product.externalLinks || []
  if (externalLinks.length > 0) {
    Object.assign(errors, validateChannelRefs(externalLinks).errors)
  }

  return { errors, valid: Object.keys(errors).length === 0 }
}

/**
 * Validate a product's external link references. A selected channel stays
 * editable with an empty URL, but Publish is blocked until every link has a
 * non-empty URL. Drafts may keep incomplete links.
 * @param {Array<{ channelId?: string, url?: string }>|undefined} links
 * @returns {{ errors: Record<string, string>, valid: boolean }}
 */
export function validateProductExternalLinks(links) {
  return validateChannelRefs(links)
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