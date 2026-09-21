# Kataloga — Backend Dependency Register & API Reconciliation Audit

> **STATUS: PHASE A RECONCILED REGISTER (FRONTEND-FACING) — NOT A CONFIRMED BACKEND CONTRACT**
>
> There is no production backend yet. Everything in the *Register* below that is
> not a locked Kataloga product requirement is a **proposal** or an **open
> backend dependency**. This document is the reconciliation between the
> frontend, the API adapters, `docs/API-CONTRACT.md`, and the locked
> requirements. It is the input for Phase B; it does not implement backend
> behavior. Items that genuinely need the backend team's confirmation are
> consolidated in section 7 "API Dependencies / Confirmation Required".

> **Status labels used below**
>
> - **CONFIRMED** — locked Kataloga product requirement (see `PRODUCT.md`).
> - **PROPOSED** — frontend proposal implemented in `src/services/adapters/api/`;
>   backend must confirm, rename, or replace it.
> - **BACKEND DEPENDENCY** — behavior the frontend cannot own; needs the backend
>   to define/enforce it.
> - **UNRESOLVED** — an open frontend/product decision, not a backend item.

---

## 1. How to read the register

- **Confirmed?** answers "is the *backend-side* behavior confirmed?" — never
  "does the frontend implement it?". The frontend adapters implement the
  proposal today regardless.
- A row marked `PROPOSED` means: the frontend is contract-ready, but the wire
  shape/path/enum is not final and may change.
- **Blocking Phase B?** = `Yes` only when a decision must land before Phase B
  integration work can be scoped. `No` means Phase B can proceed against the
  proposal and adjust when the backend lands.
- Do not promote a `PROPOSED` row to `CONFIRMED` without an actual backend
  decision recorded here.

---

## 2. Backend Dependency Register

