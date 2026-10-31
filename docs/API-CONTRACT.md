# Kataloga â€” Frontend API Contract (canonical reference)

> **STATUS: FRONTEND-FACING API CONTRACT (Phase A reconciled)**
>
> This document is the **canonical frontend-facing reference** for how the
> Kataloga frontend integrates with the backend. It reflects the locked Kataloga
> product requirements and the latest Backend Business/API Contract decisions.
>
> There is **no confirmed production backend** in this repository yet; the
> frontend runs in mock mode by default, and API adapters in
> `src/services/adapters/api/` implement this contract, activated with
> `VITE_DATA_SOURCE=api`.
>
> **Three distinct categories:**
>
> - **A. Confirmed/approved product requirements:** locked Kataloga
>   requirements (see `PRODUCT.md`) stated as expected product behavior,
>   e.g. the product lifecycle, SOLD_OUT semantics, and Auto Archive rules.
> - **B. Current frontend implementation facts:** what the frontend adapters
>   implement *today*. These are frontend facts only; the backend remains
>   authoritative for actual transport, enums, fields, transitions, API
>   paths, scheduler behavior, and error codes.
> - **C. Backend-dependent / open contract items:** marked
>   `> **Backend confirmation needed:** ...` or
>   `API DEPENDENCY / CONFIRMATION REQUIRED`. These are open decisions, never a
>   finalized backend implementation. An enumerated consolidated list lives in
>   `docs/BACKEND-DEPENDENCIES.md` under "API DEPENDENCIES / CONFIRMATION
>   REQUIRED".

---

## 1. Conventions

- Base URL: `VITE_API_BASE_URL`. Empty means same-origin relative requests.
- JSON request/response bodies.
- Dates are ISO-8601 strings (`date`, `created_at`, `updated_at`).
- Keys are `snake_case` on the wire, mapped to the camelCase frontend models
  in `src/data/models.js` by `src/services/adapters/api/mappers.js`.
- All seller endpoints are scoped to the authenticated session (ownership is
  enforced by the backend, never trusted from the client).
- Customer-facing read endpoints are public.

## 2. Envelope & Errors

Uniform response envelope (finalized Kataloga API shape):

- Success single object: `{ "data": {...}, "message": "..." }`
- Success list: `{ "data": [...], "meta": { "current_page": 1, "per_page": 15, "total": 42 } }`
- Validation/error body: `{ "message": "The given data was invalid.", "errors": { "field": ["..."] } }`

Error body (validation):

```json
{ "code": "STORE_ID_TAKEN", "message": "Store ID sudah digunakan." }
```

HTTP status â†’ frontend `ApiError.type`:

| Status | type         |
| ------ | ------------ |
| 400, 422 | `validation` |
| 401    | `unauthorized` |
| 403    | `forbidden`  |
| 404    | `not_found`  |
| 409    | `conflict`   |
| 419    | `session_expired` (redirect to /login) |
| 5xx    | `server`     |
| network failure | `network` |
| malformed body | `parse` |

UI shows `error.message`; raw stack traces are never exposed.

Lists that may be long (products, activities, customer interests) support
pagination via `meta`. The current adapter may not implement pagination yet â€”
see the backlog; the envelope is the frontend contract.

## 3. Authentication (`authService`)

Laravel Sanctum **session authentication** (finalized transport):

- Cookie-based session; CSRF protection via `X-CSRF-TOKEN`.
- **No JWT, no Bearer token, no localStorage token.** The frontend never
  stores or sends an access token of its own.
- Bootstrap: `GET /sanctum/csrf-cookie` then send the CSRF header on
  state-changing requests.
- Session expired (419) returns the user to `/login`.

Endpoints (implemented paths under the Laravel auth service; frontend adapter
wiring remains a separate integration task):

- `POST /auth/login` â€” `{ email_or_phone, password }` â†’ user DTO
- `POST /auth/register` â€” `{ email?, phone?, password, password_confirmation, name? }` â†’
  `{ user, requires_verification, identifier, channel }`
  - Exactly one of `email` or `phone` is required. Sending both, or neither,
    returns `422`.
  - `name` is optional and nullable; the backend never synthesizes a name.
  - Email registration returns `channel: "email"` and requires OTP
    verification. Phone registration returns `channel: "phone"` and starts the
    authenticated session immediately.
