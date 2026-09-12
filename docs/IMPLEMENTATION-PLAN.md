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

---

# 2. Source of Truth

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
UI-RULES.md
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

3. Implementation Principles
3.1 Incremental Development

Jangan meminta OpenCode membangun seluruh Kataloga dalam satu task.

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
3.2 UI First, Logic Second

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

3.3 Reusable Components

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
4. Phase Overview
Phase 0  → Project Foundation
Phase 1  → Design System & Shared Components
Phase 2  → Marketing Landing
Phase 3  → Authentication
Phase 4  → Public Storefront
Phase 5  → Product Detail
Phase 6  → Seller Layout
Phase 7  → Seller Dashboard
Phase 8  → Products CRUD
Phase 9  → Categories
Phase 10 → My Store
Phase 11 → Customer Interest
Phase 12 → Profile
Phase 13 → Functional Integration
Phase 14 → API Integration
Phase 15 → Validation & Testing
Phase 16 → Final Polish
5. Phase 0 — Project Foundation
Goal

Menyiapkan React project agar siap dikembangkan.

Scope
React project
TypeScript
package manager
linting
formatting
basic folder structure
routing foundation
environment configuration
Git setup
Expected Structure
src/
├── app/
├── components/
├── layouts/
├── pages/
├── features/
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
└── assets/

Struktur final boleh menyesuaikan architecture yang dipilih setelah inspeksi project.

Jangan memaksakan folder structure jika project yang sudah ada memiliki architecture yang lebih baik.

Verification
project dapat dijalankan
TypeScript tidak error
lint tidak error
build berhasil
routing dasar bekerja
6. Phase 1 — Design System & Shared Components
Goal

Membangun foundation UI yang akan digunakan seluruh aplikasi.

Scope
typography
spacing
buttons
inputs
cards
badges
dropdown
modal
bottom sheet
toast
loading
empty state
error state
icon conventions
Shared Components

Contoh:

Button
Input
Select
Badge
Card
Modal
BottomSheet
Dropdown
Toast
LoadingState
EmptyState
ErrorState
Important

Jangan membuat design system terlalu kompleks di awal.

Gunakan kebutuhan nyata dari screenshot dan page yang akan dibuat.

7. Phase 2 — Marketing Landing
Route
/
Goal

Membangun marketing landing Kataloga.

Scope
navbar
hero
hero visual
CTA
value propositions
benefits
responsive layout
footer
Visual Reference

Gunakan:

reference/screenshots/public/

yang sesuai dengan marketing landing final.

Verification

Desktop:

Layout
Spacing
Typography
Hero
CTA
Visual

Mobile:

Stacking
Spacing
Hero visual
CTA
Navigation
8. Phase 3 — Authentication
Routes
/login
/register
Goal

Membangun authentication UI dan flow dasar.

Scope
Login
Register
validation
loading state
error state
authentication state
redirect handling
context preservation
Important

Login dapat berasal dari:

Direct Login
WhatsApp Action
Marketplace Action
Protected Seller Route

Return context harus dipertahankan.

9. Phase 4 — Public Storefront
Route
/{storeId}
Goal

Membangun customer-facing Store Landing.

Scope
Store navbar
Store header
Store information
store actions
announcement
featured products
product grid
product card
search
filter
sort
empty states
sold-out state
responsive layout
Interaction

Desktop:

Filter → Dropdown / Popover
Sort → Dropdown / Popover
Marketplace → Dropdown / Popover

Mobile:

Filter → Bottom Sheet
Sort → Bottom Sheet
Marketplace → Bottom Sheet
Important

Search/filter/sort tetap berada pada Store Landing.

Jangan membuat page baru.

10. Phase 5 — Product Detail
Route
/{storeId}/products/{productId}
Goal

Membangun public product detail.

Scope
product gallery
product information
price
product details
description
WhatsApp
Marketplace
Share
responsive layout
long description state
Interaction

WhatsApp:

Auth Check
   ↓
Interest
   ↓
WhatsApp

Marketplace:

Show Seller Channels
   ↓
Select Channel
   ↓
Auth Check
   ↓
Interest
   ↓
External URL

Share:

Share Product URL

Tidak ada QR.

11. Phase 6 — Seller Layout
Goal

Membangun seller application shell sebelum membuat seluruh seller pages.

Desktop
SellerLayout
└── SellerSidebar
Mobile
SellerLayout
├── Main Content
├── BottomNavigation
└── MoreMenu
Navigation
Dashboard
Products
Categories
Customer Interest
My Store
Profile
Logout
Important

Sidebar harus reusable.

Jangan membuat sidebar baru di setiap page.

12. Phase 7 — Seller Dashboard
Route
/seller/dashboard
Goal

Membangun dashboard berdasarkan hierarchy final.

Urutan:

1. Catalog Condition
2. Customer Interest
3. Recent Activity
4. Quick Actions
Scope

Catalog:

