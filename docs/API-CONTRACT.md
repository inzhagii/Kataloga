# Kataloga — Proposed API Contract

> **STATUS: PROPOSED API CONTRACT**
>
> This document describes the *conceptual* API contract the Kataloga frontend
> is ready to integrate with. There is **no confirmed production backend**
> yet, and no endpoint here is final. The frontend runs in mock mode by
> default; the API adapters in `src/services/adapters/api/` implement this
> proposal and are activated with `VITE_DATA_SOURCE=api`.
>
> When a real backend contract is defined, update this document and the
> adapters — the rest of the frontend does not change.
>
> **How to read this document — three distinct categories:**
>
> - **A. Confirmed/approved product requirements:** locked Kataloga
>   requirements (see `PRODUCT.md`) stated as expected product behavior,
>   e.g. the product lifecycle, SOLD_OUT semantics, and Auto Archive rules.
> - **B. Current frontend implementation facts:** what the frontend
>   adapters implement *today* (e.g. which `?status=` query values
>   `productApi.js` supports). These are frontend facts only; they are
>   **not** evidence that the backend contract is limited to them. The
>   backend remains authoritative for actual transport, enums, fields,
>   transitions, API paths, scheduler behavior, and error codes.
> - **C. Backend-dependent / open contract items:** marked
>   `> **Backend confirmation needed:** ...`. These are proposals/open
>   decisions, never a finalized backend implementation.

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

## 2. Errors

Uniform error body:

```json
{ "code": "STORE_ID_TAKEN", "message": "Store ID sudah digunakan." }
```

HTTP status → frontend `ApiError.type`:

| Status | type         |
| ------ | ------------ |
| 400, 422 | `validation` |
| 401    | `unauthorized` |
| 403    | `forbidden`  |
| 404    | `not_found`  |
| 409    | `conflict`   |
| 5xx    | `server`     |
| network failure | `network` |
| malformed body | `parse` |

UI shows `error.message`; raw stack traces are never exposed.

## 3. Authentication (`authService`)

- `POST /auth/login` — `{ email_or_phone, password }` → user DTO
- `POST /auth/register` — `{ email_or_phone, password, name? }` →
  `{ user, requires_verification, identifier, channel }`
- `GET /auth/me` — session account; `404`/`401` means guest → user DTO | null
- `PATCH /auth/me` — `{ name?, email?, phone?, avatar_url? }` → user DTO
- `POST /auth/logout`

Email-verification + password endpoints (implemented frontend-side against the
mock; **endpoint names/shapes are proposals pending backend confirmation**):

- `POST /auth/email/verify` — `{ email, code }` → user DTO
- `POST /auth/email/verify/resend` — `{ email }` → `{ expires_at, cooldown_seconds }`
- `POST /auth/password/otp` — `{ email }` → `{ expires_at, cooldown_seconds }`
- `POST /auth/password/otp/verify` — `{ email, code }` → `{ verified }`
- `POST /auth/password` — `{ current_password, new_password }` → `{ ok }`
- `POST /auth/password/forgot` — `{ email_or_phone }` → generic `{ ok }`
  (must never reveal whether the identifier exists)
- `POST /auth/password/reset` — `{ email_or_phone, code, password }` → `{ ok }`
- `POST /auth/recovery-email/otp` — `{ email }` → `{ expires_at, cooldown_seconds }`
- `POST /auth/recovery-email/verify` — `{ email, code }` → user DTO

User DTO:

```json
{ "id": 1, "email": "a@b.co", "phone": "621234567890", "name": "Toko",
  "has_store": true, "store_id": "toko-komputer-jaya", "avatar_url": null,
  "email_verified": true, "recovery_email": null, "recovery_email_verified": false }
```

- Backend owns credentials/authorization. The frontend never stores passwords
  or fakes tokens; dev mock credentials are mock-only.
- Token strategy (cookie or Bearer) is backend-defined; the client supports a
  configurable `Authorization: Bearer` header via `apiClient.setAccessToken`.
- Any `401` clears the local session (`apiClient.setUnauthorizedHandler` →
  AuthProvider), sending protected routes back to `/login`.

Account activation:

- Register via **email**: account is active after email verification. Until
  then `login` fails with an `email_unverified` code and the client routes to
  `/verify-email`.
- Register via **phone**: account is active immediately (no verification),
  and a recovery email is required before password recovery / change-password.

OTP rules (LOCKED): 6 digits, 10-minute expiry, max 5 attempts, 60-second
resend cooldown. The backend must enforce all four; the frontend only renders
the cooldown/expiry UX and forwards backend errors. OTP codes are never logged
or placed in the URL.

