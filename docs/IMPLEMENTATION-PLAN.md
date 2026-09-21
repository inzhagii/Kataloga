# Kataloga — Implementation Plan

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan urutan implementasi frontend Kataloga.

Tujuannya:

- membangun frontend secara bertahap
- menjaga scope tetap terkendali
- menghindari implementasi seluruh aplikasi sekaligus
- memastikan setiap tahap dapat diverifikasi sebelum lanjut
- menjaga UI tetap sesuai screenshot yang sudah dikunci
- mempersiapkan frontend agar mudah diintegrasikan dengan backend/API

Dokumen ini merupakan roadmap tingkat tinggi.

Detail implementasi setiap task harus direncanakan menggunakan OpenCode Plan Mode sebelum coding untuk task yang non-trivial.

Testing dan visual QA dilakukan secara incremental di sepanjang implementation, bukan hanya di akhir.

Jangan mengklaim suatu phase implementation selesai hanya karena dokumentasi sudah diperbarui.

---

## 2. Source of Truth

Urutan acuan:

```text
docs/API-CONTRACT.md (frontend-facing contract, Phase A reconciled)
        ↓
docs/PRODUCT.md
        ↓
docs/UX-FLOW.md
        ↓
docs/ROUTES.md
        ↓
docs/UI_RULES.md
        ↓
docs/IMPLEMENTATION-PLAN.md
        ↓
reference/screenshots/  (visual source of truth)
        ↓
reference/stitch-code/  (implementation reference, bukan production code)
        ↓
existing production code di src/
```

`reference/screenshots/` digunakan sebagai visual source of truth.

`reference/stitch-code/` digunakan sebagai implementation reference.

Bukan production code.

Jangan menganggap kode dari Stitch harus digunakan mentah-mentah.

---

## 3. Implementation Principles

### 3.1 Incremental Development

Jangan meminta agent membangun seluruh Kataloga dalam satu task.

Gunakan:

Small Task
   ↓
Implement
   ↓
Verify
   ↓
Fix
   ↓
Commit
   ↓
Next Task

Setiap task kecil menjalankan verification (TypeScript, build, routing, responsive, lint) sebelum dianggap selesai.

### 3.2 UI First, Logic Second

Untuk page yang memiliki screenshot final:

Screenshot
   ↓
Layout
   ↓
Responsive UI
   ↓
Interaction
   ↓
State
   ↓
API Integration

Jangan langsung menggabungkan seluruh UI + backend logic dalam satu task besar.

### 3.3 Reusable Components

Prioritaskan component reusable.

Contoh:

SellerLayout
SellerSidebar
BottomNavigation
MoreMenu
ProductForm
ProductCard
ProductGrid
StoreHeader
StoreActions
MarketplaceSelector
ShareButton
EmptyState
LoadingState
ErrorState

### 3.4 Document-Driven

Setiap task dimulai dari dokumen.

Keterlibatan agent dimulai dengan:

Read Relevant Docs
        ↓
Inspect Existing Code
        ↓
Inspect Screenshot
        ↓
Plan Mode
        ↓
Review Plan (finalisasi bersama user)
        ↓
Implementation
        ↓
Run Checks
        ↓
Visual Verification
        ↓
Fix
        ↓
Commit

### 3.5 No False Completion

Testing dan visual QA tidak hanya dilakukan di tahap akhir.

Setiap phase implementation harus diverifikasi secara incremental:

- TypeScript
- Build
- Routing
- Responsive behavior
- Existing functionality

Memperbarui dokumentasi bukan pengganti implementasi dan verification.

---

## 4. Phase Overview

Kataloga dikerjakan dalam dua fase besar:

```text
PHASE A  → Documentation & Architecture Reconciliation (docs-only)
Phase A Review → Human review
PHASE B  → Incremental Source Implementation (11 phase, menyentuh src/)
```

Prinsip:

- Phase A bersifat persiapan dan TIDAK mengubah production code (`src/`, `tests/`,
  config, `package.json`, `package-lock.json`).
- Phase B baru menyentuh `src/`, dan baru dimulai setelah Phase A disetujui.
- Urutan phase B harus dipertahankan.
- Jangan menggabungkan beberapa phase dalam satu task kecuali disetujui.

---

## 5. Phase A — Documentation & Architecture Reconciliation

### Goal

Menyinkronkan seluruh docs frontend Kataloga dengan Backend Business/API Contract
dan locked requirements, serta dengan kondisi production code aktual.

Phase A adalah pekerjaan documentation-only.

