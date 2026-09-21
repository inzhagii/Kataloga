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
reference/screenshots/
        ↓
PRODUCT.md
        ↓
UX-FLOW.md
        ↓
ROUTES.md
        ↓
UI_RULES.md
        ↓
IMPLEMENTATION-PLAN.md
        ↓
Production Code
Reference Screenshot
reference/screenshots/

Digunakan sebagai visual source of truth.

Stitch Code
reference/stitch-code/

Digunakan sebagai implementation reference.

Bukan production code.

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

Struktur phase disusun agar setiap phase dapat diverifikasi sebelum lanjut.

```text
Phase 0      → Documentation & AGENTS Alignment
Phase 0.1    → Documentation Verification
Phase 1      → Frontend Read-Only Audit
Phase 1 Review → Human review of audit results
Phase 2      → Implementation Planning
Phase 3+     → Incremental Implementation
```

Prinsip:

- Phase 0 sampai Phase 2 bersifat persiapan dan TIDAK mengubah production code.
- Phase 3+ baru menyentuh `src/`.
- Urutan phase harus dipertahankan.
- Jangan menggabungkan beberapa phase dalam satu task kecuali disetujui.

---

## 5. Phase 0 — Documentation & AGENTS Alignment

### Goal

Memastikan seluruh dokumentasi frontend Kataloga selaras dengan locked requirements sebelum membangun production code.

Dokumentasi frontend adalah pekerjaan documentation-only.

### Scope

Selaraskan terhadap source of truth:

`docs/PRODUCT.md`
`docs/UX-FLOW.md`
`docs/ROUTES.md`
`docs/UI_RULES.md`
`docs/API-CONTRACT.md`
`AGENTS.md`

Item yang diselaraskan pada Phase 0:

Account model (email verification vs. phone)
Store model
Store ID rules + historical aliases
Store Landing / Navbar / Footer
Store Actions (dengan / tanpa marketplace; label `Hubungi via WhatsApp`)
Public Store URL pattern
Product Lifecycle (DRAFT / PUBLISHED / SOLD_OUT / ARCHIVED; tidak ada SOLD_OUT → DRAFT)
Auto Archive store-level (nilai: Tidak ada default / 1 / 7 / 30 / 90 / 180 / 365 hari / Never; UI di halaman Archive)
Product Unggulan (boolean, max 10, hanya dari PUBLISHED; archiving dan SOLD_OUT menghapus status; reactivation tidak mengembalikan)
Product Card field order
Product Detail hierarchy
Seller Products page layout (status tabs, tanpa Sort)
Brand Management
Customer Interest layout dan context
Recent Activity (7 tipe, single-date filter)
Date format `12.09.2026`
Customer vs Seller Separation
Seller Navigation (sidebar + bottom navigation + More)
Dashboard (Catalog Overview satu baris, icons, side-by-side sections)

Verifikasi ketiadaan konsep yang sudah tidak berlaku:

availability field
per-product retention (1 / 7 / 14 / 30 hari)
date range filter pada /seller/activities dan Customer Interest
SOLD_OUT yang tampil permanen tanpa auto archive

Frontend tidak menambah endpoint API; gap backend dicatat di `docs/API-CONTRACT.md` sebagai item pending konfirmasi backend.

### Deliverable

Seluruh dokumen di `docs/` konsisten.

AGENTS.md mencerminkan kondisi production code.

Tidak ada contradiction antar dokumen.

---

## 6. Phase 0.1 — Documentation Verification

### Goal

Memverifikasi hasil Phase 0 sebelum masuk ke audit code.

### Scope

Verifikasi silang setiap dokumen:

PRODUCT.md ↔ UX-FLOW.md ↔ ROUTES.md ↔ UI_RULES.md ↔ API-CONTRACT.md ↔ AGENTS.md

Checklist:

- Lifecycle sama di semua dokumen (termasuk `DRAFT → ARCHIVED`, dan tidak ada `SOLD_OUT → DRAFT`).
- Auto Archive store-level konsisten; tidak ada sisa retention per-product. Nilai hanya: Tidak ada (default) / 1 / 7 / 30 / 90 / 180 / 365 hari / Never; UI di halaman Archive (bukan My Store).
- Terminologi Product Unggulan konsisten; hanya dari PUBLISHED; SOLD_OUT menghapus featured; reactivation tidak mengembalikan.
- Navigation seller konsisten (sidebar, bottom nav, More).
- Date format `12.09.2026` konsisten; datetime `12.09.2026 · 18:02`; filter tanggal tunggal memakai date picker.
- Seller Products menggunakan status tabs dan tanpa Sort.
- Product Detail tidak menampilkan External Product Links; Brand ditampilkan sebagai "Brand : X".
- Action category/brand card menggunakan "Lihat Produk" (bukan "Lihat Semua").
- API-CONTRACT.md propopsed/pending; tidak ada endpoint yang dianggap final.
- `src/`, `tests/`, `package.json`, `package-lock.json`, dan file konfigurasi TIDAK berubah selama Phase 0.

