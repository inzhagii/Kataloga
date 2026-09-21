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
 * @typedef {Object} Announcement
 * @property {string} title - Announcement title.
 * @property {string} message - Announcement body text.
 * @property {boolean} isEnabled - Whether the announcement is shown on the storefront.
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
 * @property {string} [operatingHours] - Operating hours as a single wire string
 *   (e.g. "Senin - Sabtu, 09:00 - 18:00"), composed by the structured editor.
 * @property {string} [whatsapp] - WhatsApp number.
 * @property {ExternalChannel[]} [channels] - External sales channels.
 * @property {boolean} [verified] - Verification status.
 * @property {Announcement} [announcement] - Single store announcement to show on the storefront.
 * @property {number|null} [autoArchiveDays] - Store-level auto archive threshold in days (1-365), null disables it ("Never"). Backend-owned behavior.
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
 * @property {string} [brand] - Optional brand name. Joins to the store's `Brand.name`
 *   (name-keyed, same convention as `category`); empty when the product has no brand.
 * @property {'NEW'|'SECOND'} condition - Product condition.
 * @property {string} price - Formatted price string.
 * @property {number} priceValue - Numeric price for sorting.
 * @property {ProductDetailAttribute[]} details - Product details attributes.
 * @property {string} [description] - Longer product description.
 * @property {ExternalProductLink[]} [externalLinks] - External product links.
 * @property {'DRAFT'|'PUBLISHED'|'SOLD_OUT'|'ARCHIVED'} status - Product lifecycle status.
 * @property {boolean} [featured] - Featured product flag.
 * @property {string} [soldOutAt] - ISO date when the product became SOLD_OUT. Used by the
 * mock to lazily derive the store-level Auto Archive boundary; backend-owned in production.
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
 * @typedef {Object} Brand
 * @property {number} id - Brand ID.
 * @property {string} name - Brand name.
 * @property {string} storeId - Store that owns the brand.
 */

/**
 * @typedef {Object} CustomerInterest
 * @property {number} id - Activity ID.
 * @property {string} storeId - Store that received the activity.
 * @property {string|null} customerName - Customer display name (may be null when the
 *   account has no name; email/phone stay available as supporting identity).
 * @property {number|null} [customerId] - Authenticated customer user ID (null for legacy records).
 * @property {string|null} [customerEmail] - Customer email snapshot at record time.
 * @property {string|null} [customerPhone] - Customer phone snapshot at record time.
 * @property {number|null} productId - Product ID, or null for store-level activity.
 * @property {string|null} productName - Product name snapshot, or null for store-level activity.
 * @property {'WHATSAPP_CLICK'|'MARKETPLACE_CLICK'} channelType - Interest type.
 * @property {string} channel - Selected channel name snapshot ("WhatsApp" or external channel).
 * @property {string|null} [externalUrl] - External target URL captured at record time.
 * @property {'Store Landing'|'Product Detail'} context - Storefront context where the
 *   interaction happened (docs/UX-FLOW.md), stored with the event so historical
 *   records never have their context guessed from the current route.
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
 * @property {boolean} [emailVerified] - Whether the login email is verified. Phone-only
 *   accounts are treated as verified (undefined/true) and rely on a recovery email.
 * @property {string|null} [recoveryEmail] - Verified email used for password recovery when
 *   the login email is absent or unverified.
 * @property {boolean} [recoveryEmailVerified] - Whether recoveryEmail has been verified.
 */

/**
 * @typedef {Object} RecentActivity
 * @property {number} id - Activity ID.
 * @property {string} storeId - Store that owns the activity.
 * @property {import('../constants/enums.js').ACTIVITY_TYPE} type - Activity type (canonical set of 7).
 * @property {string} message - Human-readable activity description.
 * @property {number|null} [productId] - Related product ID (null for store-level events).
 * @property {string|null} [productName] - Related product name snapshot (null for store-level events).
 * @property {string} date - ISO date/time.
 */

export {}