### Scope

Selaraskan:

- `docs/PRODUCT.md`
- `docs/UX-FLOW.md`
- `docs/ROUTES.md`
- `docs/UI_RULES.md`
- `docs/API-CONTRACT.md`
- `docs/BACKEND-DEPENDENCIES.md`
- `docs/IMPLEMENTATION-PLAN.md` (dokumen ini)
- `AGENTS.md`

Item kunci yang diselaraskan pada Phase A (hasil akhir tercatat di docs):

- Authentication & API transport: Laravel Sanctum session auth (cookie + CSRF,
  `credentials: 'include'`, `GET /sanctum/csrf-cookie`, `X-CSRF-TOKEN`, 419 → /login).
  Tidak ada JWT, Bearer, atau localStorage token.
- Store model: 1 account = 1 store; numeric `store.id` vs publik `store_id`.
- Store ID rules: max 50 karakter, 30-hari cooldown, historical alias 90 hari lalu kedaluwarsa (backend-owned).
- Product lifecycle: DRAFT / PUBLISHED / SOLD_OUT / ARCHIVED; termasuk
  SOLD_OUT → DRAFT (edit sebelum republish) dan ARCHIVED → DRAFT (restore).
- Auto Archive store-level: nilai hanya **Never (`null`, default) / 1 / 7 / 30 /
  90 / 180 / 360 hari** (bukan 365, bukan "Tidak ada"); UI di halaman Archive.
- Product Unggulan: toggle hanya pada PUBLISHED **atau SOLD_OUT**; SOLD_OUT
  **mempertahankan** featured; reactivation tidak mengubahnya; archiving menghapus.
- Product Publish Validation: name, slug, photos (1–5, satu utama), category,
  description, condition, price (0 valid); Product Details / attributes opsional.
- Category dua level; default category dikelola Kataloga (tidak dapat diedit/dihapus).
- Brand: global/default (`store_id` null, seeded, read-only) + custom store-scoped.
- Customer Interest: agregasi (context `STORE|PRODUCT`, `channel`, `total_clicks`);
  tidak ada `channel_type`; destination dibuka hanya setelah POST berhasil.
- Recent Activity: dibuat oleh backend; frontend hanya mengonsumsi; 11 tipe kanonik
  (termasuk `PRODUCT_UPDATED`); tidak ada `POST /activities`.
- Store DTO: `whatsapp` dedicated field + `external_links` terpisah
  (`platform_name`/`store_url` wire).
- Search/filter/sort: backend-owned dalam API mode; mock mode = client-side.
- Envelope: `{data,message}` / `{data,meta{current_page,per_page,total}}` / `{message,errors}`.
- Mock data policy: bukan production data source; bukan silent fallback di API mode.

Verifikasi ketiadaan konsep yang sudah tidak berlaku:

- availability field
- per-product retention
- status ACTIVE sebagai database status
- date range filter pada /seller/activities dan Customer Interest
- SOLD_OUT yang tampil permanen tanpa auto archive
- `channel_type`
- `POST /activities` dari frontend

Frontend tidak menambah endpoint API; gap backend dicatat di
`docs/BACKEND-DEPENDENCIES.md` section 7 "API Dependencies / Confirmation Required"
dan `docs/API-CONTRACT.md` sebagai `API DEPENDENCY / CONFIRMATION REQUIRED`.

### Deliverable

- `docs/API-CONTRACT.md` konsisten (frontend-facing contract, Phase A reconciled).
- `docs/BACKEND-DEPENDENCIES.md` register konsisten + daftar API dependencies/confirmation required.
- Tidak ada contradiction antar dokumen.
- `AGENTS.md` mencerminkan kondisi production code.

### Verification (Phase A Review)

- Cross-check antar dokumen (API-CONTRACT ↔ PRODUCT ↔ UX-FLOW ↔ ROUTES ↔ UI_RULES ↔ AGENTS).
- Lifecycle sama di semua dokumen (termasuk `SOLD_OUT → DRAFT`; tidak ada status ACTIVE).
- Auto Archive konsisten: hanya Never(null)/1/7/30/90/180/360; UI di halaman Archive.
- Product Unggulan konsisten: SOLD_OUT mempertahankan featured; archiving menghapus.
- Recent Activity: 11 tipe kanonik; backend-created; no `POST /activities`.
- Date format `12.09.2026` konsisten; datetime `12.09.2026 · 18:02`.
- `src/`, `tests/`, `package.json`, `package-lock.json`, dan file konfigurasi TIDAK berubah selama Phase A.