- `GET /auth/me` â€” session account; `401` means guest â†’ user DTO | null
- `PATCH /auth/me` â€” `{ name?, email?, phone?, avatar_url? }` â†’ user DTO
- `POST /auth/logout`

Email-verification endpoints are implemented in the backend. Password/recovery
endpoints below remain frontend-side mock proposals pending backend
confirmation:

- `POST /auth/email/verify` â€” `{ email, code }` â†’ user DTO
- `POST /auth/email/verify/resend` â€” `{ email }` â†’ `{ expires_at, cooldown_seconds }`
- `POST /auth/password/otp` â€” `{ email }` â†’ `{ expires_at, cooldown_seconds }`
- `POST /auth/password/otp/verify` â€” `{ email, code }` â†’ `{ verified }`
- `POST /auth/password` â€” `{ current_password, new_password }` â†’ `{ ok }`
- `POST /auth/password/forgot` â€” `{ email_or_phone }` â†’ generic `{ ok }`
  (must never reveal whether the identifier exists)
- `POST /auth/password/reset` â€” `{ email_or_phone, code, password }` â†’ `{ ok }`
- `POST /auth/recovery-email/otp` â€” `{ email }` â†’ `{ expires_at, cooldown_seconds }`
- `POST /auth/recovery-email/verify` â€” `{ email, code }` â†’ user DTO

User DTO:

```json
{ "id": 1, "email": "a@b.co", "phone": "+6281234567890", "name": "Toko",
  "has_store": true, "store_id": "toko-komputer-jaya", "avatar_url": null,
  "email_verified": true, "recovery_email": null, "recovery_email_verified": false }
```

- `name` may be `null` because customer name is optional (PRODUCT Â§Authentication).
- Backend owns credentials/authorization. The frontend never stores passwords
  or fakes tokens; dev mock credentials are mock-only.
- Session is transported via cookie (`credentials: 'include'`). There is no
  `setAccessToken` in the transport anymore; a stale reference is removed in
  Phase B (API transport cleanup).
- Any `401`/`419` clears the local session (`AuthProvider`), sending protected
  routes back to `/login`.

Account activation:

- Register via **email**: account is active after email verification. Until
  then `login` fails with an `email_unverified` code and the client routes to
  `/verify-email`.
- Register via **phone**: account is active immediately (no verification),
  and a recovery email is required before password recovery / change-password.

OTP rules (LOCKED): 6 digits, 10-minute expiry, max 5 attempts, 60-second
resend cooldown, and max 3 successful resends per 15-minute window. Login is
rate-limited to 5 attempts per minute per identifier and per IP. The backend
enforces these limits; the frontend only renders the cooldown/expiry UX and
forwards backend errors. OTP codes are hashed at rest, single-use, never logged
or placed in the URL.

> **Register payload decision:** email and phone are separate optional fields;
> exactly one must be supplied. This follows PRODUCT Â§Authentication (register
> with email *or* phone) and the explicit requirement that supplying both
> returns `422`.
>
> **Backend confirmation still needed:** whether the recovery-email flow uses a
> code (OTP) or a magic link, the response fields for
> `expires_at`/`cooldown_seconds`, and the shape of the short-lived proof
> returned by `POST /auth/password/otp/verify` that authorizes
> `POST /auth/password`.

## 4. Store (`storeService`)

- `GET /stores/me` â†’ store DTO | null
- `GET /stores/{storeId}` â†’ store DTO | null (public)
- `GET /stores/availability?store_id=...` â†’ `{ "available": boolean }`
- `POST /stores` â€” `{ name, store_id }` â†’ store DTO (creates store, session becomes owner)
- `PATCH /stores/me` â€” partial store DTO fields â†’ store DTO

Store DTO:

```json
{ "store_id": "toko-komputer-jaya", "name": "Toko Komputer Jaya",
  "logo_url": null, "description": "...", "city": "Bandung",
  "province": "Jawa Barat", "full_address": null,
  "operating_hours": "Senin - Sabtu, 09.00 - 18.00",
  "whatsapp": "6281234567890",
  "external_links": [ { "platform_name": "Shopee", "store_url": "https://..." } ],  // illustrative; wire shape UNCONFIRMED (see note below)
  "verified": true,
  "announcement": { "title": "...", "message": "...", "is_enabled": true },
  "auto_archive_days": 30,
  "last_store_id_change": "2026-01-15T00:00:00.000Z", "created_at": "..." }
```

