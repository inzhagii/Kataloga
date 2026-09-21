# Kataloga — FRONTEND ↔ BACKEND HANDOFF

> **FRONTEND HANDOFF STATUS: READY FOR BACKEND PLANNING**
> provided that all items marked `API DEPENDENCY / CONFIRMATION REQUIRED` in
> Section 19 are explicitly resolved by the backend developer before
> implementation.

This document is the **final frontend-side expectation** for the Kataloga
Laravel backend. It is a **HANDOFF**, not a Laravel implementation plan.

- Frontend implementation is NOT part of this task.
- Laravel implementation is NOT part of this task.
- No source code changes were made.
- No tests were changed.
- No commit/push was made.

---

## Contents

1. Executive Summary
2. Frontend Architecture Expectation
3. Authentication Contract
4. Store / Account Contract
5. Operating Hours
6. Categories
7. Brands
8. Product Data Contract
9. Product Lifecycle
10. Featured
11. Auto Archive
12. Public Storefront
13. WhatsApp / External Sales Channels
14. Customer Interest
15. Recent Activity
16. Search / Filter / Sort / Pagination
17. API Response Contract
18. Ownership / Security
19. API Dependencies / Confirmation Required
20. Backend Acceptance Checklist
21. Final Handoff Status

---

## 1. Executive Summary

Kataloga is a catalog/storefront platform, **not** a transaction platform:

- No checkout, cart, payment, orders, or inventory/stock quantity.
- Customers browse a catalog and connect to the seller's external sales
  channels (WhatsApp / marketplace links).

Kataloga is currently **frontend only**, built as a React/TypeScript SPA with a
mock data layer. The frontend is ready to be integrated with a Laravel REST API
(Laravel Sanctum session authentication) being built separately by the backend
developer.

Principles:

- **The frontend is NOT the source of truth** for ownership, authorization,
  product lifecycle, featured-limit enforcement, validation, or security. The
  backend is authoritative for all of these.
- The frontend **consumes** documented API responses and states; it does not
  fabricate success and does not persist authorization state client-side.
- The frontend must **not rely on mock application data in production**. Mock
  data exists only for development and isolated tests. API failures must surface
  as loading/error/empty/retry states — never a silent fallback to mock data.

The backend developer should use this handoff **together with** the reconciled
docs:

- `docs/API-CONTRACT.md` — frontend-facing API contract (Phase A reconciled)
- `docs/BACKEND-DEPENDENCIES.md` — backend dependency register + section 7
  "API Dependencies / Confirmation Required" (Phase A reconciled)
- `docs/PRODUCT.md` — product/lifecycle/interest requirements (locked)
- `docs/UX-FLOW.md` — user flows (locked)
- `docs/ROUTES.md` — routing (locked)
- `docs/UI_RULES.md` — UI rules / visual structure (locked)
- `AGENTS.md` — project-wide rules incl. §1.5 Authentication & API Transport, §16 External Sales Channels, §19 Customer Interest, §20 Recent Activity

This document does **NOT** specify Laravel implementation details unless required
to define the API contract expected by the frontend.

---

## 2. Frontend Architecture Expectation

Expected frontend integration architecture:

```text
React Page / Component
      ↓
Service (frontend-facing domain operations)
      ↓
API Adapter (maps backend DTO ↔ frontend models)
      ↓
HTTP Client (credentials, CSRF, envelope, 401/419 handling)
      ↓
Laravel REST API
```

Clarifications:

- **React components must not directly own backend business logic.** Business
  rules live in the service layer; the backend remains the final authority.
- **Services** handle frontend-facing domain operations (validation mirroring,
  state decisions, redirect sequencing for WhatsApp/marketplace).
- **API adapters** map backend DTOs to frontend models where required (camelCase
  ↔ snake_case, envelope unwrapping, date formatting). Mapping must stay in the
  adapter, not the components.
- **Backend remains authoritative.** Ownership, authorization, lifecycle, and
  validation are backend-owned; the frontend only mirrors what the backend
  requires for UX.
- **No fabricated success.** If an API call fails, the frontend must reflect
  failure — never synthesize a success response.
- **Proper data-driven states.** Every data-driven page/task must consider
  loading, error, empty, and (where sensible) retry states.
- **No production mock-data fallback.** `VITE_DATA_SOURCE=mock` is a
  dev/test-only mode. There is no silent fallback from API mode to mock.