### Authentication / Session

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking Phase B? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-1 | Login | `POST /auth/login { email_or_phone, password }` → user DTO | Adapter sends snake_case, expects user DTO | PROPOSED | Finalize path + DTO | No | `authApi.login` |
| AUTH-2 | Register | `POST /auth/register { email_or_phone, password, name? }` → `{ user, requires_verification, identifier, channel }` | Adapter reads those four keys | PROPOSED | Confirm email vs phone variants + response keys | No | `authApi.register` |
| AUTH-3 | Current session | `GET /auth/me` → user DTO; `401`/`404` = guest → `null` | `notFoundAsNull` handles 404; 401 clears session then resolves null | PROPOSED | Confirm guest response (`null` vs 401) | No | `authApi.getCurrentUser` |
| AUTH-4 | Profile update | `PATCH /auth/me { name?, email?, phone?, avatar_url? }` → user DTO | Adapter sends trimmed values, omits blanks | PROPOSED | Confirm email/phone re-validation ownership | No | `authApi.updateCurrentUser` |
| AUTH-5 | Logout | `POST /auth/logout` | Fire-and-forget | PROPOSED | Confirm idle/refresh behavior | No | `authApi.logout` |
| SESSION-1 | Token transport | Laravel Sanctum **session** auth: cookie session + CSRF; `credentials: 'include'`; bootstrap `GET /sanctum/csrf-cookie` then send `X-CSRF-TOKEN`; **no JWT, no Bearer, no localStorage token** | Client never stores/sends its own token; Phase B wires credentials + CSRF bootstrap | CONFIRMED (Phase A decision, §AGENTS 1.5) | Implement Sanctum session auth + accept CSRF header | Yes | `apiClient.js` (Bearer :48/:143–149, no credentials/CSRF :153–157) |
| SESSION-2 | Expired session | Any `401` = session invalid; **419 = CSRF/session expired** → redirect to `/login` | `apiClient.setUnauthorizedHandler` → AuthProvider clears state → `/login`; Phase B adds 419 handling | CONFIRMED (frontend) / BACKEND DEPENDENCY | Return `401` on expired/invalid session, `419` on CSRF expiry | No | `apiClient.js`, `AuthProvider.jsx` |
| OTP-1 | Email verification | `POST /auth/email/verify { email, code }` → user DTO | Adapter maps straight to user | PROPOSED | Confirm path/body; OTP vs magic link | Yes | Magic-link alternative still open |
| OTP-2 | Resend verification | `POST /auth/email/verify/resend { email }` → `{ expires_at, cooldown_seconds }` | Adapter reads those keys | PROPOSED | Confirm keys + cooldown source | No | |
| OTP-3 | OTP rules | 6 digits, 10-minute expiry, max 5 attempts, 60-second resend cooldown | `src/constants/auth.js` mirrors all four; UI renders cooldown/expiry | CONFIRMED (rule) | Enforce all four server-side | No | Backend is final authority |
| OTP-4 | Change-password OTP | `POST /auth/password/otp { email }`; `POST /auth/password/otp/verify { email, code }` → short-lived proof | Adapter ignores proof value, relies on session | PROPOSED | Confirm proof transport/shape (token vs server-side session) | Yes | Shape of proof explicitly open |
| OTP-5 | Change password | `POST /auth/password { current_password, new_password }` | Adapter expects `{ ok }`; requires prior OTP proof in mock | PROPOSED | Enforce proof requirement + policy | No | `MIN_PASSWORD_LENGTH=8` |
| OTP-6 | Forgot password | `POST /auth/password/forgot { email_or_phone }` → **generic** `{ ok }` | Adapter returns `{ requested: true }`, never branches on existence | PROPOSED | Must be enumeration-safe | No | Mock returns `demoCode` only in mock mode |
| OTP-7 | Reset password | `POST /auth/password/reset { email_or_phone, code, password }` → `{ ok }` | Adapter maps `{ ok }` | PROPOSED | Confirm code lifetime + attempt cap | No | |
| RECOVERY-1 | Recovery email | `POST /auth/recovery-email/otp { email }`; `POST /auth/recovery-email/verify { email, code }` → user DTO | Adapter reads `expires_at`/`cooldown_seconds` then user DTO | PROPOSED | Confirm path/keys + uniqueness | Yes | Needed for phone-registered accounts (locked) |
| ACCOUNT-1 | Account activation | Email signup waits for verification; phone signup active immediately but needs a verified recovery email before recovery/change-password | `register()` returns `requiresVerification`; login throws typed `EMAIL_UNVERIFIED` | CONFIRMED | Enforce activation gate on login | No | `authService.js` |
| ACCOUNT-2 | Account without store | An authenticated account with no store must reach `/seller/account` (Profile) to set a recovery email | **Resolved (pre-Phase B):** `SellerLayout` redirects no-store accounts to `/create-store` except `/seller/account` (`src/utils/sellerAccess.js`) | CONFIRMED (product decision) | None | No | Other `/seller/*` routes still require a store |