WhatsApp is a **dedicated** store field (`whatsapp`), separate from external
marketplace links (`external_links`). Store external links reference a **shared
channel master (CMS)**; the store-level wire representation remains
UNCONFIRMED. The frontend model is `{ channelId, url }` (per-reference), with
`channelId` referring to a channel master definition (`{ id, name, logo }`,
logo = frontend-owned icon token). There is no persisted per-reference link id,
no icon/logo per reference, no display order, and no fixed marketplace fields
(`shopeeUrl`, `tokopediaUrl`).

> **API DEPENDENCY / CONFIRMATION REQUIRED (channel master):** product external
> links use the confirmed `{ channel_id, url }` wire shape; the remaining open
> items are the **store-level** external-link wire shape, whether the backend
> serves a channel-master endpoint, how custom (seller-created) store-scoped
> channels are represented and where they are stored, and backend-side
> duplicate-channel rejection. Frontend currently runs on the mock channel
> master (exactly Shopee/Tokopedia/Lazada + store-scoped `CUSTOM:` channels).

Announcement is a single object (`title`, `message`, `is_enabled`), not an array.

A disabled announcement (`is_enabled: false`) is saved but not rendered on the storefront.

`auto_archive_days` is the store-level Auto Archive setting. The locked Kataloga
value set is: `null` (default, "Never", auto archive off), 1, 7, 30, 90, 180,
or **360** days. There is **no** "Tidak ada" option and **no** 365-day value.
`Never` (= null) disables auto archive but never blocks manual archive.

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> exact wire field name and the null representation for Auto Archive
> (`auto_archive_days` vs. a separate flag; `null` expected), and how a
> setting change is applied to SOLD_OUT products with elapsed durations.
> UI location is fixed: the Auto Archive setting lives on the Archive page
> (/seller/products/archived), not on My Store â€” a frontend placement decision
> that does not change the store DTO.

Rules enforced by the backend:

- 1 account = max 1 store (409 on duplicate).
- Store ID: required, unique, human-readable, trimmed, **max 50 characters**.
  Format: lowercase letters, digits, and hyphens only; starts and ends with an
  alphanumeric character; no consecutive hyphens.
- Store identity model: the database identity is numeric `store.id`; `store_id`
  is the public, human-readable URL identifier. Ownership is derived by the
  backend from the session; the frontend never treats `store_id` as an
  authorization source of truth.
- Availability Store ID must be re-checked on submit.
- Store ID change allowed at most once per 30 days (409 with message while cooling down).
- Store ID change re-keys owning products, custom categories, interests, and
  the account reference atomically.
- Each historical Store ID remains a valid alias that redirects to the current
  store for **90 days** from the change, then expires. Historical aliases are
  **not permanent** (backend-owned; the frontend never maintains its own alias
  map).

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> exact format/validation source of truth (regex), the province/city master-data
> source, and the storage representation of `province` / `city` / `full_address`
> (e.g. stored per store; scoped dropdowns in UI only). Historical Store ID
> alias resolution (90-day storage + redirect + expiry semantics) is
> backend-owned.

## 5. Product (`productService`)

- `GET /stores/{storeId}/products?search=...&category=...&condition=...&sort=...&page=...` â†’ public catalog listing
  - Listing contains **PUBLISHED** plus **SOLD_OUT** products still within the
    store-level auto archive window.
  - Ordering: Featured Published â†’ newer Published â†’ older Published â†’
    Sold Out.
  - Search/filter/sort are **backend-owned** in API mode: the frontend sends
    query parameters (search text, category, condition, sort key, page) and the
    backend returns the filtered/paginated result set. Client-side
    search/filter/sort is a **mock-mode-only** behavior.
  - Search is store-scoped, case-insensitive, partial, multi-field
    (name, brand, category, details, description, attributes). No price or
    attribute filters in V1. No extra routes for search/filter/sort.
