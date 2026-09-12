/**
 * Katalog data models.
 *
 * These JSDoc typedefs document the expected shape of data that will come
 * from the Kataloga backend/API. Mock data and services in this codebase
 * follow these shapes so the API replacement is a drop-in change.
 */

/**
 * @typedef {Object} ExternalChannel
 * @property {string} name - Channel name, e.g. "Shopee", "Website", "Instagram".
 * @property {string} url - Channel URL.
 */

/**
 * @typedef {Object} Store
 * @property {string} storeId - Public store ID used in the URL: /{storeId}.
 * @property {string} name - Store name.
 * @property {string} [logoUrl] - Store logo URL from API.
 * @property {string} [description] - Store bio/description.
 * @property {string} [province] - Province name (location, required when set).
 * @property {string} [city] - City/regency name, belongs to the province.
 * @property {string} [fullAddress] - Optional full street address.
 * @property {string} [operatingHours] - Operating hours.
 * @property {string} [whatsapp] - WhatsApp number.
 * @property {ExternalChannel[]} [channels] - External sales channels.
 * @property {boolean} [verified] - Verification status.
 * @property {string[]} [announcement] - Active announcement content.
 * @property {string} [lastStoreIdChange] - ISO date of last Store ID change.
 * @property {string} [createdAt] - ISO date.
 */

/**
 * @typedef {Object} ProductDetailAttribute
 * @property {string} label - Attribute label, e.g. "RAM".
 * @property {string} value - Attribute value, e.g. "16 GB".
 */

/**
 * @typedef {Object} ExternalProductLink
 * @property {string} name - Link name, e.g. "Shopee", "Website".
 * @property {string} url - Link URL.
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Public numeric product ID.
 * @property {string} storeId - Owning store public ID.
 * @property {string} name - Product name.
 * @property {string[]} images - Product photo URLs (1-5).
 * @property {string} [mainImage] - Main photo URL.
 * @property {string} category - Category name (one category, 2-level max in data).
 * @property {string} [brand] - Optional brand.
 * @property {'NEW'|'SECOND'} condition - Product condition.
 * @property {string} price - Formatted price string.
 * @property {number} priceValue - Numeric price for sorting.
 * @property {ProductDetailAttribute[]} details - Product details attributes.
 * @property {string} [description] - Longer product description.
 * @property {ExternalProductLink[]} [externalLinks] - External product links.
 * @property {'DRAFT'|'PUBLISHED'|'SOLD_OUT'|'ARCHIVED'} status - Product lifecycle status.
 * @property {boolean} [featured] - Featured product flag.
 * @property {string} [createdAt] - ISO date.
 * @property {string} [updatedAt] - ISO date.
 */

/**
 * @typedef {Object} Category
 * @property {number} id - Category ID.
 * @property {string} name - Category name.
 * @property {number|null} parentId - Parent category ID for subcategories, null for parent category.
 * @property {string} [storeId] - Store ID for custom categories, undefined for default categories.
 * @property {boolean} [custom] - True when created by the seller.
 */

/**
 * @typedef {Object} CustomerInterest
 * @property {number} id - Activity ID.
 * @property {string} storeId - Store that received the activity.
 * @property {string} customerName - Customer display name.
 * @property {number|null} [customerId] - Authenticated customer user ID (null for legacy records).
 * @property {number|null} productId - Product ID, or null for store-level activity.
 * @property {string|null} productName - Product name, or null for store-level activity.
 * @property {'WHATSAPP_CLICK'|'MARKETPLACE_CLICK'} channelType - Interest type.
 * @property {string} channel - Selected channel name ("WhatsApp" or external channel).
 * @property {string|null} [externalUrl] - External target URL captured at record time.
 * @property {string} date - ISO date/time.
 */

/**
 * @typedef {Object} User
 * @property {number} id - User ID.
 * @property {string} email - Email used to log in.
 * @property {string} [phone] - Phone number used to log in (national format, e.g. "081234567890").
 * @property {string} name - Optional customer/seller name.
 * @property {boolean} hasStore - Whether the account owns a store.
 * @property {string|null} storeId - Owned store ID, or null.
 * @property {string} [avatarUrl] - Optional seller profile photo URL.
 */

/**
 * @typedef {Object} RecentActivity
 * @property {number} id - Activity ID.
 * @property {'PRODUCT_PUBLISHED'|'PRODUCT_EDITED'|'STORE_UPDATED'} type - Activity type.
 * @property {string} message - Human-readable summary.
 * @property {string} date - ISO date/time.
 */

export {}