### Store / Region

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking Phase B? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STORE-1 | My store | `GET /stores/me` → store DTO \| null | Adapter `notFoundAsNull` → `undefined` | PROPOSED | Confirm null vs 404 for no store | No | |
| STORE-2 | Public store | `GET /stores/{storeId}` → store DTO \| null | Adapter encodes storeId | PROPOSED | Confirm historical-alias resolution | No | |
| STORE-3 | Availability | `GET /stores/availability?store_id=...` → `{ available }` | Adapter boolean-coerces | PROPOSED | Confirm re-check on submit | No | |
| STORE-4 | Create store | `POST /stores { name, store_id }` → store DTO | Adapter sends both | PROPOSED | Confirm session becomes owner | No | |
| STORE-5 | Update store | `PATCH /stores/me` partial store DTO → store DTO | Adapter sends only provided fields, snake_case | PROPOSED | Confirm partial-update semantics | No | |
| STORE-6 | One account / one store | Duplicate store creation → `409` | Mock rejects; UI handles message | CONFIRMED | Enforce `409` | No | |
| STORE-7 | Store ID rules | Required, unique, trimmed, **max 50 characters**, lowercase/digits/hyphens, no leading/trailing hyphen, no consecutive hyphens; change max once/30 days (`409` cooling down); availability re-checked on submit | `STORE_ID_PATTERN` mirror; `canChangeStoreId` pre-check | CONFIRMED (rule) / BACKEND DEPENDENCY | Be final authority; return `409` + message | Yes | Frontend never replaces backend validation |
| STORE-8 | Store ID aliases | All historical Store IDs redirect to the current store for **90 days** from the change, then expire; **not permanent** | Frontend keeps no alias map | BACKEND DEPENDENCY | Implement alias store + redirect + expiry | No | Backend-owned by requirement |
| STORE-9 | Store ID re-key | A Store ID change re-keys owning products, custom categories, interests, account reference atomically | Mock propagates in memory | BACKEND DEPENDENCY | Atomic re-key | No | `storeService.updateStore` |
| STORE-10 | Announcement | Single `{ title, message, is_enabled }` object (not array) | Mapper + `storeToDto` use single object | PROPOSED | Confirm storage shape | No | Disabled saved but not rendered |
| STORE-11 | Auto Archive setting | Store-level with locked value set: **`null` = "Never" (default, off)** / 1 / 7 / 30 / 90 / 180 / **360** days. Never disables auto archive but never blocks manual archive. UI lives on the Archive page, not My Store (frontend placement). Mock: `autoArchiveDays: null` | Adapter sends `auto_archive_days`; mapper maps null | CONFIRMED (semantics) / BACKEND DEPENDENCY | Confirm null representation + field name + default (`null` expected) | Yes | null vs 0 vs flag open; Contract §4 / §10.1(2) |
| REGION-1 | Province/City master data | Endpoints to list provinces and cities, and the per-store storage shape for `province`/`city`/`full_address` | `regionService` returns mock data **in every mode**; **no `regionApi` adapter exists** | BACKEND DEPENDENCY | Expose master-data endpoints + decide storage | Yes | Contract §4 / §10.1(3) |