- `GET /stores/{storeId}/products/{productId}` â†’ product DTO | null (public;
  PUBLISHED or SOLD_OUT still within the auto archive window only)
- `GET /products` â†’ all products of the session Store (DRAFT, PUBLISHED,
  SOLD_OUT, ARCHIVED), no status filter.
- `GET /products?status=active` â†’ seller products (session-scoped)
  - `active` = **PUBLISHED only**.
- `GET /products?status=archived` â†’ ARCHIVED products (separate list)
- Any other `status` value â†’ **HTTP 422 validation error**. `draft` and
  `sold_out` are not supported `?status=` values.

> **Stage 3.1 backend behavior (implemented):** the no-status list returns all
> products owned by the session Store. Only `active` and `archived` are accepted
> `status` values; unsupported values return `422`, never a silent unfiltered
> result. The seller management list mismatch (PRODUCT-4) remains open because
> `draft` / `sold_out` query values are not part of this contract.
- `GET /products/{productId}` â†’ seller product by ID (any status)
- `POST /products` â€” product DTO â†’ product DTO (store from session)
- `PATCH /products/{productId}` â€” partial product **data** fields â†’ product DTO
  (PATCH is for product data only; lifecycle status changes use dedicated
  endpoints below)
- `POST /products/{productId}/publish` â€” DRAFT â†’ PUBLISHED
- `POST /products/{productId}/sold-out` â€” PUBLISHED â†’ SOLD_OUT (marks SOLD_OUT, records `sold_out_at`)
- `POST /products/{productId}/mark-available` â€” SOLD_OUT â†’ PUBLISHED (reaktivasi langsung)
- `POST /products/{productId}/archive` â€” PUBLISHED/DRAFT â†’ ARCHIVED
- `POST /products/{productId}/restore` â€” ARCHIVED â†’ DRAFT
- `PATCH /products/{productId}/featured` â€” toggle Product Unggulan (PUBLISHED/SOLD_OUT only)

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> exact lifecycle endpoint paths and whether SOLD_OUT â†’ DRAFT uses a separate
> endpoint (`/unpublish`, `/to-draft`, or a body flag). The frontend adapter
> currently implements a generic status PATCH; this must be reconciled to the
> dedicated endpoints in Phase B. No **generic** status mutation endpoint is
> part of the contract.

Product DTO:

```json
{ "id": 20, "store_id": "toko-komputer-jaya", "name": "Laptop Asus",
  "slug": "laptop-asus", "images": ["https://..."], "main_image": "https://...",
  "category": "Laptop", "brand": "Asus", "condition": "NEW",
  "price": "8500000.00",
  "details": [ { "label": "RAM", "value": "16 GB" } ],
  "description": "...",
  "external_links": [ { "channel_id": "SHOPEE", "url": "https://..." } ],
  "status": "PUBLISHED", "featured": false,
  "created_at": "...", "updated_at": "...",
  "published_at": "...", "sold_out_at": null,
  "archived_at": null }
```

`price` is a decimal string (for example `"8500000.00"`); `price = 0` is valid.
`price_value` is not part of the product response.

Product identity is the numeric product ID (`id`). `slug` is generated by the
backend from the product name, unique within a store (collisions use `-2`,
`-3`, ...), and immutable after creation; editing the product name does not
change the slug. The frontend must not send or generate `slug`. The public route
is `/{storeId}/product/{productId}/{slug}`.

`external_links` uses the official product wire shape
`{ "channel_id": "...", "url": "..." }` and references the shared channel master
(CMS). Unknown channels and duplicate `channel_id` values are rejected. Store
external links are a separate contract surface.

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> `sold_out_until` is no longer a per-product field â€” the auto archive boundary
> is derived from the store-level Auto Archive setting and the product's elapsed
> SOLD_OUT duration (`sold_out_at`). The exact shape of an auto-archive deadline
> on the product DTO (if the backend exposes one) is open.

Lifecycle (backend-enforced):

