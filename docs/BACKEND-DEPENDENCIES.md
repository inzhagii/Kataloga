# Kataloga — Backend Dependency Register & API Reconciliation Audit

> **STATUS: M11 AUDIT OUTPUT — NOT A CONFIRMED BACKEND CONTRACT**
>
> There is no production backend yet. Everything in the *Register* below that is
> not a locked Kataloga product requirement is a **proposal** or an **open
> backend dependency**. This document is the reconciliation between the
> frontend, the API adapters, `docs/API-CONTRACT.md`, and the locked
> requirements. It is the input for M12; it does not implement backend behavior.

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
- **Blocking M12?** = `Yes` only when a decision must land before M12
  integration work can be scoped. `No` means M12 can proceed against the
  proposal and adjust when the backend lands.
- Do not promote a `PROPOSED` row to `CONFIRMED` without an actual backend
  decision recorded here.

---

## 2. Backend Dependency Register

### Authentication / Session

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking M12? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-1 | Login | `POST /auth/login { email_or_phone, password }` → user DTO | Adapter sends snake_case, expects user DTO | PROPOSED | Finalize path + DTO | No | `authApi.login` |
| AUTH-2 | Register | `POST /auth/register { email_or_phone, password, name? }` → `{ user, requires_verification, identifier, channel }` | Adapter reads those four keys | PROPOSED | Confirm email vs phone variants + response keys | No | `authApi.register` |
| AUTH-3 | Current session | `GET /auth/me` → user DTO; `401`/`404` = guest → `null` | `notFoundAsNull` handles 404; 401 clears session then resolves null | PROPOSED | Confirm guest response (`null` vs 401) | No | `authApi.getCurrentUser` |
| AUTH-4 | Profile update | `PATCH /auth/me { name?, email?, phone?, avatar_url? }` → user DTO | Adapter sends trimmed values, omits blanks | PROPOSED | Confirm email/phone re-validation ownership | No | `authApi.updateCurrentUser` |
| AUTH-5 | Logout | `POST /auth/logout` | Fire-and-forget | PROPOSED | Confirm idle/refresh behavior | No | `authApi.logout` |
| SESSION-1 | Token transport | Cookie or `Authorization: Bearer` | Client supports configurable Bearer (`setAccessToken`); nothing is wired in mock | BACKEND DEPENDENCY | Decide cookie vs Bearer; wire token attach/refresh | Yes | No refresh mechanism exists yet |
| SESSION-2 | Expired session | Any `401` = session invalid | `apiClient.setUnauthorizedHandler` → AuthProvider clears state → `/login` | CONFIRMED (frontend) / BACKEND DEPENDENCY | Return `401` on expired/invalid session | No | `apiClient.js`, `AuthProvider.jsx` |
| OTP-1 | Email verification | `POST /auth/email/verify { email, code }` → user DTO | Adapter maps straight to user | PROPOSED | Confirm path/body; OTP vs magic link | Yes | Magic-link alternative still open |
| OTP-2 | Resend verification | `POST /auth/email/verify/resend { email }` → `{ expires_at, cooldown_seconds }` | Adapter reads those keys | PROPOSED | Confirm keys + cooldown source | No | |
| OTP-3 | OTP rules | 6 digits, 10-minute expiry, max 5 attempts, 60-second resend cooldown | `src/constants/auth.js` mirrors all four; UI renders cooldown/expiry | CONFIRMED (rule) | Enforce all four server-side | No | Backend is final authority |
| OTP-4 | Change-password OTP | `POST /auth/password/otp { email }`; `POST /auth/password/otp/verify { email, code }` → short-lived proof | Adapter ignores proof value, relies on session | PROPOSED | Confirm proof transport/shape (token vs server-side session) | Yes | Shape of proof explicitly open |
| OTP-5 | Change password | `POST /auth/password { current_password, new_password }` | Adapter expects `{ ok }`; requires prior OTP proof in mock | PROPOSED | Enforce proof requirement + policy | No | `MIN_PASSWORD_LENGTH=8` |
| OTP-6 | Forgot password | `POST /auth/password/forgot { email_or_phone }` → **generic** `{ ok }` | Adapter returns `{ requested: true }`, never branches on existence | PROPOSED | Must be enumeration-safe | No | Mock returns `demoCode` only in mock mode |
| OTP-7 | Reset password | `POST /auth/password/reset { email_or_phone, code, password }` → `{ ok }` | Adapter maps `{ ok }` | PROPOSED | Confirm code lifetime + attempt cap | No | |
| RECOVERY-1 | Recovery email | `POST /auth/recovery-email/otp { email }`; `POST /auth/recovery-email/verify { email, code }` → user DTO | Adapter reads `expires_at`/`cooldown_seconds` then user DTO | PROPOSED | Confirm path/keys + uniqueness | Yes | Needed for phone-registered accounts (locked) |
| ACCOUNT-1 | Account activation | Email signup waits for verification; phone signup active immediately but needs a verified recovery email before recovery/change-password | `register()` returns `requiresVerification`; login throws typed `EMAIL_UNVERIFIED` | CONFIRMED | Enforce activation gate on login | No | `authService.js` |
| ACCOUNT-2 | Account without store | An authenticated account with no store must reach `/seller/account` (Profile) to set a recovery email | **Resolved in M11:** `SellerLayout` redirects no-store accounts to `/create-store` except `/seller/account` (`src/utils/sellerAccess.js`) | CONFIRMED (M11 product decision) | None | No | Other `/seller/*` routes still require a store |