### Product

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking Phase B? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PRODUCT-1 | Public catalog | `GET /stores/{storeId}/products` → PUBLISHED + SOLD_OUT within the store Auto Archive window, ordered Featured Published → newer Published → older Published → Sold Out | Adapter returns mapped list as-is | PROPOSED (endpoint) / CONFIRMED (content+order) | Implement filter + ordering server-side | No | `productApi.listPublicProducts` |
| PRODUCT-2 | Public detail | `GET /stores/{storeId}/products/{productId}` → visible product \| null | Adapter `notFoundAsNull` → `undefined` | PROPOSED | Hide non-public products | No | |
| PRODUCT-3 | Seller lists | `GET /products?status=active` (PUBLISHED) and `?status=archived` | Adapter implements exactly these two values | PROPOSED | Confirm `?status=` enum | Yes | See PRODUCT-4 |
| PRODUCT-4 | Seller management list | Seller Products page shows PUBLISHED + DRAFT + SOLD_OUT in one list | **Mismatch:** mock `listSellerProducts` returns all non-archived; API adapter `status=active` returns PUBLISHED only → DRAFT/SOLD_OUT would disappear in API mode | BACKEND DEPENDENCY | Define `draft`/`sold_out` query values or a management-set endpoint | Yes | Documented, **not** auto-fixed (would invent contract) |
| PRODUCT-5 | Seller detail | `GET /products/{productId}` → any status | Adapter `notFoundAsNull` | PROPOSED | Scope to session/store | No | |
| PRODUCT-6 | Create | `POST /products` product DTO → product DTO (store from session) | Adapter may send `store_id` if present | PROPOSED | Ignore/reject client `store_id` | No | `productToDto` |
| PRODUCT-7 | Update | `PATCH /products/{productId}` partial DTO → DTO; data fields only | Adapter sends only provided fields | PROPOSED | Ignore disallowed status changes | No | Lifecycle uses dedicated endpoints (PRODUCT-8/9) |
| PRODUCT-8 | Lifecycle actions | Dedicated endpoints: `POST /products/{id}/publish` (DRAFT→PUBLISHED), `/sold-out` (PUBLISHED→SOLD_OUT), `/mark-available` (SOLD_OUT→PUBLISHED), `/archive` (PUBLISHED/DRAFT→ARCHIVED), `/restore` (ARCHIVED→DRAFT); `PATCH /products/{id}/featured` | Adapter implements publish/archive/restore/featured; marks SOLD_OUT via PATCH status (PRODUCT-9) | PROPOSED | Confirm exact paths/verbs | Yes | Contract §5; no generic status PATCH |
| PRODUCT-9 | SOLD_OUT transport | Mark SOLD_OUT and reactivate to PUBLISHED via dedicated endpoints, not a generic status PATCH | Adapter rides `PATCH /products/{id}` with `{ status }` | BACKEND DEPENDENCY | Choose dedicated endpoints vs PATCH-status | Yes | Contract §5 opens this explicitly |
| PRODUCT-10 | Lifecycle rules | DRAFT→PUBLISHED; PUBLISHED→SOLD_OUT; SOLD_OUT→PUBLISHED; **SOLD_OUT→DRAFT** (edit before republish); PUBLISHED/DRAFT→ARCHIVED; ARCHIVED→DRAFT. Never ARCHIVED→PUBLISHED | Mock + service guards mirror rules | CONFIRMED | Enforce transitions server-side | No | |
| PRODUCT-11 | Publish validation | name, slug, **photos 1–5 (exactly one main)**, category, description, condition, price required; **Product Details/attributes optional**; brand/external links/featured optional; custom attributes never required; `price` = 0 valid | `utils/productValidation` mirrors | CONFIRMED | Enforce server-side | No | Details are NOT required for publish |
| PRODUCT-12 | Featured | Boolean, max 10 per store, toggle only on PUBLISHED **or SOLD_OUT**; SOLD_OUT **keeps** featured; reactivation does not change it; archiving clears it; DRAFT/ARCHIVED never featured | Mock enforces cap + guard | CONFIRMED (rule) / PROPOSED (transport) | Enforce cap + lifecycle + clear-on-archive | No | |
| PRODUCT-13 | Slug | Public route `/{storeId}/product/{productId}/{slug}`; slug = canonical, readable, unique within store, backend-owned | Product DTO now documents `slug`; frontend may also derive via `utils/slugify` | UNRESOLVED | Confirm expose slug on DTO vs derive client-side | No | Contract §5 DTO includes slug; §10.1(12) |
| PRODUCT-14 | Auto Archive expiry | Scheduled SOLD_OUT → ARCHIVED once past the store threshold (from `sold_out_at`); catalog excludes expired SOLD_OUT; values null/"Never" default, 1, 7, 30, 90, 180, 360 | Mock lazily derives from `soldOutAt`; frontend renders what the API returns | BACKEND DEPENDENCY | Implement scheduler + expose status | Yes | Contract §5 / §10.1(2) |
| PRODUCT-15 | Seller category filter | `/seller/products?category=...` server or client side | URL query is the source of truth; mock filters client-side | BACKEND DEPENDENCY | Confirm server vs client | No | Contract §10.1(5) |
| PRODUCT-16 | Seller brand filter | `/seller/products?brand=...` server or client side | URL query is the source of truth; UI applies filter | BACKEND DEPENDENCY | Confirm server vs client | No | Contract §10.1(5) |
| PRODUCT-17 | Catalog search/filter/sort | Public listing search (name/brand/category/details/description/attributes), category & condition filter, sort (Relevance/Newest/Price low-high/Price high-low), pagination | Mock filters/sorts client-side | BACKEND DEPENDENCY | Confirm query param names + pagination | No | Backend-owned in API mode; Contract §5 |