- `DRAFT â†’ PUBLISHED` (publish)
- `PUBLISHED â†’ SOLD_OUT` (sold-out)
- `SOLD_OUT â†’ PUBLISHED` (mark-available / reactivation, label "Publish Kembali")
- `SOLD_OUT â†’ DRAFT` (allowed, for editing before re-publication)
- `PUBLISHED â†’ ARCHIVED`
- `DRAFT â†’ ARCHIVED`
- `ARCHIVED â†’ DRAFT` (restore). **Never** `ARCHIVED â†’ PUBLISHED`.
- Publish validation: name (slug is generated automatically by the backend),
  1â€“5 photos (exactly one main), category,
  description, condition, price. `price` = 0 (free) **is valid**.
  Product Details / attributes are optional; custom attributes are never
  required.
- SOLD_OUT is a product *lifecycle status*, not an availability field.
- Auto Archive is a store-level setting with the locked value set: `null`
  ("Never", default, off) / 1 / 7 / 30 / 90 / 180 / **360** days. There is no
  "Tidak ada" and no 365-day value. A SOLD_OUT product becomes ARCHIVED once it
  exceeds the store threshold (from `sold_out_at`) and disappears from the
  catalog. Reactivation before the threshold returns it directly to PUBLISHED.
- Product Unggulan (featured): boolean attribute, max 10 per store. A product
  may be featured/unfeatured only while PUBLISHED **or SOLD_OUT**. DRAFT and
  ARCHIVED are never featured. A PUBLISHED product that becomes SOLD_OUT
  **keeps** its featured state. Reactivating SOLD_OUT to PUBLISHED does **not**
  change featured state. Archiving clears featured.
- Catalog listing endpoints return PUBLISHED plus SOLD_OUT still within the
  auto archive window; DRAFT and expired SOLD_OUT/ARCHIVED are
  seller-management areas.
- No SKU / inventory / stock / orders on V1.
- `external_links` stays a product data field (product form and API). It is a
  frontend-only display decision that the External Product Links section is
  **not rendered** on the customer-facing Product Detail page.

> **Backend confirmation needed:** store-level Auto Archive expiry handling is
> backend-owned (scheduled transition to ARCHIVED); the frontend displays
> products returned by the catalog endpoint as-is.

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> the exact transport for marking a product SOLD_OUT and reactivating it to
> PUBLISHED (dedicated endpoints above are proposed; current adapter uses a
> status PATCH), the exact `?status=` value semantics for the seller management
> lists, and whether seller category/brand filtering
> (`/seller/products?category=...`, `/seller/products?brand=...`) is performed
> server- or client-side.

## 6. Category (`categoryService`)

- `GET /categories` â†’ default + current-store custom categories (session-scoped)
- `POST /categories` â€” `{ name, parent_id? }` â†’ category DTO
- `PATCH /categories/{categoryId}` â€” `{ name?, parent_id? }` â†’ category DTO
- `DELETE /categories/{categoryId}` â†’ `{ "deleted": true }`

Category DTO:

```json
{ "id": 7, "name": "Gaming", "parent_id": null, "store_id": "toko-komputer-jaya" }
```

Rules:

- Max two levels (Kategori Utama -> Sub Kategori); parent_id must reference a
  level-1 category. User-facing terminology: "Kategori Utama" / "Sub Kategori".
- Product references Category via `category_id`. Product display obtains the
  Category name through the relationship.
- Default/global categories use `store_id = null`, are Kataloga-managed and
  **read-only** (cannot be edited or deleted) to Store owners.
- Custom categories are scoped to the authenticated user's own Store. ADMIN
  cannot create custom categories as a Store owner.
- Names must be unique case-insensitively within the correct scope: global
  (`store_id = null`) or per Store for custom records.
- Seller can create a level-1 category directly from the category form.
- Delete is blocked (409) if any Product references the Category, including
  Products with status `ARCHIVED`. Delete is also blocked (409) if the
  Category has child categories. No cascade delete.
- Renaming a Category does not break Product relationships because references
  use IDs.

## 6.1 Brand (`brandService`)

- `GET /brands` â†’ global/default + current-store custom brands (session-scoped)
- `POST /brands` â€” `{ name }` â†’ brand DTO (creates a custom brand)
- `PATCH /brands/{brandId}` â€” `{ name? }` â†’ brand DTO
- `DELETE /brands/{brandId}` â†’ `{ "deleted": true }`

Brand DTO:

```json
{ "id": 3, "name": "Asus", "store_id": null }
```

Rules:

- Brands: **global/default** brands (`store_id` null, Kataloga-managed, seeded,
  read-only - cannot be edited or deleted by Store owners) plus **custom**
  store-scoped brands that sellers manage.
- Brand is optional and separate from Category; no decorative icon per brand.
- Product references Brand via nullable `brand_id`. Product display obtains the
  Brand name through the relationship.
- Custom brands are scoped to the authenticated user's own Store. ADMIN cannot
  create custom brands as a Store owner.
- Names must be unique case-insensitively within the correct scope: global
  (`store_id = null`) or per Store for custom records.
- Renaming a Brand does not break Product relationships because references use
  IDs.
- Delete is blocked (409) if any Product references the Brand, including
  Products with status `ARCHIVED`. No cascade delete and no silent detach.
- Brand Management is a section inside `/seller/categories` (Kategori | Brand);
  no additional route.
- Card grid: desktop 4 columns, mobile 2; each card shows name, usage count,
  Edit, Lihat Produk. "Lihat Produk" applies the brand filter on
  `/seller/products?brand={brandId}`.
- Seller can create a brand directly from Add/Edit Product (same brand list).

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> exact `GET /brands` path and whether global default brands are served by the
> backend (seeded, `store_id` null) or seeded client-side; and the exact
> `?brand=` query semantics on `/seller/products` (server- vs client-side).
> Frontend uses mock brand data until confirmed.
>
> **MySQL uniqueness design note (required):** Case-insensitive uniqueness must
> hold for global rows where `store_id IS NULL` and per Store for custom rows.
> The design must be verified against the actual MySQL target; SQLite tests do
> not prove MySQL uniqueness behavior.

## 7. Customer Interest (`customerInterestService`)

- `GET /stores/{storeId}/customer-interests` â†’ aggregated interest DTO[], newest first
- `POST /customer-interests` â€” record interest â†’ interest DTO

Customer Interest is recorded as **aggregated data**, not per-click rows:

```json
{ "id": 5, "store_id": "toko-komputer-jaya", "customer_user_id": 12,
  "product_id": 20, "context": "PRODUCT", "channel": "shopee",
  "first_activity_at": "...", "last_activity_at": "...",
  "total_clicks": 3 }
```

| Field | Notes |
| --- | --- |
| `id` | Aggregated segment record id. |
| `store_id` | Always the target store. |
| `customer_user_id` | Owning authenticated customer session. |
| `product_id` | Related product, nullable; `null` for `context` `STORE`. |
| `context` | `"STORE"` (Store Landing) or `"PRODUCT"` (Product Detail). Stored with the event so historical records never have their context inferred from the current route. |
| `channel` | Destination/action string, e.g. `"whatsapp"`, `"shopee"`, `"tokopedia"`. There is **no** `channel_type` field. |
| `first_activity_at` / `last_activity_at` | Aggregation window bounds. |
| `total_clicks` | Repeated clicks on the same segment increment `total_clicks`; no new row is created. |

Identity snapshots (`customer_name` / `customer_email` / `customer_phone`) may
be returned in the seller list view; a missing name MUST NOT be coerced to a
placeholder like `"-"` â€” the UI falls back name â†’ email â†’ phone, and displays
nothing when no identity exists. Snapshot acceptance is `API DEPENDENCY /
CONFIRMATION REQUIRED`.

Rules:

- Only explicit CTA activity: `WHATSAPP_CLICK` and `MARKETPLACE_CLICK`
  (channel chosen by the customer). No `PRODUCT_VIEW`, `SHARE`, `LOGIN`,
  `LOGOUT`, `STORE_VISIT`, or category activity.
- Requires authentication (guest must log in before a record is created).
- Customer identity uses `email` and/or `phone` from the session; no uploaded
  customer avatar in V1 (generic user-circle icon on UI).
- Storage is aggregation-keyed: store + customer + product + context + channel.
- Total Interest = total clicks (`total_clicks`), not unique customers.
- **Redirect/WhatsApp is opened only AFTER the interest POST succeeds.**
- **Self-store exclusion:** the store owner's own clicks on their own storefront
  are never recorded. The frontend must avoid sending them; the backend is
  expected to enforce this too. Ownership is resolved from the authenticated
  session, never from the mock store list.