> **Backend confirmation needed:** exact register payload for email vs. phone
> variants, whether the email-verification and recovery-email flows use a code
> (OTP) or a magic link, the response fields for `expires_at`/`cooldown_seconds`,
> and the shape of the short-lived proof returned by
> `POST /auth/password/otp/verify` that authorizes `POST /auth/password`.

## 4. Store (`storeService`)

- `GET /stores/me` → store DTO | null
- `GET /stores/{storeId}` → store DTO | null (public)
- `GET /stores/availability?store_id=...` → `{ "available": boolean }`
- `POST /stores` — `{ name, store_id }` → store DTO (creates store, session becomes owner)
- `PATCH /stores/me` — partial store DTO fields → store DTO

Store DTO:

```json
{ "store_id": "toko-komputer-jaya", "name": "Toko Komputer Jaya",
  "logo_url": null, "description": "...", "city": "Bandung",
  "province": "Jawa Barat", "full_address": null,
  "operating_hours": "Senin - Sabtu, 09.00 - 18.00",
  "whatsapp": "6281234567890",
  "channels": [ { "name": "Shopee", "url": "https://..." } ],
  "verified": true,
  "announcement": { "title": "...", "message": "...", "is_enabled": true },
  "auto_archive_days": 30,
  "last_store_id_change": "2026-01-15T00:00:00.000Z", "created_at": "..." }
```

Announcement is a single object (`title`, `message`, `is_enabled`), not an array.

A disabled announcement (`is_enabled: false`) is saved but not rendered on the storefront.

`auto_archive_days` is the store-level Auto Archive setting. The locked Kataloga
value set is: "Tidak ada" (default, auto archive off), 1, 7, 30, 90, 180, 365
days, or "Never" (auto archive off but manual archive still allowed).

> **Backend confirmation needed:** field name/default for Auto Archive and
> whether "Never"/"Tidak ada" is represented as `null`, `0`, or a separate flag;
> how a setting change is applied to SOLD_OUT products with elapsed durations.
> The default store value is "Tidak ada" (auto archive off). UI location: the
> Auto Archive setting lives on the Archive page (/seller/products/archived),
> not on My Store — this is a frontend placement decision and does not change
> the store DTO.

Rules enforced by the backend:

- 1 account = max 1 store (409 on duplicate).
- Store ID: required, unique, human-readable, trimmed.
  Format: lowercase letters, digits, and hyphens only; starts and ends with an
  alphanumeric character; no consecutive hyphens.
- Availability Store ID must be re-checked on submit.
- Store ID change allowed at most once per 30 days (409 with message while cooling down).
- Store ID change re-keys owning products, custom categories, interests, and
  the account reference atomically.
- All historical Store IDs remain valid aliases that redirect to the current
  store (backend-owned; the frontend never maintains its own alias map).

> **Backend confirmation needed:** exact format/validation source of truth
> (regex), the province/city master-data source, and the storage representation
> of `province` / `city` / `full_address` (e.g. stored per store; scoped
> dropdowns in UI only). Historical Store ID alias resolution (storage +
> redirect semantics) is backend-owned.

## 5. Product (`productService`)

- `GET /stores/{storeId}/products` → product DTO[] (public catalog listing)
  - Listing contains **PUBLISHED** plus **SOLD_OUT** products still within the
    store-level auto archive window.
  - Ordering: Featured Published → newer Published → older Published →
    Sold Out.
- `GET /stores/{storeId}/products/{productId}` → product DTO | null (public;
  PUBLISHED or SOLD_OUT still within the auto archive window only)
- `GET /products?status=active` → seller products (session-scoped)
  - `active` = **PUBLISHED only**.
- `GET /products?status=archived` → ARCHIVED products (separate list)

> **Seller management lists — frontend adapter (implemented today):**
> `src/services/adapters/api/productApi.js` currently only implements these
> two query values:
>
> - `status=active` → PUBLISHED products (Active Products)
> - `status=archived` → ARCHIVED products
>
> There is **no adapter implementation** for a `draft` or `sold_out` query
> value, and no separate endpoint for those lists.
>
> These are **frontend implementation facts (category B)**. They are **not**
> evidence that the backend contract only supports these values — the
> backend remains authoritative for the actual query/enum/API behavior.

