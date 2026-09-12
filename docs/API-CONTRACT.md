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
- `POST /auth/register` — `{ email_or_phone, password, name? }` → user DTO
- `GET /auth/me` — session account; `404`/`401` means guest → user DTO | null
- `PATCH /auth/me` — `{ name?, email?, phone?, avatar_url? }` → user DTO
- `POST /auth/logout`

User DTO:

```json
{ "id": 1, "email": "a@b.co", "phone": "621234567890", "name": "Toko",
  "has_store": true, "store_id": "toko-komputer-jaya", "avatar_url": null }
```

- Backend owns credentials/authorization. The frontend never stores passwords
  or fakes tokens; dev mock credentials are mock-only.
- Token strategy (cookie or Bearer) is backend-defined; the client supports a
  configurable `Authorization: Bearer` header via `apiClient.setAccessToken`.

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
  "verified": true, "announcement": ["..."],
  "last_store_id_change": "2026-01-15T00:00:00.000Z", "created_at": "..." }
```

Rules enforced by the backend:

- 1 account = max 1 store (409 on duplicate).
- Store ID: required, unique, human-readable, trimmed.
  Format: lowercase letters, digits, and hyphens only; starts and ends with an
  alphanumeric character; no consecutive hyphens.
- Availability Store ID must be re-checked on submit.
- Store ID change allowed at most once per 30 days (409 with message while cooling down).
- Store ID change re-keys owning products, custom categories, interests, and
  the account reference atomically.

> **Backend confirmation needed:** exact format/validation source of truth
> (regex), the province/city master-data source, and the storage representation
> of `province` / `city` / `full_address` (e.g. stored per store; scoped
> dropdowns in UI only).

## 5. Product (`productService`)

- `GET /stores/{storeId}/products` → published products (public)
- `GET /stores/{storeId}/products/{productId}` → product DTO | null (public, published only)
- `GET /products?status=active` → seller products (session-scoped)
  - `active` = **PUBLISHED only**. SOLD_OUT, DRAFT, and ARCHIVED are separate
    lists. See "backend confirmation needed" note below.
- `GET /products?status=archived` → ARCHIVED products (separate list)
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
  "status": "PUBLISHED", "featured": false, "created_at": "...", "updated_at": "..." }
```

Lifecycle (backend-enforced):

- `DRAFT → PUBLISHED → SOLD_OUT → PUBLISHED`
- `PUBLISHED → ARCHIVED`
- `ARCHIVED → DRAFT` (restore). **Never** `ARCHIVED → PUBLISHED`.
- Publish validation: name, ≥1 photo, category, details, description,
  condition, price. Custom attributes are never required.
- SOLD_OUT is a product *lifecycle status*, not an availability field.
- Active/catalog endpoints return PUBLISHED products only; SOLD_OUT and DRAFT
  are seller-management areas.
- No SKU / inventory / stock / orders on V1.

> **Backend confirmation needed:** the transport for marking a product SOLD_OUT
> and back to PUBLISHED (PATCH on status vs. dedicated endpoint), and the exact
> `?status=` value semantics (`active`, `draft`, `sold_out`, `archived`).
> What is whether seller category filtering (`/seller/products?category=...`)
> is performed server- or client-side also needs backend confirmation.

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

## 7. Customer Interest (`customerInterestService`)

- `GET /stores/{storeId}/customer-interests` → interest DTO[], newest first
- `POST /customer-interests` — record interest → interest DTO

```json
{ "id": 9, "store_id": "toko-komputer-jaya", "customer_name": "Budi Santoso",
  "customer_id": 3, "product_id": 20, "product_name": "Laptop Asus",
  "channel_type": "MARKETPLACE_CLICK", "channel": "Shopee",
  "external_url": "https://...", "date": "..." }
```

Rules:

- Only `WHATSAPP_CLICK` and `MARKETPLACE_CLICK`.
- Requires authentication (guest must log in before a record is created).
- Marketplace records must store the selected channel (`channel`).
- Never records product view / share / login / store visit.
- Repeated clicks create individual records (no dedup).
- Total Interest = total interaction records, not unique customers.
- `customer_name` is derived from the session; `store_id` is always the target store.
- Frontend derives the storefront link for a product detail
  (`/stores/{storeId}/products/{productId}`) from the interest record.

## 8. Recent Activity (`activityService`)

- `GET /activities` → activity DTO[], newest first
- `POST /activities` — `{ type, message }` → activity DTO

Activity DTO:

```json
{ "id": 6, "type": "PRODUCT_PUBLISHED", "message": "Laptop Asus berhasil dipublikasi ke katalog.", "date": "..." }
```

- Allowed types: `PRODUCT_PUBLISHED`, `PRODUCT_EDITED`, `STORE_UPDATED`.
- Never mixed with Customer Interest.
- The full list page at `/seller/activities` is a **frontend route only**; it
  reuses `GET /activities` and does not require a new endpoint.

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

1. `GET /products?status=` semantics: `active` = PUBLISHED only; DRAFT,
   SOLD_OUT, ARCHIVED as separate status values.
2. Transport for SOLD_OUT ↔ PUBLISHED transitions (PATCH on status vs. a
   dedicated endpoint).
3. Province/City master data: source endpoint and per-store storage shape for
   `province`, `city`, `full_address`; display order "City, Province".
4. Seller category filtering by `?category=` on `/seller/products`: server-side
   query vs. client-side filter.
5. `/seller/activities` reuses `GET /activities` (frontend route, no new API).
6. Store ID format is enforced by the backend; frontend mirrors the same
   validation but never replaces it.

No new endpoints were invented in this document beyond the existing proposal.