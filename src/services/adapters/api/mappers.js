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
    city: dto.city ?? undefined,
    operatingHours: dto.operating_hours ?? undefined,
    whatsapp: dto.whatsapp ?? undefined,
    channels: (dto.channels ?? []).map((channel) => ({
      name: channel.name,
      url: channel.url,
    })),
    verified: Boolean(dto.verified),
    announcement: dto.announcement ?? undefined,
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
 * @param {object} dto - Customer interest DTO ({ id, store_id, customer_name, ... }).
 * @returns {import('../../../data/models.js').CustomerInterest}
 */
export function toCustomerInterest(dto) {
  return {
    id: dto.id,
    storeId: dto.store_id,
    customerName: dto.customer_name ?? '-',
    customerId: dto.customer_id ?? null,
    productId: dto.product_id ?? null,
    productName: dto.product_name ?? null,
    channelType: dto.channel_type,
    channel: dto.channel ?? '',
    externalUrl: dto.external_url ?? null,
    date: dto.date,
  }
}

/**
 * @param {object} dto - Recent activity DTO ({ id, type, message, date }).
 * @returns {import('../../../data/models.js').RecentActivity}
 */
export function toRecentActivity(dto) {
  return {
    id: dto.id,
    type: dto.type,
    message: dto.message ?? '',
    date: dto.date,
  }
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