> **Seller management lists — proposed, backend confirmation required:**
> the seller Products page surfaces PUBLISHED, DRAFT, and SOLD_OUT in one
> management list. Whether the backend exposes DRAFT and SOLD_OUT as separate
> `?status=` values (`draft`, `sold_out`) or returns the seller management
> set containing them is **not finalized** and needs backend confirmation.
> Do not treat `status=draft` or `status=sold_out` as implemented.
- `GET /products/{productId}` → seller product by ID (any status)
- `POST /products` — product DTO → product DTO (store from session)
- `PATCH /products/{productId}` — partial product DTO → product DTO
- `POST /products/{productId}/publish`
- `PATCH /products/{productId}/featured`
- `POST /products/{productId}/archive`
- `POST /products/{productId}/restore`

Product DTO:

```json
{ "id": 20, "store_id": "toko-komputer-jaya", "name": "Laptop Asus",
  "images": ["https://..."], "main_image": "https://...",
  "category": "Laptop", "brand": "Asus", "condition": "NEW",
  "price": "Rp 8.500.000", "price_value": 8500000,
  "details": [ { "label": "RAM", "value": "16 GB" } ],
  "description": "...", "external_links": [ { "name": "Shopee", "url": "..." } ],
  "status": "PUBLISHED", "featured": false,
  "created_at": "...", "updated_at": "...",
  "published_at": "...", "sold_out_at": null,
  "archived_at": null }
```

> **Backend confirmation needed:** `sold_out_until` is no longer a per-product
> field. The auto archive boundary is derived from the store-level Auto Archive
> setting and the product's elapsed SOLD_OUT duration. The frontend uses the
> status returned by the API; the exact shape of an auto-archive deadline on the
> product DTO (if the backend exposes one) is open.

Lifecycle (backend-enforced):

- `DRAFT → PUBLISHED`
- `PUBLISHED → SOLD_OUT`
- `SOLD_OUT → PUBLISHED` (reactivation). **Never** `SOLD_OUT → DRAFT`.
- `PUBLISHED → ARCHIVED`
- `DRAFT → ARCHIVED`
- `ARCHIVED → DRAFT` (restore). **Never** `ARCHIVED → PUBLISHED`.
- Publish validation: name, ≥1 photo, category, details, description,
  condition, price. Custom attributes are never required.
- SOLD_OUT is a product *lifecycle status*, not an availability field.
- Auto Archive is a store-level setting with the locked value set: "Tidak ada"
  (default, off) / 1 / 7 / 30 / 90 / 180 / 365 days / "Never" (off but manual
  archive still allowed). A SOLD_OUT product becomes ARCHIVED once it exceeds
  the store threshold and disappears from the catalog. Reactivation before the
  threshold returns it directly to PUBLISHED.
- Product Unggulan (featured): boolean attribute, max 10 per store. A product
  may be featured/unfeatured only while PUBLISHED. DRAFT and ARCHIVED are never
  featured. A PUBLISHED product that becomes SOLD_OUT automatically loses
  featured (`featured=false`). Reactivating SOLD_OUT to PUBLISHED does **not**
  automatically restore featured.
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

> **Backend confirmation needed:** the transport for marking a product SOLD_OUT
> (PATCH on status vs. a dedicated endpoint) and for reactivating SOLD_OUT to
> PUBLISHED; the exact `?status=` value semantics for the seller management
> lists (separate `draft` / `sold_out` query values vs. a management set
> containing them — the frontend adapter only implements `active` and
> `archived` today; see the notes above). Whether seller category filtering
> (`/seller/products?category=...`) is performed server- or client-side also
> needs backend confirmation.

## 6. Category (`categoryService`)

- `GET /categories` → default + current-store custom categories (session-scoped)
- `POST /categories` — `{ name, parent_id? }` → category DTO
- `PATCH /categories/{categoryId}` — `{ name?, parent_id? }` → category DTO
- `DELETE /categories/{categoryId}` → `{ "deleted": true }`

Category DTO:

```json
{ "id": 7, "name": "Gaming", "parent_id": null, "store_id": "toko-komputer-jaya", "custom": true }
```

Rules:

- Max two levels (Kategori Utama → Sub Kategori); parent_id must reference a
  level-1 category. User-facing terminology: "Kategori Utama" / "Sub Kategori".
- One product = one category (product stores the category name).
- Custom categories are store-scoped; default categories are shared.
- Seller can create a level-1 category directly from the category form.
- Delete is blocked (409) while products reference the category or it has
  subcategories. No cascade delete.
- Store Link is derived from the current Store ID and shown in My Store; the
  storefront never displays the raw Store ID.

## 6.1 Brand (`brandService`)