---

## 6. Phase B — Incremental Source Implementation

### Goal

Membangun production frontend secara incremental per task yang sudah selaras
dengan contract Phase A.

Setiap task di Phase B dilakukan dengan urutan:

Read Docs
    ↓
Plan Mode (untuk task non-trivial)
    ↓
Inspect Existing Code
    ↓
Implement
    ↓
Run Checks (TypeScript, lint, build)
    ↓
Visual QA / Responsive Check
    ↓
Commit

### Urutan phase B

Eleven phase, urutan dipertahankan:

1. **B-1 API transport + Authentication (Sanctum)** — `credentials: 'include'`,
   CSRF bootstrap (`GET /sanctum/csrf-cookie`, `X-CSRF-TOKEN`), 419 → /login;
   hapus Bearer/`setAccessToken` dari transport. Bagian permulaan yang paling
   tidak bergantung pada decision backend lain.
2. **B-2 Envelope + Error Handling** — konsumsi `{data,message}` /
   `{data,meta}` / `{message,errors}`; `ApiError` + `authErrors` final.
3. **B-3 Product Lifecycle** — dedicated endpoints
   (publish / sold-out / mark-available / archive / restore); SOLD_OUT → DRAFT;
   replace generic status PATCH; status tabs seller tanpa Sort.
4. **B-4 Product Data + Validation + Slug** — product DTO final (photos 1–5,
   satu utama, `price` 0 valid, details opsional); `utils/productValidation`
   sinkron dengan contract; slug (backend-owned / klient fallback).
5. **B-5 Featured + Auto Archive** — featured (max 10, SOLD_OUT mempertahankan,
   archive menghapus); Auto Archive `Never(null)/1/7/30/90/180/360` di halaman
   Archive; katalog berisi PUBLISHED + SOLD_OUT dalam jendela auto archive.
6. **B-6 Store + Categories + Brands** — store DTO (`whatsapp` +
   `external_links`), Store ID cooldown/alias UI; category 2 level + default
   read-only; brand global + custom.
7. **B-7 Customer Interest** — agregasi (`context STORE|PRODUCT`, `channel`),
   channel selection → auth check → POST → redirect hanya setelah sukses;
   konsisten dengan self-store exclusion.
8. **B-8 Recent Activity (consumption only)** — `GET /activities`; hapus
   `POST /activities`; 11 tipe kanonik (`PRODUCT_UPDATED`); dashboard 4 item +
   `/seller/activities` (single-date filter, date picker).
9. **B-9 Search / Filter / Sort / Pagination** — query params backend-owned
   (search, category, condition, sort, page); hapus client-side search yang
   duplikat pada API mode; meta pagination.
10. **B-10 Mock Isolation + Cleanup** — pastikan mock tidak pernah menjadi
    production/API fallback; bersihkan branch mock yang tidak relevan setelah
    fitur terverifikasi di API mode; mock boleh tetap untuk unit test terisolasi.
11. **B-11 Tests / Integration** — unit + integration dimaksimalkan ke
    contract; regression seller + customer; visual QA menyeluruh.

Phase B-1 sampai B-9 bersifat dependency-safe: setiap phase dapat dikerjakan
tanpa menunggu keputusan backend untuk phase berikutnya, karena seluruh kontrak
sudah direkonsiliasi pada Phase A dan adapters tetap menjadi proposal sampai
backend tersedia.

### Catatan lintas phase (B-1 s.d. B-11)

- Production/API mode tidak boleh silent-fallback ke mock.
- API failure tidak boleh menghasilkan respons sukses palsu.
- Setiap data-driven page: loading / success / empty / error.
- Product Detail customer-facing tidak merender External Product Links.
- Katalog aktif terurut: Featured Published → Published lebih baru → Published
  lebih lama → Sold Out.
- Seller Products page: status Active | Draft | Sold Out; Archive sebagai aksi
  terpisah; Auto Archive setting di halaman Archive (bukan My Store).

---

## 7. Persisted Principles

Bagian ini berlaku di seluruh phase.

### 7.1 Backend Dependency

Jika frontend membutuhkan backend behavior yang belum tersedia:

Gunakan mock/stub hanya untuk development.

Catat dependency yang dibutuhkan secara eksplisit di `docs/BACKEND-DEPENDENCIES.md`.

Jangan membuat business logic palsu untuk meniru production behavior tanpa alasan.

Contoh:

