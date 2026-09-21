/**
 * Generate a URL-safe slug from a product name.
 * Rules: lowercase; non-alphanumeric runs become a single hyphen;
 * leading/trailing hyphens trimmed. Used as a client fallback when the
 * Product model does not yet contain an API-provided slug.
 */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
