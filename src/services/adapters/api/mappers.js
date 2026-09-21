/**
 * DTO -> frontend model mappers.
 *
 * Translation from the proposed API response shape (docs/API-CONTRACT.md) to
 * the models in src/data/models.js. Only the API adapters use these; the mock
 * path already produces frontend models directly.
 */

/**
 * @param {object} dto - User DTO ({ id, email, phone, name, has_store, store_id, avatar_url }).
 * @returns {import('../../../data/models.js').User}
 */
export function toUser(dto) {
  return {
    id: dto.id,
    email: dto.email ?? null,
    phone: dto.phone ?? null,
    name: dto.name ?? '-',
    hasStore: Boolean(dto.has_store),
    storeId: dto.store_id ?? null,
    avatarUrl: dto.avatar_url ?? undefined,
    emailVerified: dto.email_verified === undefined ? true : Boolean(dto.email_verified),
    recoveryEmail: dto.recovery_email ?? null,
    recoveryEmailVerified: Boolean(dto.recovery_email_verified),
  }
}

/**
 * @param {object} dto - Store DTO ({ store_id, name, logo_url, ... }).
 * @returns {import('../../../data/models.js').Store}
 */
export function toStore(dto) {
  return {
    storeId: dto.store_id,
    name: dto.name ?? '',
    logoUrl: dto.logo_url ?? undefined,
    description: dto.description ?? undefined,
    province: dto.province ?? undefined,
    city: dto.city ?? undefined,
    fullAddress: dto.full_address ?? undefined,
    operatingHours: dto.operating_hours ?? undefined,
    whatsapp: dto.whatsapp ?? undefined,
    channels: (dto.channels ?? []).map((channel) => ({
      name: channel.name,
      url: channel.url,
    })),
    verified: Boolean(dto.verified),
    announcement: dto.announcement
      ? {
          title: dto.announcement.title ?? '',
          message: dto.announcement.message ?? '',
          isEnabled: Boolean(dto.announcement.is_enabled),
        }
      : undefined,
    autoArchiveDays:
      dto.auto_archive_days === null || dto.auto_archive_days === undefined
        ? null
        : Number(dto.auto_archive_days),
    lastStoreIdChange: dto.last_store_id_change ?? undefined,
    createdAt: dto.created_at ?? undefined,
  }
}

/**
 * @param {object} dto - Product DTO ({ id, store_id, name, ... }).
 * @returns {import('../../../data/models.js').Product}
 */
export function toProduct(dto) {
  return {
    id: dto.id,
    storeId: dto.store_id,
    name: dto.name ?? '',
    images: Array.isArray(dto.images) ? dto.images : [],
    mainImage: dto.main_image ?? (Array.isArray(dto.images) ? dto.images[0] : ''),
    category: dto.category ?? '',
    brand: dto.brand ?? '',
    condition: dto.condition,
    price: dto.price ?? 'Rp 0',
    priceValue: dto.price_value ?? 0,
    details: Array.isArray(dto.details)
      ? dto.details.map((detail) => ({
          label: detail.label ?? '',
          value: detail.value ?? '',
        }))
      : [],
    description: dto.description ?? '',
    externalLinks: Array.isArray(dto.external_links)
      ? dto.external_links.map((link) => ({
          name: link.name ?? '',
          url: link.url ?? '',
        }))
      : [],
    status: dto.status,
    featured: Boolean(dto.featured),
    soldOutAt: dto.sold_out_at ?? undefined,
    createdAt: dto.created_at ?? undefined,
    updatedAt: dto.updated_at ?? undefined,
  }
}

/**
 * @param {object} dto - Category DTO ({ id, name, parent_id, store_id, custom }).
 * @returns {import('../../../data/models.js').Category}
 */
export function toCategory(dto) {
  return {
    id: dto.id,
    name: dto.name,
    parentId: dto.parent_id ?? null,
    storeId: dto.store_id ?? undefined,
    custom: Boolean(dto.custom),
  }
}

/**
 * @param {object} dto - Brand DTO ({ id, name, store_id }).
 * @returns {import('../../../data/models.js').Brand}
 */
export function toBrand(dto) {
  return {
    id: dto.id,
    name: dto.name ?? '',
    storeId: dto.store_id ?? null,
  }
}

/**
 * Customer interest DTO (snake_case) to frontend model (camelCase).
 * Identity is preserved as-is: a missing name stays null (never coerced to a
 * fake placeholder) so the UI can fall back to email/phone when present.
 * @param {object} dto - Customer interest DTO ({ id, store_id, customer_name, ... }).
 * @returns {import('../../../data/models.js').CustomerInterest}
 */
export function toCustomerInterest(dto) {
  return {
    id: dto.id,
    storeId: dto.store_id,
    customerName: dto.customer_name ?? null,
    customerId: dto.customer_id ?? null,
    customerEmail: dto.customer_email ?? null,
    customerPhone: dto.customer_phone ?? null,
    productId: dto.product_id ?? null,
    productName: dto.product_name ?? null,
    channelType: dto.channel_type,
    channel: dto.channel ?? '',
    externalUrl: dto.external_url ?? null,
    context: dto.context ?? null,
    date: dto.date,
  }
}

/**
 * Recent activity DTO (snake_case) to frontend model (camelCase);
 * includes store/product context fields. PRODUCT_UPDATED (external contract
 * alias) maps deterministically to the internal canonical PRODUCT_EDITED.
 * @param {object} dto - Recent activity DTO ({ id, store_id, type, message, date, ... }).
 * @returns {import('../../../data/models.js').RecentActivity}
 */
export function toRecentActivity(dto) {
  return {
    id: dto.id,
    storeId: dto.store_id ?? null,
    type: normalizeActivityType(dto.type),
    message: dto.message ?? '',
    productId: dto.product_id ?? null,
    productName: dto.product_name ?? null,
    date: dto.date ?? dto.created_at,
  }
}

/**
 * Map an external API activity type to the internal canonical type.
 * PRODUCT_UPDATED is the external contract name for the internal
 * ACTIVITY_TYPE.PRODUCT_EDITED. Unknown values pass through unchanged so
 * consumers can handle them explicitly instead of silently dropping them.
 * @param {unknown} type
 * @returns {string}
 */
function normalizeActivityType(type) {
  if (type === 'PRODUCT_UPDATED') {
    return 'PRODUCT_EDITED'
  }
  return type
}

/**
 * Wrap a single-item mapper so it can map a list (unknown -> []);
 * @template T
 * @param {(item: any) => T} mapper
 * @returns {(items: any) => T[]}
 */
export function toList(mapper) {
  return (items) => (Array.isArray(items) ? items.map(mapper) : [])
}