### Store / Region

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking M12? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STORE-1 | My store | `GET /stores/me` → store DTO \| null | Adapter `notFoundAsNull` → `undefined` | PROPOSED | Confirm null vs 404 for no store | No | |
| STORE-2 | Public store | `GET /stores/{storeId}` → store DTO \| null | Adapter encodes storeId | PROPOSED | Confirm historical-alias resolution | No | |
| STORE-3 | Availability | `GET /stores/availability?store_id=...` → `{ available }` | Adapter boolean-coerces | PROPOSED | Confirm re-check on submit | No | |
| STORE-4 | Create store | `POST /stores { name, store_id }` → store DTO | Adapter sends both | PROPOSED | Confirm session becomes owner | No | |
| STORE-5 | Update store | `PATCH /stores/me` partial store DTO → store DTO | Adapter sends only provided fields, snake_case | PROPOSED | Confirm partial-update semantics | No | |
| STORE-6 | One account / one store | Duplicate store creation → `409` | Mock rejects; UI handles message | CONFIRMED | Enforce `409` | No | |
| STORE-7 | Store ID rules | Required, unique, trimmed, lowercase/digits/hyphens, no leading/trailing hyphen, no consecutive hyphens; change max once/30 days (`409` cooling down) | `STORE_ID_PATTERN` mirror; `canChangeStoreId` pre-check | CONFIRMED (rule) / BACKEND DEPENDENCY | Be final authority; return `409` + message | Yes | Frontend never replaces backend validation |
| STORE-8 | Store ID aliases | All historical Store IDs redirect to the current store | Frontend keeps no alias map | BACKEND DEPENDENCY | Implement alias store + redirect | No | Backend-owned by requirement |
| STORE-9 | Store ID re-key | A Store ID change re-keys owning products, custom categories, interests, account reference atomically | Mock propagates in memory | BACKEND DEPENDENCY | Atomic re-key | No | `storeService.updateStore` |
| STORE-10 | Announcement | Single `{ title, message, is_enabled }` object (not array) | Mapper + `storeToDto` use single object | PROPOSED | Confirm storage shape | No | Disabled saved but not rendered |
| STORE-11 | Auto Archive setting | Store-level with locked value set: "Tidak ada" (default, off) / 1 / 7 / 30 / 90 / 180 / 365 days / "Never" (off but manual archive still allowed). "Tidak ada" and "Never" never block manual archive. UI lives on the Archive page, not My Store (frontend placement). Mock: `autoArchiveDays: null` | Adapter sends `auto_archive_days`; mapper maps null | CONFIRMED (semantics) / BACKEND DEPENDENCY | Confirm "Tidak ada"/"Never" representation + field name + default | Yes | null vs 0 vs flag open |
| REGION-1 | Province/City master data | Endpoints to list provinces and cities, and the per-store storage shape for `province`/`city`/`full_address` | `regionService` returns mock data **in every mode**; **no `regionApi` adapter exists** | BACKEND DEPENDENCY | Expose master-data endpoints + decide storage | Yes | Contract §4 / §10.1(3) |