### Deliverable

Laporan verifikasi singkat: daftar file yang diperiksa, hasil cross-check, dan daftar contradiction yang tersisa (jika ada).

---

## 7. Phase 1 — Frontend Read-Only Audit

### Goal

Memahami kondisi project saat ini sebelum mengubah UI.

Phase ini READ-ONLY: tidak ada perubahan code.

Sebelum mengubah code project, agent harus:

- baca seluruh file di `src/`
- identifikasi struktur UI yang sudah ada
- identifikasi component reusable yang sudah ada
- identifikasi data model / service layer yang sudah ada
- identifikasi gap terhadap PRODUCT.md / ROUTES.md / UI_RULES.md
- susun daftar file yang perlu diubah / dibuat

### Important

Agent tidak boleh mengasumsikan folder structure project.

Struktur final mengikuti architecture yang sudah ada setelah inspeksi.

Jangan memaksakan folder structure jika project yang sudah ada memiliki architecture yang lebih baik.

### Deliverable

Laporan audit arsitektur singkat.

Daftar file yang perlu diubah.

Daftar component reusable yang perlu dibuat.

---

## 8. Phase 1 Review — Human Review

### Goal

Hasil audit Phase 1 direview oleh manusia sebelum perencanaan implementasi.

### Scope

Human menyetujui / mengoreksi:

- temuan audit
- daftar file yang akan diubah
- daftar component yang akan dibuat
- prioritas area kerja

### Deliverable

Audit yang sudah disetujui / hasil review.

Audit inilah yang menjadi dasar Phase 2 (Implementation Planning).

---

## 9. Phase 2 — Implementation Planning

### Goal

Menyusun rencana implementasi berdasarkan audit aktual.

### Scope

Urutan kerja umum mengikuti struktur:

Foundation
→ Shared Components
→ Marketing
→ Authentication
→ Public Storefront
→ Product Detail
→ Seller Layout
→ Dashboard
→ Products
→ Add/Edit Product
→ Categories
→ Brand Management
→ My Store
→ Customer Interest
→ Recent Activity (incl. /seller/activities)
→ Profile
→ API Integration
→ Validation
→ Testing
→ Visual QA

Untuk setiap area:

- pecah menjadi task kecil yang dapat diverifikasi
- sediakan route yang terpengaruh
- sediakan component yang dibuat/diubah
- sediakan data/model yang diperlukan
- sediakan potential regression
- sediakan verification yang dilakukan

Untuk task non-trivial: gunakan Plan Mode per task sebelum implementasi.

### Deliverable

Rencana task terperinci (task breakdown) untuk Phase 3+.

---

## 10. Phase 3+ — Incremental Implementation

### Goal

Membangun production frontend secara incremental per task yang sudah direncanakan di Phase 2.

Setiap task dilakukan dengan urutan:

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

### 10.1 Authentication + Account

#### Routes

/login
/register
/create-store
/seller/account

#### Scope

Login

- email atau phone + password
- kehilangan akses → recovery email (jika akun aktif via phone)

Register

- alert:
  - register dengan email verifikasi
  - register dengan phone tidak verifikasi (perlu recovery email)

Context preservation:

- WhatsApp Action
- Marketplace Action
- Protected Seller Route

Account (Profile):

- nama
- email
- phone
- password
- change password membutuhkan email terkini terlebih dahulu
- logout

Semua protected route harus login.

Create Store membutuhkan login.

Untrust store ownership check.

### 10.2 Store + Storefront

#### Routes

Public:

/{storeId}

Seller:

/seller/my-store

#### Scope

Store Landing:

navbar (logo, name, city/province)
header
actions (Hubungi via WhatsApp, Marketplace, Share)
announcement
featured products (Product Unggulan)
product grid/card
footer

Store management:

Create Store (Store Name + Store ID saja)
My Store (lengkapi data store, validasi saat simpan)

My Store menyediakan setting:

Store Logo
Store Name
Store ID
Store Description / Bio
Province
City / Regency
Full Address (opsional, free-text)
Operating Hours
WhatsApp
External Sales Channels
Announcement

Auto Archive TIDAK berada di My Store; UI-nya terletak pada halaman Archive (/seller/products/archived).

Operating Hours menggunakan field terstruktur:

- Hari Mulai
- Hari Selesai
- Jam Buka
- Jam Tutup

(contoh: Hari Mulai Senin, Hari Selesai Minggu, Jam Buka 08:00, Jam Tutup 17:00). Bukan input teks bebas.

Perubahan My Store bersifat draft sampai Simpan; konfirmasi navigasi jika ada perubahan belum disimpan.

Mobile: judul halaman My Store centered.

Store Link (Salin, Bagikan; tidak ada QR)

QR tidak akan dibuat.

Store ID:

validasi format usage
30-day change restriction
availability check

### 10.3 Seller Layout + Dashboard

#### Routes

/seller/dashboard

#### Scope

Seller Layout:

SellerSidebar (Kataloga, Dashboard, Products, Customer Interest, Recent Activity, My Store, Categories, Account Card, Logout)

Mobile: BottomNavigation (Dashboard, Products, Customer Interest) + More (Recent Activity, My Store, Categories, Profile, Logout)

Dashboard:

Catalog Overview dalam satu baris: Active | Draft | Sold Out | Archive (icons sebagai visual anchor)
Quick Actions
Customer Interest + Recent Activity side-by-side

Setiap section memiliki "Lihat Semua" di kanan atas heading.

#### Catatan untuk Milestone Seller Navigation (M8)

Findings dari audit M3 — navigasi seller saat ini belum sepenuhnya sesuai PRODUCT.md §36 / UI_RULES.md §7. Perbaikan ditunda ke milestone Seller Navigation (M8); jangan diubah pada M3:

1. Item "Recent Activity" tidak ada pada `SELLER_SIDEBAR_ITEMS` (sidebar desktop) maupun `SELLER_MORE_ITEMS` (More mobile). Route `/seller/activities` sudah terdaftar di router; hanya navigasi yang belum mencantumkannya.
2. Urutan sidebar desktop berbeda dari spec (Current: Dashboard, Products, Categories, Customer Interest, My Store; Spec: Dashboard, Products, Customer Interest, Recent Activity, My Store, Categories).
3. Brand "Kataloga" pada `SellerSidebar` dan `SellerHeader` (mobile) adalah `<span>` bukan link ke Dashboard (spec: brand link ke Dashboard).

### 10.4 Products + Product Lifecycle

#### Routes

/seller/products
/seller/products/new
/seller/products/:productId/edit
/seller/products/archived

#### Scope

Product list (search/filter; tanpa Sort)

Layout Seller Products:

Desktop: judul + Add Product satu baris; Search dan Filter sejajar; status tabs Active | Draft | Sold Out; Archive sebagai aksi terpisah.
Mobile: Search, lalu Filter + Archive, lalu status tabs.

Products status:

DRAFT
PUBLISHED
SOLD_OUT
ARCHIVED

Lifecycle:

DRAFT → PUBLISHED
PUBLISHED → SOLD_OUT
SOLD_OUT → PUBLISHED (reactivasi; label aksi seller "Publish Kembali")
PUBLISHED → ARCHIVED
DRAFT → ARCHIVED
ARCHIVED → DRAFT (restore)

Tidak ada SOLD_OUT → DRAFT.

Product Status Actions (Seller):

PUBLISHED (Active): Lihat Product, Edit, Archive, Feature / Unfeature
DRAFT: Edit, Publish, Archive (tanpa Lihat Product; tanpa Feature)
SOLD_OUT: Lihat Product, Publish Kembali, Archive
ARCHIVED (halaman Archive): Detail Product (read-only), Restore

Auto Archive:

setting store-level (nilai: Tidak ada default / 1 / 7 / 30 / 90 / 180 / 365 hari / Never; Never tidak memblokir manual archive); UI di halaman Archive; SOLD_OUT yang melewati threshold → ARCHIVED (backend scheduling; frontend menampilkan status hasil backend).

ProductForm reusable:

Add Product

- Save as Draft
- Publish Product

Edit Product

- Batal
- Simpan

Product Edited activity hanya dibuat saat Simpan berhasil.

Product Unggulan (boolean; max 10 per store; archiving menghapus status).

#### Notes

Jangan menambah field:

stock
quantity
remainingStock
lowStock

Customer-facing storefront hanya menampilkan PUBLISHED + SOLD_OUT yang masih dalam jendela auto archive.

### 10.5 Product Listing + Categories + Brand

#### Routes

Public:

/{storeId}/products

Seller:

/seller/categories

#### Scope

Product Listing (/products):

Product grid
Search
Category filter
Filter
Sort
Ordering:

Featured Published → Published lebih baru → Published lebih lama → Sold Out

Product Detail (Public):

Brand (jika tersedia) dengan format eksplisit "Brand : X"
Product Unggulan indicator (jika featured)
Product Name
Price (bold)
Category / Condition (bersebelahan, di bawah Price)
Actions
Product Details
Description

Bagian External Product Links TIDAK dirender pada Product Detail customer-facing (field tetap ada pada form/API).

Primary action: "Hubungi via WhatsApp". Marketplace + Share adalah secondary actions; Marketplace hanya jika store memiliki external channel aktif.

Desktop: image/gallery fixed di kiri, panel info scroll di dalam area, footer di luar scroll.

Mobile: images swipe-only carousel/slider, info di bawah.

Product Detail — Sold Out:

Sold Out indicator
WhatsApp tidak tersedia
Marketplace tidak tersedia
Share tetap tersedia

Categories:

Custom category scoped ke store
Kategori Utama + Sub Kategori
"Lihat Produk" → /seller/products?category=...
Category deletion diblokir jika masih digunakan
Kategori Utama yang memiliki child tidak dapat dihapus
Category usage count Kategori Utama mencakup descendant
Tanpa cascade delete

Brand:

Brand optional, terpisah dari Category
Brand card grid (desktop 4×4, mobile 2×2): nama, usage count, Edit, Lihat Produk
Lihat Produk menerapkan filter brand
Delete hanya jika usage = 0
Brand dapat dibuat dari Add/Edit Product

#### Notes

Search/filter/sort pada listing customer berada di route yang sama.

Jangan membuat route baru:

/search
/filter
/sort

### 10.6 Customer Interest + Recent Activity

#### Routes

/seller/customer-interest
/seller/activities

#### Scope

Customer Interest:

WhatsApp Click
Marketplace Click (simpan channel)
List
Detail
History
Channel cards (WhatsApp + configured; < 4 channel → Total Interest sebaris; ≥ 4 → di sebelah heading; desktop side-by-side tanpa fixed width, mobile horizontal scroll; card hierarchy: channel name atas, icon rata kanan, count besar/bold focal, teks "aktivitas minat")
Search + Filter di bawah channel cards
Filter tanggal TANGGAL TUNGGAL (single date)
Context field: Store Landing vs Product Detail

Customer Interest hanya mencatat WHATSAPP_CLICK dan MARKETPLACE_CLICK.

Activity owner di store miliknya sendiri TIDAK dicatat.

Recent Activity:

Product Published
Product Edited
Product Sold Out
Product Reactivated
Product Archived
Product Restored
Store Updated

Dashboard:

Catalog Overview
Quick Actions
Customer Interest + Recent Activity

Dashboard Recent Activity menampilkan 4 terbaru + "Lihat Semua" → /seller/activities

/seller/activities:

List lengkap
Filter tipe
Filter tanggal TANGGAL TUNGGAL (single date) menggunakan date picker (bukan input teks manual)
Date display `12.09.2026`; datetime display `12.09.2026 · 18:02`; tanpa weekday
"Kembali" → /seller/dashboard

#### Notes

Recent Activity tidak pernah berisi customer activity.

Customer Interest tidak pernah berisi seller activity.

### 10.7 Responsive / UI Polish

### Goal

Memastikan seluruh UI responsive dan sesuai visual source of truth.

### Scope

Desktop:

layout width
spacing
alignment
typography
sidebar
content hierarchy
button placement

Mobile:

responsive layout
bottom navigation
touch targets
horizontal scroll
bottom sheets
text wrapping
tanpa horizontal overflow

Visual QA terhadap:

reference/screenshots/

Check:

Layout
Spacing
Typography
Sizing
Alignment
Button hierarchy
Card structure
Navigation
Responsive behavior

### Notes

Visual mismatch harus diperbaiki sebelum finalization.

Jangan menambahkan feature baru pada tahap polish tanpa requirement baru.

### 10.8 Validation, Testing, Regression, Build

### Goal

Memvalidasi seluruh behavior dan memastikan build bersih.

### Scope

