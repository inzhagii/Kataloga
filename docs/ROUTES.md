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
├── /verify-email
├── /forgot-password
├── /reset-password
├── /create-store
│
├── /{storeId}
│   ├── /products
│   └── /product/{productId}/{slug}
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

Register via phone:

Active immediately.

If belum memiliki store:

/register
    ↓
/create-store

Register via email:

/register
    ↓
/verify-email
    ↓
/create-store (atau /seller/dashboard jika sudah memiliki store)

4.3 Verify Email
/verify-email
Page
VerifyEmailPage
Purpose

Verifikasi OTP email untuk akun yang register menggunakan email.

6 digit kode
Resend code (dengan cooldown)
Success Behavior

User menjadi authenticated, lalu diarahkan sesuai return context / status store.

4.4 Forgot Password
/forgot-password
Page
ForgotPasswordPage
Purpose

Meminta kode pemulihan password menggunakan email atau nomor HP.

Respon selalu generik (tidak mengungkap apakah akun terdaftar)
Success Behavior

/forgot-password
    ↓
/reset-password

4.5 Reset Password
/reset-password
Page
ResetPasswordPage
Fields
Kode OTP
Password baru
Konfirmasi password baru
Success Behavior

Password berubah, user diarahkan ke /login.

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
Product Unggulan
Link ke Product Listing

### Storefront Navbar

Navbar storefront berisi:

Store Logo
Store Name
City/Province

Tidak menempatkan di dalam navbar:

WhatsApp
Marketplace
Full Address

WhatsApp, Marketplace, dan Full Address tersedia pada konten/footer storefront yang sesuai.

City, Province ditampilkan dengan urutan "City dahulu, lalu Province".

Contoh:

Kota Bandung, Jawa Barat
Important

storeId merupakan public Store ID.

Contoh:

/toko-komputer-jaya

Store ID tidak perlu ditampilkan sebagai informasi visual pada halaman.

### Historical Store ID

Jika storeId merupakan historical Store ID lama:

/arya
→ /toko-arya

Semua historical Store ID tetap menuju store saat ini (redirect).

Historical aliases adalah behavior backend-owned.

Frontend tidak memelihara alias mapping sendiri.

6.2 Product Listing
/{storeId}/products
Page
ProductListingPage
Purpose

Menampilkan listing katalog customer untuk store tertentu.

Menyediakan:

Search
Category filter
Filter
Sort
Product grid

Menggunakan reusable ProductCard dan ProductGrid.

Search/filter/sort merupakan state/interaksi di dalam halaman ini.

Tidak membuat route tambahan untuk search/filter/sort.

Ordering:

Featured Published
→ Published lebih baru
→ Published lebih lama
→ Sold Out

Archived tidak pernah menjadi public catalog product.

7. Product Detail Route
7.1 Product Detail
/{storeId}/product/{productId}/{slug}
Page
ProductDetailPage
Parameters
storeId
productId
slug

storeId:

string

productId:

numeric public product ID

slug:

URL slug dari Product Name

Contoh:

/toko-komputer-jaya/product/20/laptop-asus-rog
Purpose

Menampilkan:

Brand (jika tersedia) dengan format eksplisit "Brand : X"
Product Unggulan indicator (jika featured)
Product Name
Price (bold)
Category / Condition (bersebelahan, di bawah Price)
Product Details
Description
WhatsApp
Marketplace (tidak pada product SOLD_OUT)
Share

Product Unggulan indicator terpisah secara visual dari Brand.

Brand ditampilkan secara eksplisit pada Product Detail. Contoh tampilan penulisan nama brand diikuti colon:

`Brand : ASUS`

Bagian External Product Links TIDAK ditampilkan pada Product Detail.

External Product Links tetap ada sebagai field data product (form product dan API), tetapi tidak dirender di halaman Product Detail customer-facing.

Primary action adalah "Hubungi via WhatsApp".

Marketplace dan Share tersedia sebagai secondary actions.

Marketplace hanya ditampilkan jika store memiliki setidaknya satu external channel aktif.

Pada mobile, "Hubungi via WhatsApp" tetap menjadi primary action.

Product SOLD_OUT (masih dalam jendela auto archive):