- `GET /brands` → current-store brands (session-scoped)
- `POST /brands` — `{ name }` → brand DTO
- `PATCH /brands/{brandId}` — `{ name? }` → brand DTO
- `DELETE /brands/{brandId}` → `{ "deleted": true }`

Brand DTO:

```json
{ "id": 3, "name": "Asus", "store_id": "toko-komputer-jaya" }
```

Rules:

- Brand is optional and separate from Category; no decorative icon per brand.
- Brands are store-scoped. One product references at most one brand, by name:
  `product.brand` stores the brand name (same name-keyed join as
  `product.category`).
- Duplicate brand name within the same store is rejected.
- Renaming a brand propagates to the current store's products that reference
  the old name (mock behavior; see confirmation note).
- Delete is blocked (409) while any current-store product references the brand.
  No cascade delete and no silent detach.
- Brand Management is a section inside `/seller/categories` (Kategori | Brand);
  no additional route.
- Card grid: desktop 4 columns, mobile 2; each card shows name, usage count,
  Edit, Lihat Produk. "Lihat Produk" applies the brand filter on
  `/seller/products?brand={brandId}`.
- Seller can create a brand directly from Add/Edit Product (same brand list).

> **Backend confirmation needed:** the brand endpoints above are proposed for
> M11 and are not implemented; the frontend runs on mock brand data. Whether
> brand rename propagates to products server-side, whether delete usage counting
> includes ARCHIVED products, and the exact `?brand=` query semantics on
> `/seller/products` (server- vs client-side) need backend confirmation.

## 7. Customer Interest (`customerInterestService`)

- `GET /stores/{storeId}/customer-interests` → interest DTO[], newest first
- `POST /customer-interests` — record interest → interest DTO

```json
{ "id": 9, "store_id": "toko-komputer-jaya", "product_id": 20,
  "product_name": "Laptop Asus", "channel_type": "MARKETPLACE_CLICK",
  "channel": "Shopee", "external_url": "https://...",
  "customer_name": "Budi", "customer_email": null,
  "customer_phone": "6281234567890", "context": "Product Detail",
  "date": "..." }
```

| Field | Notes |
| --- | --- |
| `customer_name` / `customer_email` / `customer_phone` | Identity snapshot at record time. A missing name MUST NOT be coerced to a placeholder like `"-"`; the UI falls back name → email → phone, and displays nothing when no identity exists. |
| `context` | Storefront context where the interaction happened: `"Store Landing"` or `"Product Detail"`. Stored with the event so historical records never have their context inferred from the current route. |
| `channel` / `external_url` | Snapshot of the selected channel. Records keep rendering even after the seller removes the channel from the store configuration. |

Rules:

- Only `WHATSAPP_CLICK` and `MARKETPLACE_CLICK`.
- Requires authentication (guest must log in before a record is created).
- Customer identity uses `email` and/or `phone` from the session; no uploaded
  customer avatar in V1 (generic user-circle icon on UI).
- Marketplace records must store the selected channel (`channel`).
- Never records product view / share / login / store visit.
- Repeated clicks create individual records (no dedup).
- Total Interest = total interaction records, not unique customers.
- `store_id` is always the target store.
- **Self-store exclusion:** the store owner's own clicks on their own storefront
  are never recorded. The frontend must avoid sending them; the backend is
  expected to enforce this too. Ownership is resolved from the authenticated
  session (`user.storeId`), never from the mock store list.
- Frontend derives the storefront link for a product detail
  (`/{storeId}/product/{productId}/{slug}`) from the interest record.

## 8. Recent Activity (`activityService`)

- `GET /activities` → activity DTO[], newest first
- `POST /activities` — `{ type, message, product_id?, product_name? }` → activity DTO

Activity DTO:

```json
{ "id": 6, "store_id": "toko-komputer-jaya", "type": "PRODUCT_PUBLISHED",
  "message": "Laptop Asus berhasil dipublikasi ke katalog.",
  "product_id": 20, "product_name": "Laptop Asus", "date": "..." }
```

- Allowed types: `PRODUCT_PUBLISHED`, `PRODUCT_EDITED`, `PRODUCT_SOLD_OUT`,
  `PRODUCT_REACTIVATED`, `PRODUCT_ARCHIVED`, `PRODUCT_RESTORED`,
  `STORE_UPDATED`.
- `PRODUCT_UPDATED` is accepted as the external wire alias for
  `PRODUCT_EDITED`; the adapter maps it deterministically to the internal
  canonical value. No other aliases are assumed (pending backend confirmation).
- `product_id` / `product_name` are the related product snapshot for product
  events and null for store-level events (`STORE_UPDATED`).