Active Products
SOLD_OUT Products
Archived Products

Customer Interest:

WhatsApp
Marketplace

Recent Activity:

Product Published
Product Edited
Store Updated

Quick Actions:

Add Product
Products
My Store
Navigation
Active Products
    ↓
/seller/products

Archived Products
    ↓
/seller/products/archived

Customer Interest
    ↓
/seller/customer-interest

Recent Activity "Lihat Semua"
    ↓
/seller/activities

Halaman /seller/activities adalah list Recent Activity lengkap dan menyediakan "Kembali" ke Dashboard.
13. Phase 8 — Products CRUD
Routes
/seller/products
/seller/products/new
/seller/products/:productId/edit
/seller/products/archived
13.1 Products

Implement:

product list
search
filter
sort
status
featured state
edit
archive
view
13.2 Add Product

Implement:

ProductForm

Create mode:

mode = create

Actions:

Save as Draft
Publish Product
13.3 Edit Product

Reuse:

ProductForm

Edit mode:

mode = edit

Existing data harus di-prefill.

13.4 Archived Products

Implement:

archived list
restore

Restore:

ARCHIVED
    ↓
DRAFT
14. Phase 9 — Categories
Route
/seller/categories
Goal

Membangun category management.

Scope
category list
Kategori Utama
Sub Kategori
create
edit
delete
used-category protection
"Lihat Product" per category
Hierarchy

Maksimal:

Kategori Utama
└── Sub Kategori

Terminology user-facing:

Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Seller dapat membuat Kategori Utama baru langsung dari form pembuatan category.

"Lihat Product" mengarah ke:

/seller/products?category=...

Category product filtering menggunakan URL query sebagai source of truth.

Kategori Utama yang masih memiliki child tidak dapat dihapus.

Product memilih tepat satu category.

15. Phase 10 — My Store
Route
/seller/my-store
Goal

Membangun store management.

Scope
Store Logo
Store Name
Store ID
Store Description
Province
City / Regency
Full Address (opsional, free-text)
Operating Hours
WhatsApp
External Sales Channels
Announcement
Store Link
External Channel

Model:

type ExternalChannel = {
  name: string
  url: string
}

Seller dapat:

Add
Edit
Remove

Tidak ada marketplace icon/logo requirement.

Store ID

Implement:

30-day change restriction
Store ID format validation (lowercase, angka, tanda hubung; diawali/diakhiri alfanumerik; tanpa tanda hubung berurutan; di-trim)
availability check saat Store ID valid dan saat berubah
availability check ulang pada saat submit
Store Link diturunkan dari Store ID saat ini

UI harus memberikan feedback ketika perubahan belum diperbolehkan.

Location

Province dipilih dahulu, kemudian City/Regency yang scoped ke province tersebut.

16. Phase 11 — Customer Interest
Route
/seller/customer-interest
Goal

Menampilkan meaningful customer activities.

Activity Types
WHATSAPP_CLICK
MARKETPLACE_CLICK
Information
Customer
Product
Channel
Date / Time

Customer menggunakan generic user-circle icon.

Tidak menggunakan customer profile photo.

17. Phase 12 — Profile
Route
/seller/account
Goal

Membangun account management dengan terminology "Profile".

Route tetap /seller/account.

Scope
account information
seller avatar
profile information
relevant settings

Seller avatar optional.

18. Phase 13 — Functional Integration

Setelah seluruh major page tersedia, integrasikan interaction antar page.

Scope
Authentication
Login
Register
Logout
Protected Routes
Redirect
Context Preservation
Store
Create Store
My Store
Public Store
Product
Create
Read
Update
Archive
Restore
Publish
Draft
Featured
Category
Create
Read
Update
Delete
Customer Interest
WhatsApp Click
Marketplace Click
Share
Share Store
Share Product
19. Phase 14 — API Integration

API integration dilakukan setelah component dan page structure relatif stabil.

Principle

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

20. API Integration Order

Recommended order:

1. Authentication
2. Store
3. Category
4. Product
5. External Channels
6. Customer Interest
7. Dashboard aggregation
8. Recent Activities
9. Profile
21. Dynamic Asset Integration

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

22. Mock Data Strategy

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

23. Phase 15 — Validation & Testing

Setelah integration selesai, lakukan validation menyeluruh.

23.1 Route Testing

Check:

/
 /login
 /register
 /create-store
 /{storeId}
/{storeId}/products/{productId}

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
24. Authentication Testing

Test:

Guest
Logged-in User
User without Store
User with Store

Test:

Guest → WhatsApp
Guest → Marketplace
Guest → Seller Route

Pastikan redirect dan context benar.

25. Product Testing

Test:

Create Draft
Create Published Product
Edit Product
Archive Product
Restore Product
Featured Product
Sold Out Product (lifecycle status, bukan availability field)

Katalog aktif hanya berisi produk PUBLISHED.

Validation Publish:

Product Name
Photo
Category
Product Details
Description
Condition
Price
26. Store Testing

Test:

Create Store
Update Store
Update Logo
Update Description
Update Location (Province, City/Regency, Full Address opsional)
Update WhatsApp
Update External Channels
Update Announcement
Change Store ID

Store ID:

Allowed Change
Blocked Change < 30 days
Format validation
Availability check ulang saat submit

Store Link:

ditampilkan di My Store
berubah mengikuti Store ID saat ini

26. Customer Interest Testing

Test:

WhatsApp Click
Marketplace Click
Marketplace Channel selection

Verify:

Customer
Product
Channel
Date / Time
Customer interaction history
Total Interest = total record interaksi

Action detail:

Lihat Product → membuka product detail customer-facing
Tutup → menutup detail

Jangan menyediakan aksi kontak customer:

Hubungi Customer
Buka WhatsApp Customer
Buka Marketplace
Buka Channel

Tidak membuat interest dari:

Product View
Share
Login
Logout
28. Responsive Testing

Minimal:

Desktop
Mobile

Test seluruh major pages.

Public:

Marketing
Store
Product Detail
Login
Register

Seller:

Dashboard
Products
Add Product
Edit Product
Archived
Categories
Customer Interest
My Store
Profile
Recent Activities
29. Visual QA

Bandingkan implementation dengan:

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

Visual mismatch harus diperbaiki sebelum finalization.

30. Accessibility QA

Check:

Keyboard Navigation
Focus State
Labels
Button Semantics
Image Alt
Contrast
Form Errors

Icon-only buttons harus memiliki accessible label.

31. Build & Code Quality QA

Final check:

TypeScript
Lint
Build
Unused Imports
Unused Components
Console Errors
Runtime Errors
Broken Routes

Tidak boleh menyelesaikan task dengan error yang diketahui.

32. Phase 16 — Final Polish

Setelah feature lengkap:

Performance
Responsive Polish
Accessibility
Loading States
Error States
Empty States
Micro Interactions
Visual Consistency
Code Cleanup

Jangan menambahkan feature baru pada tahap polish tanpa requirement baru.

33. Suggested Git Strategy

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

34. OpenCode Workflow

Untuk setiap task non-trivial:

Read Relevant Docs
        ↓
Inspect Existing Code
        ↓
Inspect Screenshot
        ↓
Plan Mode
        ↓
Review Plan
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
35. OpenCode Task Scope

Task harus kecil dan spesifik.

Contoh task yang baik:

Implement SellerLayout and reusable SellerSidebar

atau:

Implement Store Landing based on approved screenshot

atau:

Implement ProductForm for Add Product

Hindari:

Build the entire Kataloga application
36. Documentation Reading Rule

Sebelum mengerjakan task, OpenCode harus membaca dokumen yang relevan.

Contoh:

Store Landing

Read:

PRODUCT.md
UX-FLOW.md
ROUTES.md
UI-RULES.md
reference/screenshots/customer/
Seller Dashboard

Read:

PRODUCT.md
UX-FLOW.md
ROUTES.md
UI-RULES.md
reference/screenshots/seller/

Tidak perlu membaca seluruh repository secara membabi buta jika task hanya menyentuh area tertentu.

37. Screenshot Reference Rule

Jika task memiliki screenshot reference:

Screenshot = Visual Source of Truth

OpenCode harus:

membaca screenshot
memahami layout
mencocokkan component
implementasi responsive version
tidak melakukan redesign tanpa approval
38. No Reinvention Rule

OpenCode tidak boleh mengarang:

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
39. Backend Dependency Rule

Jika frontend membutuhkan backend behavior yang belum tersedia:

Jangan membuat business logic palsu untuk meniru production behavior tanpa alasan.

Gunakan:

Mock / Stub

hanya untuk development.

Catat dependency yang dibutuhkan.

Contoh:

Backend Dependency:
- Create Store API
- Product CRUD API
- Customer Interest API
- External Channel API
40. Definition of Done

Sebuah phase dianggap selesai jika:

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
Visual QA completed

Untuk phase API:

API integration completed
Error handling completed
Auth handling completed
Data mapping completed
41. Recommended Implementation Order

Urutan final:

01. Project Foundation
        ↓
02. Shared UI Foundation
        ↓
03. Marketing Landing
        ↓
04. Authentication
        ↓
05. Public Store Landing
        ↓
06. Product Detail
        ↓
07. Seller Layout
        ↓
08. Seller Dashboard
        ↓
09. Products
        ↓
10. Add Product
        ↓
11. Edit Product
        ↓
12. Archived Products
        ↓
13. Categories
        ↓
14. My Store
        ↓
15. Customer Interest
        ↓
16. Profile
        ↓
17. Recent Activities
        ↓
18. Functional Integration
        ↓
19. API Integration
        ↓
20. Testing & QA
        ↓
21. Final Polish
42. Scope Control

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

43. Final Principle

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