### Product

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking M12? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PRODUCT-1 | Public catalog | `GET /stores/{storeId}/products` → PUBLISHED + SOLD_OUT within the store Auto Archive window, ordered Featured Published → newer Published → older Published → Sold Out | Adapter returns mapped list as-is | PROPOSED (endpoint) / CONFIRMED (content+order) | Implement filter + ordering server-side | No | `productApi.listPublicProducts` |
| PRODUCT-2 | Public detail | `GET /stores/{storeId}/products/{productId}` → visible product \| null | Adapter `notFoundAsNull` → `undefined` | PROPOSED | Hide non-public products | No | |
| PRODUCT-3 | Seller lists | `GET /products?status=active` (PUBLISHED) and `?status=archived` | Adapter implements exactly these two values | PROPOSED | Confirm `?status=` enum | Yes | See PRODUCT-4 |
| PRODUCT-4 | Seller management list | Seller Products page shows PUBLISHED + DRAFT + SOLD_OUT in one list | **Mismatch:** mock `listSellerProducts` returns all non-archived; API adapter `status=active` returns PUBLISHED only → DRAFT/SOLD_OUT would disappear in API mode | BACKEND DEPENDENCY | Define `draft`/`sold_out` query values or a management-set endpoint | Yes | Documented, **not** auto-fixed (would invent contract) |
| PRODUCT-5 | Seller detail | `GET /products/{productId}` → any status | Adapter `notFoundAsNull` | PROPOSED | Scope to session/store | No | |
| PRODUCT-6 | Create | `POST /products` product DTO → product DTO (store from session) | Adapter may send `store_id` if present | PROPOSED | Ignore/reject client `store_id` | No | `productToDto` |
| PRODUCT-7 | Update | `PATCH /products/{productId}` partial DTO → DTO | Adapter sends only provided fields | PROPOSED | Ignore disallowed status changes | No | |
| PRODUCT-8 | Lifecycle actions | `POST /products/{id}/publish`, `/archive`, `/restore`; `PATCH /products/{id}/featured` | Adapter implements all four | PROPOSED | Confirm verbs | No | |
| PRODUCT-9 | SOLD_OUT transport | Mark SOLD_OUT and reactivate to PUBLISHED | Adapter rides `PATCH /products/{id}` with `{ status }` | BACKEND DEPENDENCY | Choose PATCH-status vs dedicated endpoints | Yes | Contract §5 opens this explicitly |
| PRODUCT-10 | Lifecycle rules | DRAFT→PUBLISHED; PUBLISHED→SOLD_OUT; SOLD_OUT→PUBLISHED; PUBLISHED/DRAFT→ARCHIVED; ARCHIVED→DRAFT. Never SOLD_OUT→DRAFT, never ARCHIVED→PUBLISHED | Mock + service guards mirror rules | CONFIRMED | Enforce transitions server-side | No | |
| PRODUCT-11 | Publish validation | name, ≥1 photo, category, details, description, condition, price required; brand/links/featured optional; custom attributes never required | `utils/productValidation` mirrors | CONFIRMED | Enforce server-side | No | |
| PRODUCT-12 | Featured | Boolean, max 10 per store, never ARCHIVED; archive clears it | Mock enforces cap + guard | CONFIRMED (rule) / PROPOSED (transport) | Enforce cap + clear-on-archive | No | |
| PRODUCT-13 | Slug | Public route `/{storeId}/product/{productId}/{slug}` | Product DTO has no slug; frontend derives via `utils/slugify` | UNRESOLVED | Decide derive client-side vs expose on DTO | No | Contract §10.1(10) |
| PRODUCT-14 | Auto Archive expiry | Scheduled SOLD_OUT → ARCHIVED once past the store threshold; catalog excludes expired SOLD_OUT | Mock lazily derives from `soldOutAt`; frontend renders what the API returns | BACKEND DEPENDENCY | Implement scheduler + expose status | Yes | Contract §5 / §10.1(2) |
| PRODUCT-15 | Seller category filter | `/seller/products?category=...` server or client side | URL query is the source of truth; mock filters client-side | BACKEND DEPENDENCY | Confirm server vs client | No | Contract §10.1(4) |