### Category / Brand

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking Phase B? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CATEGORY-1 | List | `GET /categories` → default + current-store custom | Adapter lists | PROPOSED | Scope to session store | No | |
| CATEGORY-2 | Create | `POST /categories { name, parent_id? }` → DTO | Adapter sends snake_case | PROPOSED | Validate max 2 levels | No | |
| CATEGORY-3 | Update | `PATCH /categories/{id} { name?, parent_id? }` → DTO | Adapter trims name, passes parent_id | PROPOSED | Confirm rename propagation | No | |
| CATEGORY-4 | Delete | `DELETE /categories/{id}` → `{ deleted }` | Adapter defaults `deleted:true` | PROPOSED | Block while in use / has children (`409`) | No | |
| CATEGORY-5 | Category rules | Max 2 levels (Kategori Utama → Sub Kategori); one category per product (name-keyed `product.category`); **default categories are Kataloga-managed, cannot be edited/deleted**; custom categories store-scoped; delete blocked by product use or child; no cascade | Mock enforces all | CONFIRMED | Enforce server-side | No | |
| CATEGORY-6 | Rename propagation | Renaming a category updates products referencing the old name | Mock propagates; backend behavior unknown | BACKEND DEPENDENCY | Decide: propagate or store category id | No | Name-keyed join risk |
| BRAND-1 | List | `GET /brands` → **global/default (`store_id` null, seeded, read-only)** + current-store custom | Adapter lists | PROPOSED | Serve global defaults + scope custom | Yes | Contract says endpoints "proposed, not implemented" |
| BRAND-2 | Create | `POST /brands { name }` → DTO (creates custom brand) | Adapter sends `{ name }` | PROPOSED | Reject duplicate name in store | Yes | |
| BRAND-3 | Update | `PATCH /brands/{id} { name? }` → DTO | Adapter trims | PROPOSED | Confirm rename propagation | Yes | |
| BRAND-4 | Delete | `DELETE /brands/{id}` → `{ deleted }` | Adapter defaults `deleted:true` | PROPOSED | Block (409) while any product references | Yes | |
| BRAND-5 | Brand model | Global/default (`store_id` null, seeded, read-only) + custom store-scoped; product references brand by **name** (`product.brand`), not `brandId`; delete usage counts ARCHIVED too | Mock implements name join | PROPOSED | Confirm name key vs `brand_id`; declare if backend uses an id | Yes | Options A(string)/B(brandId)/C(migration) still open |
| BRAND-6 | Brand filter | `/seller/products?brand={brandId}` server or client side | UI applies filter; URL query source of truth | BACKEND DEPENDENCY | Confirm server vs client | No | |