Backend Dependency:
- Sanctum session auth + CSRF routes
- Create Store API
- Product CRUD + lifecycle endpoints
- Customer Interest aggregation API
- External Channel / Brand / Category API
- Auto Archive scheduling

### 7.2 No Reinvention Rule

Agent tidak boleh mengarang:

feature baru
route baru
business rule baru
data field baru
analytics baru
navigation baru
UI section baru

jika tidak ada di:

docs/PRODUCT.md
docs/UX-FLOW.md
docs/ROUTES.md
docs/UI_RULES.md
docs/API-CONTRACT.md
reference/screenshots/
existing implementation

Jika requirement ambigu dan berdampak terhadap UX/architecture:

Stop
↓
Explain ambiguity
↓
Propose options
↓
Wait for decision

### 7.3 Mock Data Strategy

Mock data boleh digunakan selama API belum tersedia.

Policy mock data:

- Mock data BUKAN production data source dan BUKAN application state.
- Production/API mode TIDAK boleh silent-fallback ke mock — kegagalan API tidak
  boleh menghasilkan respons sukses palsu dari mock.
- Mock tidak boleh menyamar sebagai data backend di depan seller/customer.
- Mock tidak dihapus sebelum task API cleanup (B-10) terverifikasi; dapat tetap
  dipakai untuk unit test terisolasi dan development sementara.
- Pisahkan mock dari UI, gunakan typed models, dan sediakan API-ready abstraction
  sehingga replacement mudah saat API tersedia.

### 7.4 API Readiness

Frontend harus menggunakan service/API layer.

Jangan menyebarkan raw API calls ke seluruh component.

Contoh conceptual structure:

src/
└── services/
    ├── auth/
    ├── stores/
    ├── products/
    ├── categories/
    └── customer-interest/

Struktur aktual dapat menyesuaikan architecture project.

### 7.5 Dynamic Asset Integration

Asset dari backend:

Store Logo
Product Images
Seller Avatar

harus berasal dari API/data source.

Contoh:

store.logoUrl
product.imageUrl
user.avatarUrl

Jangan memindahkan dynamic production asset ke src/assets/.

Customer tidak menggunakan uploaded profile photo pada V1 (generic user-circle icon).

### 7.6 Scope Control

V1 tidak mencakup:

Checkout
Payment
Order Management
Inventory / Stock Quantity
Advanced Analytics
Full CRM
Share Analytics
QR Code
Complex Marketplace Integration

Jangan memasukkan feature tersebut ke implementation backlog tanpa keputusan product baru.

### 7.7 Git Strategy

Gunakan commit kecil dan terarah.

Contoh:

feat: initialize react project
feat: add shared ui components
feat: implement marketing landing
feat: implement authentication pages
feat: implement public store
feat: implement product detail
feat: add seller layout
feat: implement seller dashboard
feat: implement products management
feat: implement categories
feat: implement my store
feat: implement customer interest
feat: implement account
feat: integrate api services
fix: ...
refactor: ...

Jangan menggunakan satu commit besar untuk seluruh aplikasi.

Jangan commit/push kecuali diminta eksplisit oleh user.

### 7.8 Documentation Reading Rule

Sebelum mengerjakan task, agent harus membaca dokumen yang relevan.

Contoh:

Store Landing

Read:

docs/PRODUCT.md
docs/UX-FLOW.md
docs/ROUTES.md
docs/UI_RULES.md
reference/screenshots/customer/

Seller Dashboard

Read:

docs/PRODUCT.md
docs/UX-FLOW.md
docs/ROUTES.md
docs/UI_RULES.md
reference/screenshots/seller/

Tidak perlu membaca seluruh repository secara membabi buta jika task hanya menyentuh area tertentu.

### 7.9 Screenshot Reference Rule

Jika task memiliki screenshot reference:

Screenshot = Visual Source of Truth

Agent harus:

membaca screenshot
memahami layout
mencocokkan component
implementasi responsive version
tidak melakukan redesign tanpa approval

### 7.10 Final Principle

Kataloga frontend harus dibangun dengan prinsip:

Locked Requirements
        +
Approved Screenshots
        +
Reusable Components
        +
Reconciled API Contract (Phase A)
        +
Incremental Implementation
        +
API-ready Architecture
        +
Continuous Verification

Tujuan utama bukan membuat code sebanyak mungkin.

Tujuan utama adalah menghasilkan frontend Kataloga yang:

sesuai requirement
sesuai UI reference
responsive
maintainable
reusable
mudah diintegrasikan dengan backend
tidak memiliki business logic hasil asumsi