- tetap dapat dilihat,
- indikasi "Sold Out" yang jelas,
- WhatsApp tidak tersedia,
- Marketplace tidak tersedia,
- Share tetap tersedia.

Tidak ada section availability.
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
Catalog Overview
Quick Actions
Customer Interest + Recent Activity
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
menambahkan product
melihat product
mengedit product
archive product
mengatur status Product Unggulan
melihat status product (DRAFT / PUBLISHED / SOLD_OUT / ARCHIVED)

Tidak ada Sort pada halaman Seller Products.

Status SOLD_OUT merupakan area seller management yang terpisah dari katalog aktif.

### Product Status Actions (Seller)

Tindakan yang tersedia per status pada seller management (list Products / Archived):

- PUBLISHED (Active): Lihat Product, Edit, Archive, Feature / Unfeature
- DRAFT: Edit, Publish, Archive
  - Tidak ada aksi Lihat Product pada DRAFT.
  - DRAFT tidak pernah Product Unggulan, jadi tidak ada aksi Feature/Unfeature.
- SOLD_OUT: Lihat Product, Publish Kembali, Archive
  - Reaktivasi SOLD_OUT menggunakan label aksi seller "Publish Kembali".
  - Reaktivasi ke PUBLISHED TIDAK otomatis mengembalikan status Product Unggulan.
- ARCHIVED (halaman Archive): Detail Product, Restore
  - Halaman Archive TIDAK memiliki aksi "Lihat Product".
  - Aksi archive adalah "Detail Product" yang membuka tampilan read-only product archived.
  - Restore tersedia dari menu aksi pada list, mengubah ARCHIVED → DRAFT.

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
/{storeId}/product/{productId}/{slug}
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

Tidak ada route baru untuk detail archived; Archive Detail Product adalah state/internal view pada halaman Archive.

Available Actions per product:
Detail Product
Restore
Kembali

Kembali behavior:

Archived Products
     ↓
/seller/products

Halaman Archive TIDAK memiliki aksi "Lihat Product".

Detail Product behavior:

- membuka tampilan read-only product archived.
- menampilkan seluruh informasi product, termasuk Product Catalog Settings, gambar, Brand, Category, Condition, Price, Description, status Product Unggulan, dan status (ARCHIVED).
- tidak ada field editable, tidak ada tombol Save/Edit/Restore di dalam tampilan ini.
- hanya menyediakan Kembali → halaman Archive.

Restore behavior:

ARCHIVED
   ↓
DRAFT
   ↓
/seller/products

Restore hanya tersedia dari menu aksi pada list Archived.

Restore tidak otomatis membuat product menjadi Published.

Responsive layout halaman Archive:

Desktop:

[ Search Produk ] [ Filter ]    [ Auto Archive ]

Mobile:

Archive [ Kembali ]
[ Search Produk ]
[ Filter ] [ Auto Archive ]
[ Product List ]

Auto Archive:

- setting level store yang UI-nya terletak pada halaman Archive.
- nilai: Tidak ada (default) / 1 hari / 7 hari / 30 hari / 90 hari / 180 hari / 365 hari / Never.
- diubah melalui popover pada halaman Archive, bukan pada My Store.

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

Setiap category memiliki "Lihat Produk" yang mengarah ke:

/seller/products?category=...

"Lihat Produk" menggunakan hover treatment sederhana (text/action hover).

Bukan "Lihat Semua".

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

Lihat Product → membuka product detail customer-facing di /{storeId}/product/{productId}/{slug}
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

Auto Archive TIDAK berada di My Store. Auto Archive terletak pada halaman Archive (lihat §13 Archived Products).

Operating Hours menggunakan field terstruktur:

- Hari Mulai
- Hari Selesai
- Jam Buka
- Jam Tutup

Contoh:

- Hari Mulai: Senin
- Hari Selesai: Minggu
- Jam Buka: 08:00
- Jam Tutup: 17:00

TIDAK menggunakan input teks bebas untuk Operating Hours.

Perubahan pada My Store bersifat draft sampai tombol Simpan diklik.

Jika ada perubahan yang belum disimpan dan seller mencoba navigasi keluar, tampilkan konfirmasi sebelum keluar.

Pada mobile, judul halaman My Store ditampilkan centered.

Store Link diturunkan dari Store ID saat ini dan ditampilkan di My Store.