### Customer Interest / Recent Activity

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking Phase B? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| INTEREST-1 | List | `GET /stores/{storeId}/customer-interests` → **aggregated** DTO[], newest first | Adapter lists | PROPOSED | Scope to owner/session | No | |
| INTEREST-2 | Record | `POST /customer-interests` → aggregated: `{ store_id, customer_user_id, product_id?, context (STORE\|PRODUCT), channel, first_activity_at, last_activity_at, total_clicks }`; same segment increments `total_clicks`, no new row | Adapter sends store_id, product_id, channel, snapshots, context | PROPOSED | Confirm body fields + aggregation key + ownership derivation | Yes | `product_id` null for STORE context; no `channel_type` |
| INTEREST-3 | Identity source | Session vs request body for `customer_name/email/phone`; **email/phone from session, no uploaded customer avatar in V1** | Adapter sends client snapshots; backend expected to trust session | BACKEND DEPENDENCY | Declare session as source of truth | Yes | Contract §7 opens this |
| INTEREST-4 | Self-store exclusion | Owner's own clicks never recorded | Frontend skips in mock; API posts as-is and relies on backend | CONFIRMED (rule) / BACKEND DEPENDENCY | Enforce server-side | No | |
| INTEREST-5 | Allowed types | Only `WHATSAPP_CLICK` and `MARKETPLACE_CLICK`; store `channel` (e.g. `"whatsapp"`, `"shopee"`) — **no `channel_type`** | Service + mock enforce | CONFIRMED | Reject others | No | |
INTEREST-6 | Redirect timing | Redirect/WhatsApp opens **only after** the interest POST succeeds | Service awaits POST before opening destination | CONFIRMED (frontend behavior) | Backend must persist before success response | No | Locked requirement §19 |
| ACTIVITY-1 | List | `GET /activities` → DTO[], newest first | Adapter lists + canonical filter | PROPOSED | Scope to session store | No | |
| ACTIVITY-2 | Record | Recent Activity is **backend-created**; frontend consumes only. **No `POST /activities`** (removal is a Phase B cleanup item) | Adapter currently POSTs `/activities`; must be removed in Phase B | CONFIRMED (backend-created) / BACKEND DEPENDENCY | Backend creates records on domain actions | Yes | Locked requirement §20 |
| ACTIVITY-3 | Canonical types | `PRODUCT_PUBLISHED`, `PRODUCT_UPDATED` (canonical), `PRODUCT_SOLD_OUT`, `PRODUCT_REACTIVATED`, `PRODUCT_ARCHIVED`, `PRODUCT_RESTORED`, `CATEGORY_CREATED`, `CATEGORY_UPDATED`, `ANNOUNCEMENT_CREATED`, `ANNOUNCEMENT_UPDATED`, `STORE_UPDATED` | Mapper currently normalizes `PRODUCT_UPDATED` → `PRODUCT_EDITED`; will flip to canonical in Phase B | CONFIRMED (frontend canonical) | Emit canonical type strings | No | Contract §8 |
| ACTIVITY-4 | Date field | Is the wire `date` an ISO-8601 timestamp or an already-formatted `12.09.2026`? | Mapper accepts `date` or `created_at`; UI formats via `utils/datetime` | UNRESOLVED | Pick one and align contract §1 with §8 | Yes | Contract internally inconsistent; locked display = `DD.MM.YYYY` |
| ACTIVITY-5 | Slice/filter | Dashboard 4-item slice and `/seller/activities` type/single-date filter — server or client | Client-side today | BACKEND DEPENDENCY | Confirm server vs client | No | Frontend route only, no new endpoint |
| ACTIVITY-6 | Auto Archive event | A scheduler-driven SOLD_OUT→ARCHIVED transition must emit `PRODUCT_ARCHIVED` | Mock records it on manual archive; scheduler event not modeled | BACKEND DEPENDENCY | Emit activity on auto-archive | No | |

---

## 3. Audit matrix