### Category / Brand

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking M12? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CATEGORY-1 | List | `GET /categories` → default + current-store custom | Adapter lists | PROPOSED | Scope to session store | No | |
| CATEGORY-2 | Create | `POST /categories { name, parent_id? }` → DTO | Adapter sends snake_case | PROPOSED | Validate max 2 levels | No | |
| CATEGORY-3 | Update | `PATCH /categories/{id} { name?, parent_id? }` → DTO | Adapter trims name, passes parent_id | PROPOSED | Confirm rename propagation | No | |
| CATEGORY-4 | Delete | `DELETE /categories/{id}` → `{ deleted }` | Adapter defaults `deleted:true` | PROPOSED | Block while in use / has children (`409`) | No | |
| CATEGORY-5 | Category rules | Max 2 levels; one category per product (name-keyed `product.category`); custom categories store-scoped; delete blocked by product use or child; no cascade | Mock enforces all | CONFIRMED | Enforce server-side | No | |
| CATEGORY-6 | Rename propagation | Renaming a category updates products referencing the old name | Mock propagates; backend behavior unknown | BACKEND DEPENDENCY | Decide: propagate or store category id | No | Name-keyed join risk |
| BRAND-1 | List | `GET /brands` → current-store brands | Adapter lists | PROPOSED | Scope to session store | Yes | Contract says endpoints "proposed for M11, not implemented" |
| BRAND-2 | Create | `POST /brands { name }` → DTO | Adapter sends `{ name }` | PROPOSED | Reject duplicate name in store | Yes | |
| BRAND-3 | Update | `PATCH /brands/{id} { name? }` → DTO | Adapter trims | PROPOSED | Confirm rename propagation | Yes | |
| BRAND-4 | Delete | `DELETE /brands/{id}` → `{ deleted }` | Adapter defaults `deleted:true` | PROPOSED | Block while any product references | Yes | |
| BRAND-5 | Brand model | Store-scoped; product references brand by **name** (`product.brand`), not `brandId`; delete usage counts ARCHIVED too | Mock implements name join | PROPOSED | Confirm name key vs `brand_id`; declare if backend uses an id | Yes | Options A(string)/B(brandId)/C(migration) still open |
| BRAND-6 | Brand filter | `/seller/products?brand={brandId}` server or client side | UI applies filter; URL query source of truth | BACKEND DEPENDENCY | Confirm server vs client | No | |

### Customer Interest / Recent Activity