- The Dashboard shows the 4 newest activities; "Lihat Semua" opens
  `/seller/activities`.
- Never mixed with Customer Interest.
- `POST /activities` only happens as part of the actions above (e.g. on
  successful publish, product save, store save); it is **not** a generic
  endpoint for UI events.
- The full list page at `/seller/activities` is a **frontend route only**; it
  reuses `GET /activities` and does not require a new endpoint.
- Date display is the canonical `DD.MM.YYYY` (`12.09.2026`, no weekday, no
  month name), derived from the raw timestamp at render time — timestamps are
  never mutated for display. Single-date filtering uses a local calendar-day
  comparison (`src/utils/datetime.js#filterBySingleDate`), not a date range.

> **Backend confirmation needed:** activity DTO `date` is returned as the
> display date (`12.09.2026`, no weekday); whether the dashboard 4-item slice
> is served by the backend or derived client-side, and whether `/seller/activities`
> filtering (type/single-date) is server- or client-side. Whether the backend
> accepts the `product_id`/`product_name` snapshots and the `PRODUCT_UPDATED`
> alias on activity POST. Whether the backend accepts the `context`,
> `customer_name`, `customer_email`, `customer_phone` snapshots on the
> customer-interest POST, and whether the session or the request body is the
> source of truth for identity.

## 9. Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `VITE_DATA_SOURCE` | `mock` | `mock` (in-memory dev data) or `api` (adapters above) |
| `VITE_API_BASE_URL` | (empty) | API base; empty = same origin as frontend |

## 10. Backend integration status

- Mock mode: fully working, default.
- API mode: contract-ready; **no backend exists yet**, so API calls cannot
  succeed. Activated via `VITE_DATA_SOURCE=api` only once a backend is
  available and this contract is finalized.

### 10.1 Doc-level decisions pending backend confirmation

These points changed the *contract document* to match the finalized Kataloga
requirements, but the actual backend behavior needs confirmation:

1. `GET /products?status=` semantics: the frontend adapter implements
   `active` = PUBLISHED only and `archived`. Whether DRAFT and SOLD_OUT are
   exposed as separate `?status=` values (`draft`, `sold_out`) or returned as
   part of the seller management set needs backend confirmation.
2. Store-level Auto Archive (values: "Tidak ada" default / 1 / 7 / 30 / 90 /
   180 / 365 days / "Never"; "Tidak ada" and "Never" both leave auto archive
   off but never block manual archive) expiry → ARCHIVED is backend-owned
   scheduling; transport for marking SOLD_OUT and reactivating to PUBLISHED
   (PATCH on status vs. a dedicated endpoint); wire representation of the
   "Tidak ada"/"Never" value (`null`, `0`, or a separate flag) and whether the
   auto-archive deadline is exposed on the product DTO.
3. Product Unggulan lifecycle (locked product rule): SOLD_OUT clears
   `featured=false`; reactivation does not restore it. The backend is expected
   to enforce the max-10 and lifecycle rules for featured.
4. Province/City master data: source endpoint and per-store storage shape for
   `province`, `city`, `full_address`; display order "City, Province".
5. Seller category filtering by `?category=` on `/seller/products`: server-side
   query vs. client-side filter.
6. `/seller/activities` reuses `GET /activities` (frontend route, no new API);
   whether dashboard 4-item slice and activity filtering (type/single-date) are
   server- or client-side.
7. Store ID format is enforced by the backend; frontend mirrors the same
   validation but never replaces it.
8. Historical Store ID alias resolution + redirect semantics (backend-owned).
9. `operating_hours` stays a wire string in the contract; the frontend may use
   a structured editor (Hari Mulai / Hari Selesai / Jam Buka / Jam Tutup) that
   composes the wire string — the storage shape needs backend confirmation.
10. Announcement storage shape (single `{ title, message, is_enabled }` object).
11. Account activation variants (email verification vs. phone active immediately
    with recovery email), and change-password flow requiring current email first.
12. Public product detail route is `/{storeId}/product/{productId}/{slug}`;
    the product DTO currently has no `slug` field. Whether the slug is derived
    client-side from the Product Name or exposed by the backend product DTO is
    open.
13. Brand endpoints (`/brands`) and brand behavior: store scoping, duplicate
    rejection, rename propagation to `product.brand`, delete usage counting
    (including ARCHIVED products), and whether the brand filter on
    `/seller/products?brand=` is server-side. Frontend uses mock brand data
    until confirmed (M11).

No new endpoints were invented in this document beyond the existing proposal.