Store Link berada di bawah Store ID.

Actions Store Link:

Salin
Bagikan

Tidak ada QR Code.

Jika Store ID berubah, Store Link ikut berubah.

Store ID lama tetap menjadi valid alias yang redirect ke Store ID saat ini (backend-owned).

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

Urutan halaman:

1. Informasi Akun Kamu
2. Ringkasan Toko

Ringkasan Toko tidak diduplikasi.

Profile diakses melalui User/Account Card pada bagian bawah sidebar seller.

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

/{storeId}/products

Contoh:

/toko-komputer-jaya/products?search=laptop

Search state berada di halaman Product Listing.

Store Filter

Tetap:

/{storeId}/products

Filter menggunakan UI state.

Tidak membuat:

/{storeId}/products/filter

Seller Category Filter

Product seller tetap:

/seller/products

Category filter menggunakan URL query:

/seller/products?category=...

Tidak membuat:

/seller/products/category-filter
Store Sort

Tetap:

/{storeId}/products

Tidak membuat:

/{storeId}/products/sort
Marketplace Selector

Marketplace selector bukan page.

Desktop:

Popover / Dropdown

Mobile:

Bottom Sheet

Tetap berada di:

/{storeId}

atau:

/{storeId}/product/{productId}/{slug}
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

/{storeId}/product/{productId}/{slug}

Share menggunakan product-specific URL.

Announcement

Announcement expand/collapse bukan route.

Tetap berada di:

/{storeId}
20. Authentication Redirect Context

Authentication dapat muncul dari public product/store page.

Contoh:

/{storeId}/product/{productId}/{slug}
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

/{storeId}/product/{productId}/{slug}
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
/{storeId}/products
/{storeId}/product/{productId}/{slug}
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

Akun tanpa store diarahkan ke /create-store, kecuali /seller/account (Profile)
yang tetap dapat diakses untuk mengatur recovery email.

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

### Historical Store ID Resolution

Jika storeId adalah historical Store ID lama, store tetap dapat di-resolve:

/arya
→ /toko-arya

Semua historical Store ID menjadi valid alias yang menuju store saat ini (redirect).

Historical aliases adalah behavior backend-owned.

Frontend tidak memelihara alias mapping sendiri.

25. Invalid Product

Jika product tidak ditemukan:

/{storeId}/product/{productId}/{slug}
      ↓
Product Not Found

Tampilkan not-found state.

Tidak membuat:

/product-not-found
26. Product Ownership / Store Context

Public product URL selalu memiliki Store ID:

/{storeId}/product/{productId}/{slug}

Frontend tidak boleh mengasumsikan product hanya berdasarkan productId.

Product harus divalidasi terhadap store context.

Contoh:

/toko-komputer-jaya/product/20/laptop-asus-rog

berarti:

storeId = toko-komputer-jaya
productId = 20
slug = laptop-asus-rog
27. Route Parameters
Public Store
storeId: string

Example:

/toko-komputer-jaya
Public Product
storeId: string
productId: number
slug: string

Example:

/toko-komputer-jaya/product/20/laptop-asus-rog
Seller Product
productId: number

Example:

/seller/products/20/edit
28. Query Parameters

Search, filter, dan sort pada Product Listing dapat menggunakan URL query parameters jika implementasi membutuhkan state yang shareable/bookmarkable.

Contoh:

/{storeId}/products?search=laptop

Filter:

/{storeId}/products?category=laptop&condition=NEW

Sort:

/{storeId}/products?sort=PRICE_ASC

Kombinasi:

/{storeId}/products?search=asus&category=laptop&condition=NEW&sort=PRICE_ASC

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
/verify-email	VerifyEmailPage	Public
/forgot-password	ForgotPasswordPage	Public
/reset-password	ResetPasswordPage	Public
/create-store	CreateStorePage	Authenticated
/{storeId}	StoreLandingPage	Public
/{storeId}/products	ProductListingPage	Public
/{storeId}/product/{productId}/{slug}	ProductDetailPage	Public
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
│   ├── ProductListingPage
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

Store, Product Listing, dan Product Detail menggunakan storefront context.

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
Product Listing menggunakan /{storeId}/products.
Dynamic Product ID menggunakan /{storeId}/product/{productId}/{slug}.
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