- The frontend derives the storefront link for a product detail
  (`/{storeId}/product/{productId}/{slug}`) from the product id.

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> exact aggregate endpoint shape/list response for seller customer-interest
> (whether the backend aggregates or returns per-record rows to aggregate
> client-side), acceptance of `context`/`channel` values, and whether the
> session or the request body is the source of truth for identity.

## 8. Recent Activity (`activityService`)

Recent Activity is **backend-created**. The frontend **consumes only**.

- `GET /activities` â†’ activity DTO[], newest first
- **No `POST /activities`.** Frontend never creates activity records.
  (Removal of the frontend `POST /activities` is a Phase B cleanup item.)

Activity DTO:

```json
{ "id": 6, "store_id": "toko-komputer-jaya", "type": "PRODUCT_PUBLISHED",
  "message": "Laptop Asus berhasil dipublikasi ke katalog.",
  "product_id": 20, "product_name": "Laptop Asus", "date": "..." }
```

- Allowed types (canonical values; exact enum is an `API DEPENDENCY /
  CONFIRMATION REQUIRED` if the backend sends different strings):
  `PRODUCT_PUBLISHED`, `PRODUCT_UPDATED` (canonical â€” replaces
  `PRODUCT_EDITED`), `PRODUCT_SOLD_OUT`, `PRODUCT_REACTIVATED`,
  `PRODUCT_ARCHIVED`, `PRODUCT_RESTORED`, `CATEGORY_CREATED`,
  `CATEGORY_UPDATED`, `ANNOUNCEMENT_CREATED`, `ANNOUNCEMENT_UPDATED`,
  `STORE_UPDATED`.
- `product_id` / `product_name` are the related product snapshot for product
  events and null for store-level events (`STORE_UPDATED`).
- The Dashboard shows the 4 newest activities; "Lihat Semua" opens
  `/seller/activities`.
- Never mixed with Customer Interest.
- The full list page at `/seller/activities` is a **frontend route only**; it
  reuses `GET /activities` and does not require a new endpoint.
- Date display is the canonical `DD.MM.YYYY` (`12.09.2026`, no weekday, no
  month name), derived from the raw timestamp at render time â€” timestamps are
  never mutated for display. Single-date filtering uses a local calendar-day
  comparison (`src/utils/datetime.js#filterBySingleDate`), not a date range.

> **Backend confirmation needed (API DEPENDENCY / CONFIRMATION REQUIRED):**
> exact `GET /activities` path and pagination, whether the backend sends the
> display date or a raw timestamp, whether the dashboard 4-item slice is served
> by the backend or derived client-side, and whether `/seller/activities`
> filtering (type/single-date) is server- or client-side.

## 9. Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_DATA_SOURCE` | `mock` | `mock` (in-memory dev data) or `api` (adapters above). Production/API mode must never silently fall back to mock. |
| `VITE_API_BASE_URL` | (empty) | API base; empty = same origin as frontend |

## 10. Backend integration status

- Mock mode: fully working, default (dev/isolated tests only).
- API mode: contract-ready; a backend exists for Sanctum auth, Store, and draft
  Product endpoints (Stages 1–3). Endpoints not yet implemented must surface
  errors rather than fake success. Activate via `VITE_DATA_SOURCE=api` only as
  adapters and contracts are finalized. API failures must surface error
  feedback; mock must never produce a fake success response in API mode.
- Production must not use mock data as application state.

### 10.1 Doc-level decisions pending backend confirmation

These points changed the *contract document* to match the finalized Kataloga
requirements; the actual backend behavior needs confirmation:

1. `GET /products?status=` semantics: **Stage 3.1 backend behavior
   (implemented)** — no status returns all session-Store products; `active` =
   PUBLISHED; `archived` = ARCHIVED; any other value returns `422`. `draft` and
   `sold_out` are not supported query values; the seller management list
   mismatch remains open.
2. Store-level Auto Archive (finalized value set: `null`/"Never" default / 1 /
   7 / 30 / 90 / 180 / **360** days; "Never" disables auto archive but never
   blocks manual archive) expiry â†’ ARCHIVED is backend-owned scheduling;
   wire representation of auto-archive days (`null` vs `0` vs a flag); whether
   an auto-archive deadline is exposed on the product DTO.