---

## 3. Authentication Contract

Transport (locked in `AGENTS.md` §1.5 and `docs/API-CONTRACT.md` §3):

- **Laravel Sanctum session authentication.** Cookie-based session.
- `credentials: 'include'` so the session cookie is sent.
- **CSRF protection**: bootstrap with `GET /sanctum/csrf-cookie`, then send the
  CSRF token via the `X-CSRF-TOKEN` header on state-changing requests.
- **No JWT.** No Bearer token. No localStorage auth token. No access-token
  module state as the production authentication mechanism.
- **419 handling must be defined.** Laravel returns HTTP 419 for expired/CSRF
  session. The frontend treats 419 (session expired) by returning the user to
  `/login`. 401 = session invalid on protected requests. The exact distinction
  the backend will return must be defined (see §19 #1, #17).
- Authentication context must survive login/register flows already supported by
  the frontend (context preservation for guest WhatsApp/marketplace actions and
  protected seller routes).

Auth capabilities the frontend expects:

- **login**
- **register** (email verification variant + phone variant; see #17)
- **email verification / OTP** where applicable (verify code, resend code with
  `expires_at`/`cooldown_seconds`)
- **current authenticated user** (`/auth/me`)
- **logout**
- **password recovery** (forgot / reset, enumeration-safe generic response)
- **password change** (requires current password; OTP proof for change-password
  flow)
- **account activation / recovery flows** (phone-registered accounts require a
  verified recovery email before recovery / change-password)

Exact endpoint paths may remain unconfirmed:

`API DEPENDENCY / CONFIRMATION REQUIRED` — exact Sanctum auth/CSRF route paths,
exact login/register/logout/me paths, register payload for email vs. phone
variants, OTP vs. magic link for verification/recovery, and the shape of the
short-lived proof authorizing password change.

Do not invent paths.

---

## 4. Store / Account Contract

Rules:

- **One account may own at most one store.** Duplicate store creation is
  rejected (backend, e.g. 409).
- **Backend determines store ownership.** The backend derives ownership from the
  authenticated session. The frontend never uses a client-supplied `store_id`
  as an authorization source.
- **Numeric database identity is separate from the public `store_id`:**
  - numeric `store.id` = database identity
  - `store_id` = public, human-readable, URL identifier
- The storefront only ever displays the current `store_id`; historical aliases
  redirect on the backend (see below).

Public `store_id` rules:

- lowercase a-z
- digits 0-9
- hyphen (`-`) allowed
- **maximum 50 characters**
- **unique**
- uppercase normalized to lowercase
- trimmed
- may not start or end with a hyphen; no consecutive hyphens
- **change cooldown: once every 30 days**
- when changed, the **previous Store ID remains a valid alias** that redirects
  to the current store for **90 days**, then expires
- **old aliases may become reusable after expiry** (not permanent)
- **child records must not be re-keyed** — the store identity is the numeric
  `store.id`; a store ID change must not re-key products/categories/interests
  against the display id (backend behavior; confirmed in `docs/PRODUCT.md` §3).

Store profile fields (mapped to the reconciled wire DTO from
`docs/API-CONTRACT.md` §4):

| Logical field | Wire DTO field | Optional? |
| --- | --- | --- |
| store name | `name` | Required (create only needs name + store_id) |
| store id | `store_id` | Required |
| logo | `logo_url` | Optional |
| bio / description | `description` | Optional |
| whatsapp | `whatsapp` | Optional (dedicated field, see §13) |
| province | `province` | Optional |
| city / regency | `city` | Optional |
| physical address | `full_address` | Optional |
| operating hours | `operating_hours` | Optional (see §5) |
| auto archive | `auto_archive_days` | Optional (`null` = Never) (see §11) |
| announcement | `announcement` | Optional — single object `{ title, message, is_enabled }` (see §4 note) |
| external channels | `external_links` | Optional — `[{ platform_name, store_url }]` (see §13) |

Notes:

- Create Store requires only **Store Name** and **Store ID**. All other fields
  are optional and completed later.
- `announcement` is a **single object** (`{ title, message, is_enabled }`), not
  an array. A disabled announcement (`is_enabled: false`) is saved but not
  rendered.
- **Empty optional fields are hidden on the public storefront** rather than
  fabricated. The storefront never shows a placeholder derived from an empty
  value (e.g. it does not display empty logos, empty addresses, or fake
  "Store ID" text).

---

## 5. Operating Hours

Backend/frontend expectation:

- **One continuous operating range only.**
- Expected logical fields:
  - start day (Hari Mulai)
  - end day (Hari Selesai)
  - open time (Jam Buka)
  - close time (Jam Tutup)
- **No** per-day schedule, split shifts, or multiple ranges in V1.

Wire contract (`docs/API-CONTRACT.md` §4 and §10.1 #9):

- The reconciled store DTO currently carries `operating_hours` as a **wire
  string** (e.g. `"Senin - Sabtu, 09.00 - 18.00"`).
- The frontend may use a **structured editor** (Hari Mulai / Hari Selesai /
  Jam Buka / Jam Tutup) that composes the wire string; the storage shape on the
  backend needs confirmation.

`API DEPENDENCY / CONFIRMATION REQUIRED` — exact wire representation of the
structured operating-hours fields (single string vs. separate fields) and the
exact transport naming.

---

## 6. Categories

Rules:

- **Maximum depth = 2.** Level 1 = Kategori Utama (root); Level 2 = Sub Kategori
  (child). No deeper hierarchy on V1.
- **Product has exactly one category** on V1 (product references a category by
  name — same name-keyed convention as brand).
- **Default categories are platform-managed:** they cannot be renamed or deleted
  by sellers, and they are **not** seller-scoped.
- **Custom categories can be created**, scoped to the seller's store.
- **Custom subcategories may use a default root as a parent** (mix is allowed).
- Kategori Utama with children cannot be deleted; categories still referenced by
  products cannot be deleted (no cascade delete; blocked, e.g. 409).
- **Root usage counts aggregate descendants:** e.g. Computer (5) with Laptop (3)
  and Desktop (2) = aggregate usage 5.
- Sellers can create a level-1 category directly from the category form.

Default category seed (**declared backend master-data expectation** — see
Section 19 #21 for confirmation):

```text
Computer
├── Laptop
└── Desktop

Accessories
├── Keyboard
└── Mouse

Networking
├── Router
└── Modem

Mobile
└── Handphone
```

- The frontend **expects category data and usage counts from the backend**.
  Default categories are backend master data; the frontend does **not**
  hardcode production category master data.

`API DEPENDENCY / CONFIRMATION REQUIRED` — see §19 #21 (authoritative V1 category
seed) and usage-count fields (#11).

---

## 7. Brands

Model: **global/default + custom**.

Global/default:

- `store_id` = `null`
- platform-managed (seeded)
- **cannot be edited or deleted by a seller**

Custom:

- store-scoped
- seller-created
- editable / deletable according to backend rules
- **deletion must respect referenced products** — delete is blocked (409) while
  any current-store product still references the brand; no cascade delete, no
  silent detach.

Default V1 master brands (**declared backend master-data expectation** — see
§19 #21):

```text
ASUS
Acer
Lenovo
HP
Dell
Apple
MSI
Samsung
Logitech
Razer
TP-Link
Kingston
```

These are **backend seed/master data, NOT React hardcoded application data**.

Important:

- **Brand is independent from Category.** Do not create a backend
  Brand → Category relationship unless explicitly confirmed separately.
- One product references **at most one brand**, by name
  (`product.brand` joins by name, same convention as `product.category`).
- Duplicate brand name within the same store is rejected.
- Brand Management is a section inside `/seller/categories` (Kategori | Brand),
  not a separate seller route.
- Sellers can create a brand directly from Add/Edit Product (same brand list).
- Brand rename propagation to `product.brand` is backend behavior.

`API DEPENDENCY / CONFIRMATION REQUIRED` — identifier contract
**`brand_id` vs `brand name`** (frontend currently joins by name; the backend may
use an id — see §19 #19), duplicate/rename propagation semantics, and deletion
usage counting (whether ARCHIVED products count).

---

## 8. Product Data Contract

Expected product fields:

| Field | Notes |
| --- | --- |
| `name` | Required for publish |
| `slug` | Canonical URL component; see Slugs below |
| `description` | **Required** for publish |
| `category` | Exactly one; category name (see §6) |
| `brand` | **Optional**; at most one; brand name |
| `condition` | `NEW` or `SECOND` |
| `price` | **DECIMAL**; **`price = 0` is valid** (free) |
| `photos` | Minimum 1, maximum 5; **exactly one main photo** |
| `details` / `attributes` | Product Details (hybrid category-recommended + seller custom); **optional**, never all-required |
| `external_links` | `[{ platform_name, store_url }]`; product-level links (see §13); not rendered on customer Product Detail |
| `status` | DRAFT / PUBLISHED / SOLD_OUT / ARCHIVED (see §9) |
| `featured` | Boolean; Product Unggulan (see §10) |

Rules:

- `description` required (publish validation).
- `condition` = NEW or SECOND only.
- `price` is DECIMAL; `0` is valid (gratis). No stock/quantity concept.
- Minimum 1 photo, maximum 5, exactly one main photo.
- **SKU is not part of the product contract.** No SKU field.
- **Availability is not a separate product field.** SOLD_OUT is a lifecycle
  status, not an availability field. No AVAILABLE/SOLD_OUT availability concept
  on V1, and no stock/quantity/remainingStock/lowStock fields.
- `brand` is optional.
- Product Details / attributes are optional for publish unless already required
  by a confirmed contract.

Slug:

- **Backend DTO should be the source of truth if the backend provides it.**
- Product identity remains the numeric **product ID** (`productId`).
- Public canonical URL:

```text
/{storeId}/product/{productId}/{slug}
```

Example:

```text
/toko-komputer-jaya/product/20/laptop-asus-rog
```

`API DEPENDENCY / CONFIRMATION REQUIRED` — whether slug is exposed on the
product DTO by the backend (expected) or derived client-side (see §19 #18).

---

## 9. Product Lifecycle

Authoritative lifecycle:

```text
DRAFT
  ↓ (publish)
PUBLISHED
  ↓ (mark sold out)
SOLD_OUT
  ↓
ARCHIVED
```

Allowed reactivation:

```text
SOLD_OUT
  ↓ (to draft, for editing before re-publication)
DRAFT
  ↓ (publish)
PUBLISHED
```

Restore:

```text
ARCHIVED
  ↓ (restore)
DRAFT
```

Never:

```text
ARCHIVED → PUBLISHED   (forbidden)
```

Other rules:

- **Do not use a generic `ACTIVE` status.** "Active Products" is a
  dashboard/catalog label for PUBLISHED, not a database status.
- SOLD_OUT products remain visible to customers while within the auto archive
  window (see §11, §12).
- **Do not assume frontend PATCH-status is authoritative.** The frontend
  currently sends lifecycle changes and awaits the backend; the backend must
  expose lifecycle operations and enforce transitions.
- The backend should expose lifecycle operations according to the **final API
  contract**.

`API DEPENDENCY / CONFIRMATION REQUIRED` — **dedicated lifecycle endpoints**
(e.g. publish / sold-out / mark-available / archive / restore) **vs a generic
status PATCH** (see §19 #13). The frontend must follow the final backend
contract once confirmed.

---

## 10. Featured (Product Unggulan)

Rules:

- **Featured is NOT a product status** — it is a boolean attribute on the
  product.
- **Maximum 10 featured products per store.**
- **Backend is authoritative for the limit.**
- Featured applies to products that are **PUBLISHED or SOLD_OUT**.
- **SOLD_OUT keeps its featured state** (progressing to SOLD_OUT does not clear
  featured; reactivation SOLD_OUT → PUBLISHED does not change it).
- **ARCHIVED clears featured** (archiving removes the featured attribute).
- **DRAFT and ARCHIVED can never be featured.**

Frontend behavior:

- May display a count such as "9/10" (Product Unggulan filled), but the backend
  remains authoritative for the limit and lifecycle.

---

## 11. Auto Archive

Store-level setting. Allowed values:

```text
Never  → null (default, off)
1
7
30
90
180
360   (days)
```

- **Do NOT use:** `365` or `"Tidak ada"`.
- Default: `null` / **Never** (auto archive off). Never does **not** block
  manual archive.
- Auto archive applies to **SOLD_OUT** products using `sold_out_at` (elapsed
  SOLD_OUT duration).
- A SOLD_OUT product becomes ARCHIVED once it exceeds the store threshold and
  disappears from the catalog.
- **Changing the setting affects existing SOLD_OUT products** according to
  backend rules (applied to their already-elapsed durations).
- SOLD_OUT products still within the window remain in the active catalog with a
  Sold Out indication.
- Auto archive scheduling is **backend-owned**; the frontend only sends/reads
  the setting value.
- **Frontend UI location:** the Archive page (`/seller/products/archived`),
  **not** My Store.

`API DEPENDENCY / CONFIRMATION REQUIRED` — exact DTO/transport representation
(field name, `null` vs `0` vs flag), and whether an auto-archive deadline is
exposed on the product DTO (see §19 #14).

---

## 12. Public Storefront

Public visibility:

| Status | Public? |
| --- | --- |
| PUBLISHED | Public |
| SOLD_OUT | Public (within auto archive window) |
| DRAFT | Hidden |
| ARCHIVED | Hidden |

Routes:

```text
Store landing:        /{storeId}
Product listing:      /{storeId}/products
Product detail:       /{storeId}/product/{productId}/{slug}
```

Identity:

- Product public identity = numeric **product ID**.
- Store public identity = **`store_id`**.

SOLD_OUT (still within auto archive window):

- product remains viewable
- searchable
- shareable
- product detail page remains accessible
- **WhatsApp / Marketplace contact CTAs are hidden or disabled**
- **Share remains available**

`Do not fabricate store status or unavailable data.`

---

## 13. WhatsApp / External Sales Channels

- **WhatsApp is a dedicated store field** (`whatsapp`), separate from external
  marketplace/sales channels. **Do not merge WhatsApp into the generic
  external-link model.**
- External marketplace/sales channels are a separate list. Conceptual external
  link shape:

```text
{ "platform_name": "Shopee", "store_url": "https://..." }
```

- No persisted link id, no icon/logo, no display order, no description, no
  analytics on external links.
- Marketplace appears on the storefront only if the store has at least one
  external channel. Marketplace is a picker: when the customer presses
  Marketplace, show the configured channels, wait for the channel choice, then
  proceed.

CTA behavior (WhatsApp and Marketplace):

```text
Auth check
  →
guest? preserve context through login/register
  →
POST Customer Interest
  →
only after successful POST
  →
open destination (WhatsApp / exact external URL)
```

- **Do NOT redirect/open the destination before interest recording succeeds.**
- If the interest POST fails, do not redirect.
- WhatsApp/marketplace product-detail action requires the product to be
  publishable context: for SOLD_OUT products these CTAs are disabled (see §12).
- Product view or share must **never** create a Customer Interest.

---

## 14. Customer Interest

This section is critical.

Customer Interest is **aggregated**, not simply a raw per-click frontend
history.

Canonical context:

```text
STORE
PRODUCT
```

- `STORE` = Store Landing context (product_id null).
- `PRODUCT` = Product Detail context (product_id set).

Channel represents destination/action. Examples the frontend currently uses
(lowercase):

```text
whatsapp
shopee
tokopedia
```

- Use only backend-confirmed allowed values (see §19 #5).
- There is **no** `channel_type` field.

Creation:

- Customer Interest is created **ONLY from explicit CTA actions**
  (`WHATSAPP_CLICK` and `MARKETPLACE_CLICK`, with the chosen channel).
- **Do NOT create interest from**: page view, product detail view, browsing,
  search, share, login/logout, store visit, category activity.

Exclusions:

- **Self-store interactions are excluded**: the store owner's own CTA clicks on
  their own storefront are never recorded. The frontend avoids sending them; the
  backend is expected to enforce this too.

Aggregation logical identity:

```text
store
+ customer user
+ product (where applicable)
+ context
+ channel
```

The aggregated record exposes concepts such as:

```text
total_clicks
first_activity_at
last_activity_at
```

- Repeated clicks on the same segment **increment `total_clicks`**, they do not
  create new rows.
- `product_id` may be **nullable** for `STORE` context.
- Identities recorded: customer `email` and/or `phone` from the session.
  Customer has **no uploaded profile photo** on V1 (generic user-circle icon).

Critical flow (backend contract expectation):

1. Check authentication.
2. If guest, preserve context through auth (product URL / selected channel).
3. Authenticate.
4. **POST Customer Interest.**
5. Only after a successful POST, open the WhatsApp/marketplace destination.
6. If the POST fails, do not redirect.

`API DEPENDENCY / CONFIRMATION REQUIRED` — **aggregated rows vs per-click
storage representation** in the API response (the frontend contract requires
aggregated behavior), the exact `channel` value strings, the identity source
(session vs body), and the exact interest list endpoint (see §19 #4, #5).

Backend storage implementation is an implementation detail **unless the API
response requires otherwise**.

---

## 15. Recent Activity

- **Recent Activity is backend-created.**
- **Frontend must NOT create activity records.**
- **There must be no frontend `POST /activities` requirement.**
- The frontend **consumes** activity data from the backend (`GET /activities`).

Canonical types:

```text
PRODUCT_PUBLISHED
PRODUCT_UPDATED
PRODUCT_SOLD_OUT
PRODUCT_REACTIVATED
PRODUCT_ARCHIVED
PRODUCT_RESTORED
STORE_UPDATED
CATEGORY_CREATED
CATEGORY_UPDATED
ANNOUNCEMENT_CREATED
ANNOUNCEMENT_UPDATED
```

- `PRODUCT_UPDATED` is the canonical update type (not "Product Edited").
- Customer Interest activity is never part of Recent Activity.

Frontend consumption supports:

- latest activity (Dashboard shows the 4 newest + "Lihat Semua")
- all activity (`/seller/activities`)
- type filtering
- single-date filtering (date picker; **not** a date range)
- newest-first ordering
- display `DD.MM.YYYY` (e.g. `12.09.2026`, no weekday, no month name)
- datetime display `DD.MM.YYYY · HH:MM` (e.g. `12.09.2026 · 18:02`) where
  datetime is shown

`API DEPENDENCY / CONFIRMATION REQUIRED` — **timestamp/date wire representation**
(raw timestamp vs pre-formatted display string), exact `GET /activities` path
and pagination, and whether the dashboard 4-item slice + type/single-date
filters are server- or client-side (see §19 #6, #7, #20).

---

## 16. Search / Filter / Sort / Pagination

Customer product search is **store-scoped** (searches only within the current
seller's store).

The backend should be the source of truth for:

- search
- category filter
- brand filter
- condition filter
- sort
- pagination

Search may cover:

```text
name
brand
category
description
attributes (product details)
```

- Search is case-insensitive, partial, multi-field, relevance-ranked.
- Filters: category; condition (New / Second). No price filter, no attribute
  filter, no availability filter on V1.
- Sort options: Relevance, Newest, Price Low → High, Price High → Low.
- Catalog ordering: Featured Published → newer Published → older Published →
  Sold Out.
- Seller product list should support **status filtering** according to the final
  backend enum (PUBLISHED / DRAFT / SOLD_OUT / ARCHIVED).
- /seller/products category/brand filters (`?category=`, `?brand=`) use URL
  query as source of truth; whether resolved server- or client-side needs
  backend confirmation.
- **Do not rely on client-side filtering as the production source of truth**
  when backend query support is available/required.

`API DEPENDENCY / CONFIRMATION REQUIRED` — **exact query parameter names**
(search, category, brand, condition, sort, page) and the sort enum values must
be confirmed before frontend integration (see §19 #10).

---

## 17. API Response Contract

Envelope (from `docs/API-CONTRACT.md` §2):

Success (single resource):

```json
{
  "data": {},
  "message": "Success."
}
```

List:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

Validation:

```json
{
  "message": "Validation failed.",
  "errors": {}
}
```

- The frontend API adapter normalizes these responses — **do not duplicate
  envelope parsing logic throughout components.**
- 419 / CSRF / session failure handling must be **defined consistently**: 419 →
  redirect to `/login`; 401 → session invalid handling on protected requests.
- Validation errors are displayed to the user and must not be swallowed.

---

## 18. Ownership / Security

The backend is authoritative for:

- authentication
- authorization
- store ownership
- product ownership
- category ownership
- custom brand ownership
- lifecycle authorization
- featured limit (max 10)
- Customer Interest ownership/security
- validation (final source of truth)

The frontend must **not** rely on any of the following as a security boundary:

- hidden UI
- client-side `store_id`
- local state
- mock data
- route params

All of those are UX affordances only.

---

## 19. API Dependencies / Confirmation Required

Every unresolved dependency collected from `docs/BACKEND-DEPENDENCIES.md`
(section 7), `docs/API-CONTRACT.md` (per-section "Backend confirmation needed"
markers), and the reconciled frontend docs. **Do not invent answers.**

| # | Dependency | Open question for the backend team | Source |
| --- | --- | --- | --- |
| 1 | Sanctum auth/CSRF route | Exact `GET /sanctum/csrf-cookie` path and route paths; CSRF bootstrap applicability; 419 vs 401 semantics | API-CONTRACT §3; BACKEND-DEP §7#1 |
| 2 | Auth endpoint paths | Exact login/register/me/logout/password/recovery paths + request/response DTOs | API-CONTRACT §3; BACKEND-DEP §7#2 |
| 3 | Public storefront endpoints | Exact `GET /stores/{storeId}...` paths; public listing/detail; slug in product DTO | API-CONTRACT §4/§5; BACKEND-DEP §7#3 |
| 4 | Customer Interest list endpoint | Path/pagination for aggregated interest; server-aggregated vs per-record rows | API-CONTRACT §7; BACKEND-DEP §7#4 |
| 5 | Customer Interest aggregation response | Aggregation key; exact `channel` allowed values; `context` values STORE/PRODUCT; identity source (session vs body) | API-CONTRACT §7; BACKEND-DEP §7#5; §14 |
| 6 | Activity endpoint | Exact `GET /activities` path + pagination; dashboard 4-item slice server- or client-side | API-CONTRACT §8; BACKEND-DEP §7#6 |
| 7 | Canonical activity types | Confirm exact enum strings (11 canonical types listed in §15) | API-CONTRACT §8; BACKEND-DEP §7#6, ACTIVITY-3 |
| 8 | Global/default brands endpoint | Whether `GET /brands` is a real backend endpoint seeded with `store_id` null, or served differently; read-only enforcement | API-CONTRACT §6.1; BACKEND-DEP §7#7 |
| 9 | Province/city master data endpoints | Endpoints for province/city lists and per-store storage shape (`province`/`city`/`full_address`) | API-CONTRACT §4; BACKEND-DEP §7#8 |
| 10 | Search/filter/sort/pagination query parameters | Exact query param names (search, category, brand, condition, sort, page) + sort enum values | API-CONTRACT §5; BACKEND-DEP §7#9; §16 |
| 11 | Category/brand usage-count endpoints/fields | Are usage counts served by the backend; exact field; seller category/brand filters server- vs client-side | API-CONTRACT §6/§6.1; BACKEND-DEP §7#10 |
| 12 | Seller product list status query | `?status=` enum values (`active`/`draft`/`sold_out`/`archived` or management set) | API-CONTRACT §5; BACKEND-DEP §7#11, PRODUCT-3/4 |
| 13 | Lifecycle endpoint verbs | Dedicated endpoints (publish / sold-out / mark-available / archive / restore) vs generic status PATCH; SOLD_OUT→DRAFT endpoint | API-CONTRACT §5; BACKEND-DEP §7#11, PRODUCT-8/9; §9 |
| 14 | Auto Archive DTO/transport | Field naming, `null` vs `0` vs flag; scheduler behavior; whether a deadline appears on the product DTO | API-CONTRACT §4/§5; BACKEND-DEP §7#12; §11 |
| 15 | Announcement storage DTO | Confirm single `{ title, message, is_enabled }` wire shape | API-CONTRACT §4; BACKEND-DEP §7#13 |
| 16 | Operating-hours DTO | Wire representation of structured operating hours (single string vs separate fields) | API-CONTRACT §10.1#9; BACKEND-DEP §7#14; §5 |
| 17 | Account activation/recovery endpoints | Email vs phone activation variants; OTP vs magic link; short-lived proof shape for change-password; recovery-email endpoints | API-CONTRACT §3; BACKEND-DEP §7#15, AUTH/OTP/RECOVERY rows |
| 18 | Product slug source | Expose slug on product DTO (expected) vs derive client-side | API-CONTRACT §5; BACKEND-DEP PRODUCT-13; §8 |
| 19 | Brand identifier | `brand_id` vs `brand name` for `product.brand`; rename propagation; delete usage counting incl. ARCHIVED | API-CONTRACT §6.1; BACKEND-DEP BRAND-1/2/3/4/5; §7 |
| 20 | Activity date/time wire format | Raw timestamp vs pre-formatted `DD.MM.YYYY`; datetime format | API-CONTRACT §8; BACKEND-DEP ACTIVITY-4; §15 |
| 21 | V1 master seed data (NEW — see discrepancy note) | Confirm the category seed (§6) and 12-brand seed (§7) are the authoritative V1 master data | This handoff §6/§7 |

Additional dependency rows already in `docs/BACKEND-DEPENDENCIES.md` §7 and
register (keep in view):

- Store ID format/validation source of truth (regex) + alias storage/redirect/expiry semantics (§19 #3 overlap; store-level).
- Register email vs phone payload variants and verification flag keys.
- OTP rules enforcement (6 digits, 10-min expiry, max 5 attempts, 60-second resend cooldown) — backend is final authority.
- Account-without-store flow: authenticated account with no store reaches `/seller/account` (Profile) to set a verified recovery email; other `/seller/*` require a store.
- Customer identity / no customer avatar on V1.
- Self-store exclusion enforcement (backend expected).
- Seller product list shows PUBLISHED + DRAFT + SOLD_OUT in one list; adapter today only implements `active`/`archived` — never auto-fixed, documented pending confirmation.
- Brand endpoints are `PROPOSED` (not implemented by backend); frontend runs on mock brand data until confirmed.

---

## 20. Backend Acceptance Checklist

Concise checklist the backend developer can use before declaring the Laravel
API ready for frontend integration.

**AUTH**
- [ ] Sanctum session works
- [ ] CSRF works (`X-CSRF-TOKEN`; bootstrap path confirmed)
- [ ] `credentials`/cookies work (`credentials: 'include'` compatible)
- [ ] 419 behavior defined (consistent 401 vs 419 semantics; 419 → `/login`)

**STORE**
- [ ] Ownership enforced (session-derived, never client `store_id`)
- [ ] `store_id` rules enforced (lowercase/digits/hyphen, ≤50 chars, unique, 30-day cooldown)
- [ ] Alias behavior supported (90-day redirect alias, expiry, reusability, no child re-key)

**PRODUCT**
- [ ] Slug returned/defined (or confirmation recorded that frontend derives it)
- [ ] Price `0` accepted (DECIMAL)
- [ ] Photo rules enforced (1–5, exactly one main)
- [ ] Lifecycle endpoints confirmed (dedicated vs status PATCH)
- [ ] Featured behavior confirmed (max 10; PUBLISHED/SOLD_OUT eligible; SOLD_OUT keeps; ARCHIVED clears)

**CATEGORY**
- [ ] 2-level hierarchy
- [ ] Defaults locked (platform-managed, cannot be renamed/deleted by seller)
- [ ] Usage counts available (root aggregates descendants)
- [ ] Master seed confirmed (Section 19 #21)

**BRAND**
- [ ] Global/default brands available (`store_id` null, read-only)
- [ ] Custom brands scoped to store
- [ ] Delete/reference behavior defined (409 while referenced)
- [ ] Brand identifier confirmed (`brand_id` vs name; Section 19 #19)
- [ ] Master seed confirmed (Section 19 #21)

**INTEREST**
- [ ] Aggregation contract defined (aggregated rows; Section 19 #4/#5)
- [ ] STORE/PRODUCT contexts supported
- [ ] Successful-POST redirect contract supported (destination only opens after POST succeeds)

**ACTIVITY**
- [ ] Backend-created activity (no frontend POST)
- [ ] 11 canonical types emitted
- [ ] GET consumption available

**PUBLIC**
- [ ] PUBLISHED + SOLD_OUT public
- [ ] DRAFT + ARCHIVED hidden
- [ ] Canonical product URL supported (`/{storeId}/product/{productId}/{slug}`)

**LISTING**
- [ ] Search/filter/sort/pagination defined (query param names confirmed)

**RESPONSE**
- [ ] Envelope defined (`{data,message}` / `{data,meta{...}}` / `{message,errors}`)
- [ ] Validation errors defined
- [ ] Pagination meta defined (`current_page` / `per_page` / `total`)
- [ ] 419 handling defined

---

## 21. Final Handoff Status

```text
FRONTEND HANDOFF STATUS:

READY FOR BACKEND PLANNING
```

provided that all items marked:

```text
API DEPENDENCY / CONFIRMATION REQUIRED
```

are **explicitly resolved by the backend developer before implementation**
(see Section 19 for the consolidated list; items #1–#21 plus register rows).

This task:

- Frontend implementation is **NOT** part of this task.
- Laravel implementation is **NOT** part of this task.
- No source code changes were made.
- No tests were changed.
- No commit/push was made.