| Feature | Frontend | API Adapter | Docs | Backend Status | Action |
| --- | --- | --- | --- | --- | --- |
| Login / session | `authService`, `AuthProvider`, `RequireAuth` | `authApi` | §3 | PROPOSED | Confirm DTO + Sanctum session/CSRF transport |
| Register (email/phone) | `RegisterPage`, `VerifyEmailPage` | `authApi.register/verifyRegistration` | §3 | PROPOSED | Confirm activation variants |
| Forgot / reset / change password | `ForgotPasswordPage`, `ResetPasswordPage`, `ChangePasswordSection` | `authApi` | §3 | PROPOSED | Confirm OTP + proof shape |
| Recovery email | `RecoveryEmailSection` | `authApi` | §3 | PROPOSED | Confirm path + uniqueness |
| Account without store | `SellerLayout`, `AccountPage` | — | ROUTES §21/§23, PRODUCT §37 | UNRESOLVED | Product decision (§5) |
| My Store | `MyStorePage` | `storeApi` | §4 | PROPOSED | Confirm PATCH partial |
| Store ID rules/cooldown/alias | `utils/storeId`, `MyStorePage` | `storeApi` | §4 | CONFIRMED rule / BACKEND DEP | Enforce + aliases |
| Region master data | `regionService`, location form | **none** | §4, §10.1(3) | BACKEND DEP | Add endpoints + adapter |
| Product catalog | `StoreLandingPage`, `ProductListingPage` | `productApi.listPublicProducts` | §5 | PROPOSED | Confirm content/order server-side |
| Product detail | `ProductDetailPage` | `productApi.getProduct` | §5 | PROPOSED | Hide non-public |
| Seller products list | `ProductsPage`, `StatusTabs` | `productApi.listSellerProducts` | §5 | MISMATCH | Resolve `?status=` (PRODUCT-4) |
| Product lifecycle actions | `ProductsPage`, `ArchivedProductsPage` | `productApi` | §5 | PROPOSED | Confirm SOLD_OUT transport |
| Auto Archive | mock lazy window; UI on Archive page | `storeApi` | §4/§5 | BACKEND DEP | Scheduler + DTO |
| Publish validation | `utils/productValidation` | — | §5 | CONFIRMED | Enforce server-side |
| Featured | `ProductCatalogSettingsSection`, guards | `productApi.toggleFeatured` | §5 | CONFIRMED rule | Enforce cap (max 10) + lifecycle: toggle only PUBLISHED/SOLD_OUT; SOLD_OUT keeps featured; reactivation unchanged; archive clears |
| Categories | `CategoriesPage` | `categoryApi` | §6 | PROPOSED | Confirm delete/rename + default categories read-only |
| Brands | `BrandsSection` | `brandApi` | §6.1 | PROPOSED | Confirm global (`store_id` null) vs custom model + name-vs-id |
| Customer Interest | `CustomerInterestPage`, storefront actions | `customerInterestApi` | §7 | PROPOSED | Confirm aggregation + identity + body |
| Recent Activity | `DashboardPage`, `RecentActivitiesPage` | `activityApi` | §8 | PROPOSED | Confirm canonical types + drop POST |
| Errors | `ApiError`, `authErrors` | `apiClient` | §2 | CONFIRMED (mapping) | Confirm error `code`s |

---

## 4. Confirmed frontend implementation facts (category B)

These are facts about the current frontend, **not** claims about the backend:

- `productApi.listSellerProducts()` calls `GET /products?status=active`; there is
  **no adapter path** for `draft` or `sold_out`.
- `productApi.markSoldOut()` / `reactivateProduct()` both call
  `PATCH /products/{id}` with a `{ status }` body.
- `regionService` returns mock data in **all** modes; no `regionApi.js` exists.
- `apiClient` returns the raw parsed body; all DTO→model mapping lives in
  `mappers.js`.
- Mock mode never issues HTTP requests; API mode never falls back to mock data.
- `toRecentActivity` currently normalizes `PRODUCT_UPDATED` → `PRODUCT_EDITED` and
  accepts `date` or `created_at`; the canonical value is `PRODUCT_UPDATED`
  (flip to canonical in Phase B).

---

## 5. Open frontend/product decisions

1. **Account without store (ACCOUNT-2) — RESOLVED (pre-Phase B).** `SellerLayout`
   redirects every authenticated account without a store to `/create-store`,
   with `/seller/account` (Profile) exempted, so a phone-registered account can
   set the verified recovery email the locked password-recovery flow requires
   (`PRODUCT.md` line 82). Implemented in `src/utils/sellerAccess.js` and used by
   `SellerLayout`; every other `/seller/*` route still requires a store.
   `ROUTES.md` §23 only requires authentication for `/seller/*` and never states
   that a missing store blocks Profile; `PRODUCT.md` §37 avoids blocking sellers
   from the seller area.
2. **Documentation conflict — activity `date` (ACTIVITY-4).** `API-CONTRACT.md`
   §1 says dates are ISO-8601, while §8 states the activity DTO `date` is the
   display date `12.09.2026`. The frontend already formats at render time; the
   contract should settle on ISO-8601 for the wire and keep display formatting
   client-side (locked display format `DD.MM.YYYY`).

---

## 6. Documentation cross-check

- `docs/API-CONTRACT.md` remains marked **PROPOSED**; no section of this audit
  promotes it to confirmed.
- The brand section labels the `/brands` endpoints "proposed and not
  implemented", yet `src/services/adapters/api/brandApi.js` already calls them.
  This is a wording mismatch, not a behavior change; the endpoints stay
  `PROPOSED`.