| ID | Area | Required backend behavior | Current frontend assumption | Confirmed? | Required backend action | Blocking M12? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| INTEREST-1 | List | `GET /stores/{storeId}/customer-interests` → DTO[], newest first | Adapter lists | PROPOSED | Scope to owner/session | No | |
| INTEREST-2 | Record | `POST /customer-interests` → DTO | Adapter sends store_id, product_id, channel, snapshots, context | PROPOSED | Confirm body fields + ownership derivation | Yes | Identity source open |
| INTEREST-3 | Identity source | Session vs request body for `customer_name/email/phone` | Adapter sends client snapshots; backend expected to trust session | BACKEND DEPENDENCY | Declare session as source of truth | Yes | Contract §8 opens this |
| INTEREST-4 | Self-store exclusion | Owner's own clicks never recorded | Frontend skips in mock; API posts as-is and relies on backend | CONFIRMED (rule) / BACKEND DEPENDENCY | Enforce server-side | No | |
| INTEREST-5 | Allowed types | Only `WHATSAPP_CLICK` and `MARKETPLACE_CLICK` | Service + mock enforce | CONFIRMED | Reject others | No | |
| ACTIVITY-1 | List | `GET /activities` → DTO[], newest first | Adapter lists + canonical filter | PROPOSED | Scope to session store | No | |
| ACTIVITY-2 | Record | `POST /activities { type, message, product_id?, product_name? }` → DTO | Adapter sends those keys | PROPOSED | Confirm server-side record on actions | No | |
| ACTIVITY-3 | Canonical types | Exactly 7 seller/store types; `PRODUCT_UPDATED` is the external alias of `PRODUCT_EDITED` | Mapper normalizes alias; service filters to canonical | PROPOSED (alias) | Accept alias or switch to one name | No | Contract §8 |
| ACTIVITY-4 | Date field | Is the wire `date` an ISO-8601 timestamp or an already-formatted `12.09.2026`? | Mapper accepts `date` or `created_at`; UI formats via `utils/datetime` | UNRESOLVED | Pick one and align contract §1 with §8 | Yes | Contract internally inconsistent |
| ACTIVITY-5 | Slice/filter | Dashboard 4-item slice and `/seller/activities` type/single-date filter — server or client | Client-side today | BACKEND DEPENDENCY | Confirm server vs client | No | Frontend route only, no new endpoint |
| ACTIVITY-6 | Auto Archive event | A scheduler-driven SOLD_OUT→ARCHIVED transition must emit `PRODUCT_ARCHIVED` | Mock records it on manual archive; scheduler event not modeled | BACKEND DEPENDENCY | Emit activity on auto-archive | No | |

---

## 3. Audit matrix

| Feature | Frontend | API Adapter | Docs | Backend Status | Action |
| --- | --- | --- | --- | --- | --- |
| Login / session | `authService`, `AuthProvider`, `RequireAuth` | `authApi` | §3 | PROPOSED | Confirm DTO + token transport |
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
| Featured | `ProductCatalogSettingsSection`, guards | `productApi.toggleFeatured` | §5 | CONFIRMED rule | Enforce cap (max 10) + lifecycle: only from PUBLISHED; SOLD_OUT clears featured; reactivation does not restore |
| Categories | `CategoriesPage` | `categoryApi` | §6 | PROPOSED | Confirm delete/rename |
| Brands | `BrandsSection` | `brandApi` | §6.1 | PROPOSED | Confirm name-vs-id model |
| Customer Interest | `CustomerInterestPage`, storefront actions | `customerInterestApi` | §7 | PROPOSED | Confirm identity + body |
| Recent Activity | `DashboardPage`, `RecentActivitiesPage` | `activityApi` | §8 | PROPOSED | Confirm date field |
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
- `toRecentActivity` normalizes `PRODUCT_UPDATED` → `PRODUCT_EDITED` and accepts
  `date` or `created_at`.

---

## 5. Open frontend/product decisions

1. **Account without store (ACCOUNT-2) — RESOLVED in M11.** `SellerLayout`
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
   client-side.

---

## 6. Documentation cross-check

- `docs/API-CONTRACT.md` remains marked **PROPOSED**; no section of this audit
  promotes it to confirmed.
- The brand section labels the `/brands` endpoints "proposed for M11 and are not
  implemented", yet `src/services/adapters/api/brandApi.js` already calls them.
  This is a wording mismatch, not a behavior change; the endpoints stay
  `PROPOSED`.
- No new endpoint is invented by this document beyond what already exists in the
  adapters and `docs/API-CONTRACT.md`.