3. Product Unggulan lifecycle (finalized locked rule): SOLD_OUT keeps
   `featured`; reactivation does not clear it; archiving clears it. Backend is
   expected to enforce max-10 and the lifecycle rules.
4. Province/City master data: source endpoint and per-store storage shape for
   `province`, `city`, `full_address`; display order "City, Province".
5. Seller category filtering by `?category=` on `/seller/products` (and brand
   filtering by `?brand=`): server-side query vs. client-side filter.
6. `/seller/activities` reuses `GET /activities` (frontend route, no new API);
   whether dashboard 4-item slice and activity filtering (type/single-date) are
   server- or client-side.
7. Store ID format is enforced by the backend; frontend mirrors the same
   validation but never replaces it. Store ID max 50 characters.
8. Historical Store ID alias resolution: 90-day valid redirect window, then
   expiry (backend-owned). Aliases are not permanent.
9. `operating_hours` stays a wire string in the contract; the frontend may use
   a structured editor (Hari Mulai / Hari Selesai / Jam Buka / Jam Tutup) that
   composes the wire string â€” the storage shape needs backend confirmation.
10. Announcement storage shape (single `{ title, message, is_enabled }` object).
11. Account activation variants (email verification vs. phone active immediately
    with recovery email), and change-password flow requiring current email first.
12. Product `slug`: backend-generated from the product name, unique within a
    store using numeric suffixes (`-2`, `-3`, ...), immutable after creation,
    and exposed on the product DTO. The frontend must not send or generate it.
13. Brand endpoints (`/brands`) and brand behavior: global/default brands
    (`store_id` null, seeded, read-only) + custom store-scoped brands; store
    scoping; duplicate names are rejected case-insensitively within scope: global (`store_id = null`) or per Store for custom records; renaming does not break Product relationships (ID-based, no propagation); delete blocked if any Product references the Brand, including `ARCHIVED`
    usage counting (including ARCHIVED products); and whether the brand filter
    on `/seller/products?brand=` is server-side. Frontend uses mock brand data
    until confirmed.
14. Lifecycle transport: dedicated endpoints (publish / sold-out /
    mark-available / archive / restore) replace the generic status PATCH;
    including SOLD_OUT â†’ DRAFT transition endpoint.
15. Customer Interest aggregation: wire shape of the aggregated list, `context`
    values `STORE`/`PRODUCT`, `channel` (no `channel_type`), and acceptance of
    identity snapshots.
16. Auth transport: Laravel Sanctum session + CSRF bootstrap; exact route paths
    for `/sanctum/csrf-cookie` and auth endpoints.
17. Product CTA + external destinations (conceptual, NOT locked into this
    contract yet â€” registered as dependency): Store CTA Options
    (`store.ctaOptions` = `[{ type: 'BUY'|'BARGAIN'|'CUSTOM', label }]`, defaults
    BUY "Beli" + BARGAIN "Tawar", seller-addable CUSTOM; product stores exactly
    one selected CTA `product.cta` (`{ type, label }`, default BUY/"Beli", label
    resolved from the selected store option) â€” destinations are a SEPARATE field
    (`product.externalLinks`), CTA never contains them), destination channels
    (shared channel master; mock = exactly Shopee / Tokopedia / Lazada,
    store-scoped `CUSTOM:` custom channels, TikTok Shop / Blibli only as
    frontend display hints pending backend confirmation; channel_id â†’ icon is
    frontend-owned), deletion rules for CUSTOM-only-used options, and
    custom-label length validation. Wire representation (including the channel
    master and `channelId`-reference vs. `{name,url}` encoding) needs backend
    confirmation; do not implement as finalized DTO fields until confirmed.
18. `/seller` entry gateway (frontend route): guest â†’ `/login`; authenticated
    without store â†’ `/create-store`; with store â†’ `/seller/dashboard`. Needs no
    new endpoint; requires the session to expose store status. Whether the
    session payload already includes store presence needs backend/API
    confirmation.
19. Fullscreen gallery ("Lihat Full") and floating action bar on Store Landing
    are frontend-only UI state; no API impact.

No new endpoints were invented in this document beyond the existing proposal
and the explicit lifecycle endpoints above. Backend-created Recent Activity means
the frontend no longer POSTs `/activities`.