- No new endpoint is invented by this document beyond what already exists in the
  adapters and `docs/API-CONTRACT.md`.

---

## 7. API Dependencies / Confirmation Required

> **Frontend dependency — backend contract confirmation required.**
>
> These items are genuinely not finalized against a production backend. They are
> consolidated from the Phase A reconciliation. Do not promote any of them to
> confirmed or implement an assumed contract in Phase B without a backend
> decision recorded here. The frontend **must not** invent endpoints, schemas, or
> authorization rules for these; where behavior is still open, code that depends
> on it is written defensively (no fake success, no silent mock fallback).

| # | Dependency | Why it blocks / affects the frontend | Open question for the backend team |
| --- | --- | --- | --- |
| 1 | Sanctum session auth transport | Phase B wires `credentials: 'include'`, `GET /sanctum/csrf-cookie`, `X-CSRF-TOKEN`, and 419 handling in `apiClient.js` | Exact route paths; whether CSRF bootstrap applies to every request or only mutations; 419 vs 401 semantics |
| 2 | Auth endpoints (Sanctum) | `authApi` login/register/logout/me currently assume `POST /auth/*` | Exact paths, request/response DTO, email vs phone register payloads |
| 3 | Public storefront endpoints | Store Landing / Product Listing / Product Detail (`GET /stores/{storeId}...`) | Exact paths; `productId` public numeric id; slug exposure on product DTO |
| 4 | Customer Interest list endpoint | `/seller/customer-interest` page consumes aggregated interest | Is the list server-aggregated (expected) or per-record rows to aggregate client-side; pagination |
| 5 | Customer Interest aggregation & channels | `POST /customer-interests` body uses `context` (STORE/PRODUCT) and `channel` (no `channel_type`) | Aggregation key; the exact `channel` value strings; session vs body identity |
| 6 | Recent Activity consumption endpoint | `/seller/activities` + dashboard slice consume `GET /activities`; no `POST` | Exact path; whether the 4-item dashboard slice and type/single-date filters are server- or client-side |
| 7 | Global/default brands endpoint | Brand Management mixes global read-only + custom brands | Is `GET /brands` a real backend endpoint, seeded with `store_id` null, or should the frontend load global defaults differently |
| 8 | Provinces/cities master data | Store location form in My Store | Endpoint(s) for province/city lists and the per-store storage shape |
| 9 | Search/filter/sort/pagination URLs | Product Listing query params (`search`, `category`, `condition`, `sort`, `page`) | Exact query parameter names and the sort enum values |
| 10 | Category/brand usage counts & filters | Categories and Brands pages show product usage counts and link to `/seller/products?category=...&brand=...` and `?status=` | Are usage counts and product-list filters server-side; exact query names |
| 11 | Seller product list status values | Seller Products page shows PUBLISHED + DRAFT + SOLD_OUT in one list | `?status=` enum values (management set vs `active`/`draft`/`sold_out`) and the lifecycle endpoint verbs (publish / sold-out / mark-available / archive / restore) |
| 12 | Auto Archive DTO/transport | Store DTO `auto_archive_days` (null = Never) and product SOLD_OUT deadline | Field naming, null representation, scheduler behavior, whether a deadline appears on the product DTO |
| 13 | Announcement storage | Store DTO single `{ title, message, is_enabled }` | Confirm single-object wire shape |
| 14 | Operating hours storage | My Store structured editor composes a wire string | Confirm string wire format expected by backend |
| 15 | Account activation / recovery flows | Register verify / recovery email / change-password flows | Email vs phone activation; OTP vs magic link; short-lived proof shape |

**Phase B start condition (no-api server):** Phase B proceeds in a
mock-first / adapter-compatible way; it does not require these confirmations to
start. Each row above must be resolved (or re-scoped to an explicit override by
the product owner) before that feature is wired to `VITE_DATA_SOURCE=api` in
production. Until then the adapters remain the contract proposal and mock mode
remains the working dev/isolated-test data source — never a production fallback.