Route testing:

/ 
/login
/register
/create-store
/{storeId}
/{storeId}/products
/{storeId}/product/{productId}/{slug}

/seller/dashboard
/seller/products
/seller/products/new
/seller/products/:productId/edit
/seller/products/archived
/seller/categories
/seller/customer-interest
/seller/my-store
/seller/activities
/seller/account

Authentication testing:

Guest
Logged-in User
User without Store
User with Store

Guest → WhatsApp
Guest → Marketplace
Guest → Seller Route

Product lifecycle testing:

Create Draft
Create Published Product
Edit Product (Batal / Simpan)
Archive Product
Restore Product
Product Unggulan (max 10; hanya dari PUBLISHED; SOLD_OUT menghapus Featured; reactivation tidak mengembalikan)
Sold Out Product
Auto archive expiry → ARCHIVED
Reactivation SOLD_OUT → PUBLISHED ("Publish Kembali")
Archive Detail Product (read-only; tanpa Save/Edit/Restore)
Archive page responsive layout (desktop: Search/Filter + Auto Archive; mobile: Kembali + Search + Filter/Auto Archive)
Auto Archive setting hanya di halaman Archive (bukan My Store); hanya nilai yang diizinkan

Store testing:

Create Store
Update Store
Update Location
Update External Channels
Update Announcement
Operating Hours (field terstruktur: Hari Mulai / Hari Selesai / Jam Buka / Jam Tutup; bukan teks bebas)
Perubahan belum disimpan → konfirmasi navigasi
Update Auto Archive (dari halaman Archive)
Change Store ID
30-day restriction
Store Link update

Responsive testing:

Desktop
Mobile

Accessibility QA:

Keyboard Navigation
Focus State
Labels
Button Semantics
Image Alt
Contrast
Form Errors

Build & code quality:

TypeScript
Lint
Build
Unused Imports
Unused Components
Console Errors
Runtime Errors
Broken Routes

Definition of Done untuk setiap fase:

UI implemented
Responsive implemented
Routes working
Interactions working
Loading states handled
Error states handled
Empty states handled
Validation handled
No known TypeScript errors
No known build errors
No broken existing features

---

## 11. Persisted Principles

Bagian ini berlaku di seluruh phase.

### 11.1 Backend Dependency

Jika frontend membutuhkan backend behavior yang belum tersedia:

Gunakan mock/stub hanya untuk development.

Catat dependency yang dibutuhkan secara eksplisit.

Jangan membuat business logic palsu untuk meniru production behavior tanpa alasan.

Contoh:

Backend Dependency:
- Create Store API
- Product CRUD API
- Customer Interest API
- External Channel API
- Auto Archive scheduling

### 11.2 No Reinvention Rule

Agent tidak boleh mengarang:

feature baru
route baru
business rule baru
data field baru
analytics baru
navigation baru
UI section baru

jika tidak ada di:

PRODUCT.md
UX-FLOW.md
ROUTES.md
UI_RULES.md
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

### 11.3 Mock Data Strategy

Mock data boleh digunakan sebelum API tersedia.

Mock data harus:

terisolasi
mudah diganti
memiliki shape yang mendekati API response
tidak menyebar ke component secara hardcoded

Contoh:

mock/
├── products
├── stores
├── categories
└── customer-interest

Jika project architecture menggunakan struktur lain, ikuti architecture existing.

### 11.4 API Readiness

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

### 11.5 Dynamic Asset Integration

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

### 11.6 Scope Control

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

### 11.7 Git Strategy

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

### 11.8 Documentation Reading Rule

Sebelum mengerjakan task, agent harus membaca dokumen yang relevan.

Contoh:

Store Landing

Read:

PRODUCT.md
UX-FLOW.md
ROUTES.md
UI_RULES.md
reference/screenshots/customer/

Seller Dashboard

Read:

PRODUCT.md
UX-FLOW.md
ROUTES.md
UI_RULES.md
reference/screenshots/seller/

Tidak perlu membaca seluruh repository secara membabi buta jika task hanya menyentuh area tertentu.

### 11.9 Screenshot Reference Rule

Jika task memiliki screenshot reference:

Screenshot = Visual Source of Truth

Agent harus:

membaca screenshot
memahami layout
mencocokkan component
implementasi responsive version
tidak melakukan redesign tanpa approval

### 11.10 Final Principle

Kataloga frontend harus dibangun dengan prinsip:

Locked Requirements
        +
Approved Screenshots
        +
Reusable Components
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