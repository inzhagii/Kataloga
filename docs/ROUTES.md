# Kataloga — Routes

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan struktur routing frontend Kataloga.

Routing harus:

- konsisten dengan `PRODUCT.md`
- konsisten dengan `UX-FLOW.md`
- memisahkan public/customer flow dan seller flow
- mendukung dynamic Store ID dan Product ID
- tidak membuat route baru untuk state/interaksi yang seharusnya berada di halaman existing
- menggunakan reusable layout dan component
- menjaga context setelah authentication

Route di dokumen ini merupakan acuan utama untuk implementasi frontend.

---

# 2. Route Overview

Struktur utama:

```text
/
├── /login
├── /register
├── /create-store
│
├── /{storeId}
│   └── /products/{productId}
│
└── /seller
    ├── /dashboard
    ├── /products
    ├── /products/new
    ├── /products/:productId/edit
    ├── /products/archived
    ├── /categories
    ├── /customer-interest
    ├── /my-store
    ├── /activities
    └── /account
3. Public / Marketing Routes
3.1 Marketing Landing
/ 
Purpose

Marketing landing page Kataloga.

Digunakan untuk:

memperkenalkan Kataloga
menjelaskan value proposition
mengarahkan user untuk login/register
mengarahkan user untuk membuat store
Page
MarketingLandingPage
Primary Actions
Login
Daftar
Buat Toko
4. Authentication Routes
4.1 Login
/login
Page
LoginPage
Purpose

Authentication menggunakan:

Email / Phone
Password
Success Behavior

Jika user belum memiliki store:

/create-store

Jika user sudah memiliki store:

/seller/dashboard

Jika login berasal dari protected action, misalnya WhatsApp atau Marketplace:

Login
  ↓
Restore Previous Context
  ↓
Return to Original Page
4.2 Register
/register
Page
RegisterPage
Fields
Email / Phone
Password
Re-password
Customer Name (optional)
Success Behavior

User menjadi authenticated.

Jika belum memiliki store:

/register
    ↓
/create-store
5. Store Creation Route
5.1 Create Store
/create-store
Page
CreateStorePage
Required Fields
Store Name
Store ID
Success

Jangan redirect langsung ke Dashboard.

Flow:

/create-store
      ↓
/seller/my-store

Seller langsung mendarat di My Store.

Seller tidak diblokir dari sidebar atau pembuatan product jika informasi store belum lengkap.
6. Customer / Public Store Routes
6.1 Store Landing
/{storeId}
Page
StoreLandingPage
Purpose

Menampilkan public storefront milik seller.

Menampilkan:

Store Logo
Store Name
Verification Status
Description / Bio
City, Province
Operating Hours
WhatsApp
External Sales Channels
Share Store
Announcement
Featured Products
Product Catalog
Search
Filter
Sort

City, Province ditampilkan dengan urutan "City dahulu, lalu Province".

Contoh:

Kota Bandung, Jawa Barat
Important

storeId merupakan public Store ID.

Contoh:

kataloga.com/toko-komputer-jaya

Store ID tidak perlu ditampilkan sebagai informasi visual pada halaman.

7. Product Detail Route
7.1 Product Detail
/{storeId}/products/{productId}
Page
ProductDetailPage
Parameters
storeId
productId

storeId:

string

productId:

numeric public product ID

Contoh:

kataloga.com/toko-komputer-jaya/products/20
Purpose

Menampilkan:

Product Name
Product Images
Brand
Category
Condition
Price
Product Details
Description
WhatsApp
Marketplace
Share
8. Seller Routes

Semua seller routes menggunakan Seller Layout.

SellerLayout
├── SellerSidebar (Desktop)
├── BottomNavigation (Mobile)
└── More Menu (Mobile)
9. Seller Dashboard
/seller/dashboard
Page
DashboardPage
Main Sections
Catalog Condition
Customer Interest
Recent Activity
Quick Actions
Navigation

Active Products:

/seller/dashboard
       ↓
/seller/products

Archived Products:

/seller/dashboard
       ↓
/seller/products/archived

Customer Interest:

/seller/dashboard
       ↓
/seller/customer-interest

Recent Activity:

/seller/dashboard
       ↓
Lihat Semua
       ↓
/seller/activities

Halaman /seller/activities menyediakan "Kembali" ke Dashboard.
10. Seller Products
10.1 Product List
/seller/products
Page
ProductsPage
Purpose

Seller dapat:

melihat products
mencari products
filter products
sort products
menambahkan product
melihat product
mengedit product
archive product
mengatur featured status
melihat status product (DRAFT / PUBLISHED / SOLD_OUT / ARCHIVED)

Status SOLD_OUT merupakan area seller management yang terpisah dari katalog aktif.

Category filter product seller menggunakan URL query sebagai source of truth:

/seller/products?category=...
Actions
Add Product
    ↓
/seller/products/new

Edit Product
    ↓
/seller/products/:productId/edit

View Product
    ↓
/{storeId}/products/{productId}
11. Add Product
/seller/products/new
Page
AddProductPage
Form

Menggunakan reusable:

ProductForm

Mode:

create
Actions
Save as Draft
Publish Product
Success
/seller/products

Dengan success feedback.

12. Edit Product
/seller/products/:productId/edit
Page
EditProductPage
Parameter
productId
Form

Menggunakan component yang sama:

ProductForm

Mode:

edit

Existing product data harus di-prefill.

Success
/seller/products
13. Archived Products
/seller/products/archived
Page
ArchivedProductsPage
Purpose

Menampilkan product dengan status:

ARCHIVED
Available Actions
Restore

Restore behavior:

ARCHIVED
   ↓
DRAFT
   ↓
/seller/products

Restore tidak otomatis membuat product menjadi Published.

14. Seller Categories
/seller/categories
Page
CategoriesPage
Purpose

Seller dapat:

melihat category
membuat custom category
mengedit category
menghapus category jika tidak digunakan
Hierarchy

Maksimal dua level:

Kategori Utama
└── Sub Kategori

Terminology user-facing:

Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Seller dapat membuat Kategori Utama baru langsung dari form pembuatan category.

Setiap category memiliki "Lihat Product" yang mengarah ke:

/seller/products?category=...

Category product filtering menggunakan URL query sebagai source of truth.

Tidak membuat route terpisah untuk:

/create-category
/edit-category

Category management dilakukan melalui UI pada halaman Categories.

15. Customer Interest
/seller/customer-interest
Page
CustomerInterestPage
Purpose

Menampilkan customer activity yang menghasilkan interest.

Activity yang ditampilkan:

WhatsApp Click
Marketplace Click
Information
Customer
Product
Channel
Date / Time
Customer Identity UI

Customer tidak menggunakan uploaded profile photo.

Gunakan generic user-circle icon.

Total Interest berarti total record interaksi, bukan jumlah customer unique.

Detail Customer Interest menampilkan Customer, Product, Activity, Time, dan Customer interaction history.

Action detail:

Lihat Product → membuka product detail customer-facing di /{storeId}/products/{productId}
Tutup → menutup detail

Jangan menyediakan aksi kontak customer seperti Hubungi Customer, Buka WhatsApp Customer, Buka Marketplace, atau Buka Channel.

16. My Store
/seller/my-store
Page
MyStorePage
Purpose

Seller mengelola:

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

Store Link diturunkan dari Store ID saat ini dan ditampilkan di My Store.

Location dipilih dengan urutan: Province dahulu, kemudian City/Regency yang scoped ke province tersebut.

Store ID

Store ID dapat diedit tetapi hanya satu kali setiap 30 hari.

Perubahan Store ID tidak membutuhkan route baru.

Tetap berada di:

/seller/my-store
17. Seller Profile
/seller/account
Page
AccountPage
Purpose

Mengelola informasi account.

Terminology UI menggunakan "Profile".

Route tetap /seller/account.

Seller/account owner dapat memiliki profile photo/avatar.

18. Logout

Logout tidak memiliki page route khusus.

Logout
   ↓
Clear Authentication State
   ↓
/

Tidak membuat:

/logout
19. Interaction States — Bukan Routes

State berikut tidak boleh dibuat menjadi route baru.

Store Search

Tetap:

/{storeId}

Contoh:

/toko-komputer-jaya

Search state berada di halaman Store Landing.

Store Filter

Tetap:

/{storeId}

Filter menggunakan UI state.

Tidak membuat:

/{storeId}/filter

Seller Category Filter

Product seller tetap:

/seller/products

Category filter menggunakan URL query:

/seller/products?category=...

Tidak membuat:

/seller/products/category-filter
Store Sort

Tetap:

/{storeId}

Tidak membuat:

/{storeId}/sort
Marketplace Selector

Marketplace selector bukan page.

Desktop:

Popover / Dropdown

Mobile:

Bottom Sheet

Tetap berada di:

/{storeId}

atau:

/{storeId}/products/{productId}
Share Store

Share Store bukan route.

Tetap berada di:

/{storeId}

Share menggunakan:

Store Name
Store URL

Tidak ada QR Code.

Share Product

Share Product bukan route.

Tetap berada di:

/{storeId}/products/{productId}

Share menggunakan product-specific URL.

Announcement

Announcement expand/collapse bukan route.

Tetap berada di:

/{storeId}
20. Authentication Redirect Context

Authentication dapat muncul dari public product/store page.

Contoh:

/{storeId}/products/{productId}
        │
        ▼
     WhatsApp
        │
        ▼
     /login
        │
        ▼
Return to Product

Atau:

/{storeId}/products/{productId}
        │
        ▼
   Marketplace
        │
        ▼
     /login
        │
        ▼
Return to Product

Frontend harus mempertahankan context sebelum redirect authentication.

Context minimal:

returnPath

Jika diperlukan:

returnPath
selectedAction
selectedChannel

Setelah authentication berhasil, user kembali ke context sebelumnya dan action dapat dilanjutkan sesuai flow.

21. Route Protection
Public Routes

Dapat diakses tanpa authentication:

/
 /login
 /register
 /{storeId}
/{storeId}/products/{productId}
Authenticated Routes

Membutuhkan login:

/create-store

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
22. Create Store Protection

/create-store membutuhkan authenticated user.

Jika user belum login:

/create-store
      ↓
/login
      ↓
/create-store

Jika user sudah memiliki store, user tidak boleh membuat store kedua.

Flow:

/create-store
      │
      ▼
Check Store Ownership
      │
 ┌────┴─────┐
 │          │
No Store  Has Store
 │          │
 ▼          ▼
Allow     Redirect
          /seller/dashboard

V1:

1 Account = 1 Store
23. Seller Route Protection

Semua route:

/seller/*

membutuhkan authenticated user.

Jika guest mencoba membuka seller route:

/seller/dashboard
      ↓
/login

Setelah login berhasil:

/login
  ↓
/seller/dashboard
24. Invalid Store

Jika storeId tidak ditemukan:

/{storeId}
      ↓
Store Not Found

Tampilkan dedicated not-found state/page.

Tidak membuat route:

/store-not-found

State berada dalam public route tersebut.

25. Invalid Product

Jika product tidak ditemukan:

/{storeId}/products/{productId}
      ↓
Product Not Found

Tampilkan not-found state.

Tidak membuat:

/product-not-found
26. Product Ownership / Store Context

Public product URL selalu memiliki Store ID:

/{storeId}/products/{productId}

Frontend tidak boleh mengasumsikan product hanya berdasarkan productId.

Product harus divalidasi terhadap store context.

Contoh:

/toko-komputer-jaya/products/20

berarti:

storeId = toko-komputer-jaya
productId = 20
27. Route Parameters
Public Store
storeId: string

Example:

/toko-komputer-jaya
Public Product
storeId: string
productId: number

Example:

/toko-komputer-jaya/products/20
Seller Product
productId: number

Example:

/seller/products/20/edit
28. Query Parameters

Search, filter, dan sort pada Store Landing dapat menggunakan URL query parameters jika implementasi membutuhkan state yang shareable/bookmarkable.

Contoh:

/{storeId}?search=laptop

Filter:

/{storeId}?category=laptop&condition=NEW

Sort:

/{storeId}?sort=PRICE_ASC

Kombinasi:

/{storeId}?search=asus&category=laptop&condition=NEW&sort=PRICE_ASC

Query parameter bukan route baru.

29. Recommended Route Naming

Gunakan URL lowercase dan kebab-case.

Benar:

/seller/customer-interest
/seller/my-store
/seller/products/archived
/create-store

Hindari:

/seller/customerInterest
/seller/myStore
/CreateStore
30. Route → Page Mapping
Route	Page	Access
/	MarketingLandingPage	Public
/login	LoginPage	Public
/register	RegisterPage	Public
/create-store	CreateStorePage	Authenticated
/{storeId}	StoreLandingPage	Public
/{storeId}/products/{productId}	ProductDetailPage	Public
/seller/dashboard	DashboardPage	Authenticated
/seller/products	ProductsPage	Authenticated
/seller/products/new	AddProductPage	Authenticated
/seller/products/:productId/edit	EditProductPage	Authenticated
/seller/products/archived	ArchivedProductsPage	Authenticated
/seller/categories	CategoriesPage	Authenticated
/seller/customer-interest	CustomerInterestPage	Authenticated
/seller/my-store	MyStorePage	Authenticated
/seller/activities	RecentActivitiesPage	Authenticated
/seller/account	AccountPage	Authenticated
31. Routes yang Tidak Perlu Dibuat

Jangan membuat route terpisah untuk:

/search
/filter
/sort
/marketplace
/share
/share-store
/share-product
/announcement
/logout
/store-not-found
/product-not-found
/create-category
/edit-category

Semua merupakan:

component
modal
popover
bottom sheet
state
action
atau error state

dari existing page.

32. Frontend Route Structure

Recommended conceptual structure:

App
│
├── PublicRoutes
│   ├── MarketingLandingPage
│   ├── LoginPage
│   ├── RegisterPage
│   ├── StoreLandingPage
│   └── ProductDetailPage
│
├── ProtectedRoutes
│   ├── CreateStorePage
│   │
│   └── SellerLayout
│       ├── DashboardPage
│       ├── ProductsPage
│       ├── AddProductPage
│       ├── EditProductPage
│       ├── ArchivedProductsPage
│       ├── CategoriesPage
│       ├── CustomerInterestPage
│       ├── MyStorePage
│       ├── RecentActivitiesPage
│       └── AccountPage
│
└── NotFound
33. Layout Rules
Public Layout

Marketing:

MarketingLayout

Store:

StoreLayout

Product Detail:

StoreLayout

Store dan Product Detail menggunakan storefront context.

Seller Layout

Semua seller pages menggunakan:

SellerLayout

yang menyediakan:

Desktop:
SellerSidebar

Mobile:
BottomNavigation
MoreMenu

Jangan membuat sidebar berbeda untuk setiap page.

34. Route Implementation Rules
Route structure harus mengikuti dokumen ini.
Jangan membuat route baru hanya untuk menyelesaikan UI state.
Dynamic Store ID menggunakan /{storeId}.
Dynamic Product ID menggunakan /{storeId}/products/{productId}.
Seller product edit menggunakan /seller/products/:productId/edit.
Add Product menggunakan /seller/products/new.
Archived Products memiliki route sendiri.
Customer Interest memiliki satu dedicated route.
Dashboard Customer Interest dan sidebar Customer Interest harus menuju route yang sama.
Recent Activity lengkap menggunakan /seller/activities.
Dashboard Recent Activity "Lihat Semua" menuju /seller/activities.
"Kembali" pada /seller/activities menuju /seller/dashboard.
Create Store diarahkan ke My Store setelah berhasil.
Seller routes harus protected.
Public store dan product routes harus dapat diakses guest.
Authentication harus mempertahankan return context.
Search/filter/sort tidak membutuhkan dedicated route.
Marketplace selector tidak membutuhkan dedicated route.
Share tidak membutuhkan dedicated route.
Tidak ada QR Code route atau QR-related page.
Tidak ada logout route.
Invalid resource ditangani sebagai state dalam route terkait.
Semua seller page menggunakan reusable SellerLayout.
Add Product dan Edit Product menggunakan reusable ProductForm.
Route naming menggunakan lowercase kebab-case.
Business logic tidak boleh bergantung pada tampilan desktop/mobile.
Jangan mengubah route structure tanpa mengecek PRODUCT.md dan UX-FLOW.md.