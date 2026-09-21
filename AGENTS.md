# KATALOGA — AI Coding Agent Instructions

## 0. Project Nature & Role

Kataloga repository ini adalah project **frontend-only** (React/TypeScript).

Role AI agent pada repository ini:

- **Senior Frontend Engineer.**

Batasan:

- TIDAK mengubah/menambah/menghapus backend, database, schema, atau API server code di repository ini.
- TIDAK menginstal dependency tanpa persetujuan.
- TIDAK mengimplementasikan business logic backend; jika ditemukan gap backend, identifikasi dan dokumentasikan ke `docs/API-CONTRACT.md` sebagai item yang butuh konfirmasi backend, bukan diimplementasikan secara asal.
- TIDAK mengarang endpoint API baru selain proposal yang sudah tercatat.

## 1. Project Overview

Kataloga adalah platform katalog/storefront yang membantu seller:

- mengelola produk,
- menampilkan toko secara rapi,
- membagikan halaman toko,
- menghubungkan customer ke WhatsApp atau external sales channels.

Kataloga BUKAN platform transaksi.

Tidak ada:

- checkout,
- cart,
- payment,
- order management,
- inventory/stock quantity management.

Customer menggunakan Kataloga untuk melihat katalog dan kemudian terhubung ke channel seller.

---

# 2. Source of Truth

Sebelum mengubah atau membuat fitur, baca sumber yang relevan.

Prioritas sumber:

1. `docs/PRODUCT.md`
2. `docs/UX-FLOW.md`
3. `docs/ROUTES.md`
4. `docs/UI_RULES.md`
5. `reference/screenshots/`
6. `reference/stitch-code/`
7. existing production code di `src/`

### Important

`reference/screenshots/` adalah visual source of truth.

`reference/stitch-code/` adalah implementation reference, BUKAN production code.

Jangan menganggap kode dari Stitch harus digunakan mentah-mentah.

Production implementation harus dibuat ulang dengan struktur React yang reusable dan maintainable.

---

# 3. Locked Requirements

Requirement yang sudah ditetapkan di `docs/` dianggap LOCKED.

AI agent:

- TIDAK BOLEH mengubah business rule secara sepihak.
- TIDAK BOLEH menambahkan fitur baru hanya karena dianggap lebih bagus.
- TIDAK BOLEH menghapus requirement tanpa alasan.
- TIDAK BOLEH mengganti UX yang sudah disetujui tanpa persetujuan.

Jika menemukan improvement:

1. identifikasi masalah,
2. jelaskan impact,
3. ajukan proposal,
4. tunggu keputusan sebelum mengubah locked requirement.

---

# 4. Anti-Invention Rule

Jika sebuah requirement belum jelas:

DO NOT invent business logic.

Jangan membuat asumsi tentang:

- permission,
- role,
- pricing,
- inventory,
- analytics,
- validation,
- API behavior,
- database behavior,
- navigation,
- marketplace integration,
- customer behavior.

Gunakan informasi yang sudah tersedia di:

- `docs/`
- existing code
- approved screenshots
- existing API contract

Jika keputusan tersebut memengaruhi UX atau architecture secara signifikan, stop dan minta clarification.

---

# 5. Project Architecture Principles

Gunakan architecture yang:

- modular,
- reusable,
- typed,
- maintainable,
- API-ready,
- responsive.

Hindari:

- giant components,
- duplicate UI,
- duplicate business logic,
- hardcoded data di banyak tempat,
- route-specific hacks,
- unnecessary abstractions.

Gunakan reusable components jika UI memiliki pola yang sama.

Contoh:

```text
ProductForm
SellerSidebar
BottomNavigation
MoreMenu
ProductCard
StoreHeader
MarketplaceSelector
ShareButton
FilterSheet
SortSheet
6. React Implementation Rules

Gunakan React sebagai production frontend.

Prefer:

TypeScript,
reusable components,
centralized route configuration,
typed props,
typed API models,
predictable state management,
semantic HTML.

Jangan membuat component terlalu besar.

Jika component sudah menangani beberapa concern berbeda, pecah menjadi component yang lebih kecil.

7. Routing Rules

Routing harus mengikuti:

docs/ROUTES.md

Public:

/
/login
/register
/{storeId}
/{storeId}/product/{productId}/{slug}

Seller:

/seller/dashboard
/seller/products
/seller/products/new
/seller/products/:productId/edit
/seller/products/archived
/seller/categories
/seller/customer-interest
/seller/my-store
/seller/account
/seller/activities

Jangan membuat route baru hanya untuk:

search,
filter,
sort,
marketplace selector,
share,
announcement,
WhatsApp.

Recent Activity lengkap menggunakan route khusus:

/seller/activities

diakses dari Dashboard → Recent Activity → Lihat Semua. Halaman tersebut menyediakan Kembali ke Dashboard.

Hal tersebut adalah UI state / interaction.

8. Customer vs Seller Separation

Customer-facing UI dan seller management UI harus dipisahkan dengan jelas.

Customer:

Marketing Landing
Store Landing
Product Detail
Login
Register

Seller:

Dashboard
Products
Categories
Customer Interest
My Store
Profile

Jangan mencampurkan seller management UI ke public storefront.

"Profile" menggantikan istilah "Account" pada UI/navigation. Route tetap:

/seller/account

9. Seller Navigation

Desktop seller menggunakan satu reusable sidebar.

Gunakan:

Kataloga

(brand link ke Dashboard)

Dashboard
Products
Customer Interest
Recent Activity
My Store
Categories
[ User / Account Card ]
Logout

Tidak ada item "Profile" terpisah pada sidebar desktop.

Tidak ada item "Archive" pada sidebar desktop.

User/Account Card merupakan akses ke halaman Profile (/seller/account).

Jangan membuat sidebar berbeda-beda untuk setiap halaman.

Gunakan satu component:

SellerSidebar

Mobile menggunakan:

BottomNavigation
MoreMenu / MoreSheet

Bottom navigation berisi:

Dashboard
Products
Customer Interest

Fitur lainnya berada di More:

Recent Activity
My Store
Categories
Profile
Logout

10. Product Rules

Product status:

DRAFT
PUBLISHED
SOLD_OUT
ARCHIVED

Jangan menggunakan ACTIVE sebagai database status.

Lifecycle:

DRAFT → PUBLISHED
PUBLISHED → SOLD_OUT
SOLD_OUT → PUBLISHED
PUBLISHED → ARCHIVED
DRAFT → ARCHIVED
ARCHIVED → DRAFT

Tidak ada SOLD_OUT → DRAFT.

Reaktivasi SOLD_OUT langsung ke PUBLISHED.

Tidak ada konsep Product availability (AVAILABLE / SOLD_OUT) pada V1.

SOLD_OUT adalah lifecycle status, BUKAN availability field.

SOLD_OUT tidak boleh menampilkan "Always Sold Out permanen" di katalog.

### Auto Archive (store-level)

Auto Archive adalah setting level store.

UI Auto Archive terletak pada halaman Archive (/seller/products/archived), BUKAN pada My Store.

Nilai yang diperbolehkan:

- Tidak ada (default, menonaktifkan auto archive)
- 1 hari
- 7 hari
- 30 hari
- 90 hari
- 180 hari
- 365 hari
- Never (auto archive nonaktif, tetapi seller tetap bisa manual archive)

`Tidak ada` dan `Never` sama-sama menonaktifkan auto archive dan TIDAK memblokir manual archive.

Threshold dihitung dari durasi waktu product menjadi SOLD_OUT.

SOLD_OUT yang melewati threshold auto archive menjadi ARCHIVED dan tidak tampil di katalog.

Perubahan setting diterapkan sesuai durasi SOLD_OUT yang sudah berjalan.

Bukan model per-produk yang memilih retention terpisah.

SOLD_OUT yang masih dalam jendela auto archive tetap tampil di katalog aktif dengan indikasi Sold Out.

Auto archive scheduler adalah backend behavior; frontend hanya mengirim nilai setting ini.

### Product Unggulan

Product Unggulan adalah properti boolean terpisah di product.

Maksimum 10 Product Unggulan per store.

Feature dapat diaktifkan/dinonaktifkan hanya pada product status PUBLISHED.

DRAFT tidak pernah Product Unggulan.

Product ARCHIVED tidak pernah Product Unggulan.

Archiving otomatis menghapus status Product Unggulan.

Product yang berubah menjadi SOLD_OUT otomatis kehilangan status Product Unggulan (is_featured = false).

Reaktivasi SOLD_OUT ke PUBLISHED TIDAK otomatis mengembalikan status Product Unggulan.

Katalog aktif berisi:

PUBLISHED
SOLD_OUT yang masih dalam jendela auto archive

Urutan katalog:

Featured Published → Published lebih baru → Published lebih lama → Sold Out

DRAFT dan ARCHIVED tidak termasuk katalog aktif.

Dashboard:

Active Products = PUBLISHED

"Active Products" adalah label dashboard/catalog, bukan status database/lifecycle.

Produk SOLD OUT tetap dapat dilihat pelanggan.

Draft terpisah.

Public catalog visibility:

PUBLISHED tampil publik
SOLD_OUT yang masih dalam jendela auto archive tampil publik
ARCHIVED tidak tampil publik
DRAFT tidak tampil publik

Restore:

ARCHIVED → DRAFT

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

11. Product Publish Validation

Untuk Publish, field berikut wajib:

Product Name
Product Photo (minimum 1)
Category
Product Details
Description
Condition
Price

Optional:

Brand
External Product Links
Product Unggulan

Draft boleh incomplete.

Jangan membuat semua custom attributes wajib.

12. Product Condition

Condition hanya:

NEW
SECOND
13. Product Status — Sold Out

Tidak ada konsep Product availability (AVAILABLE / SOLD_OUT) pada V1.

Sold Out adalah lifecycle status produk, bukan availability field.

Tidak ada stock quantity pada V1.

Jangan menambahkan:

stock
quantity
remainingStock
lowStock

kecuali requirement baru sudah disetujui.

Katalog aktif berisi PUBLISHED dan SOLD_OUT yang masih dalam jendela auto archive.

Jangan memakai perilaku "Sold Out selalu tampil permanen" di katalog/storefront.

SOLD_OUT yang melewati auto archive menjadi ARCHIVED dan tidak tampil di katalog.
14. Product Category

Product memiliki tepat satu category pada V1.

Category maksimal menggunakan dua level:

Kategori Utama
└── Sub Kategori

Terminology user-facing:

Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Jangan membuat hierarchy lebih dalam tanpa requirement baru.

Seller dapat membuat custom category yang scoped ke store.

Seller dapat membuat Kategori Utama baru langsung dari form pembuatan category.

Setiap category memiliki "Lihat Produk".

"Lihat Produk" mengarah ke:

/seller/products?category=...

Brand card pada halaman Categories juga menggunakan aksi "Lihat Produk" yang mengarah ke:

/seller/products?brand=...

Category filter pada seller products menggunakan URL query sebagai source of truth.

Category yang masih digunakan product tidak boleh dihapus.

Kategori Utama yang masih memiliki child tidak boleh dihapus.

Tidak ada cascade delete.

Hitung penggunaan product kategori:

Kategori Utama count mencakup product di descendant-nya (Sub Kategori).

Contoh:

Computer (5)
└── Laptop (3)
└── Desktop (2)

Computer = aggregate usage 5 product.

15. Product Details

Product Details menggunakan hybrid approach:

category-based recommended attributes,
seller custom attributes.

Customer melihatnya dalam format yang clean.

Product Details wajib tersedia untuk Publish.

16. External Sales Channels

External channel harus generic.

Gunakan model:

type ExternalChannel = {
  name: string;
  url: string;
}

Tidak ada field id pada persisted model/API contract.

Model yang sama berlaku untuk Store external channels dan Product external links.

Jangan menambahkan:

id
iconUrl
logoUrl
description
displayOrder
analytics
integrationType

kecuali requirement baru disetujui.

Channel tidak fixed.

Seller dapat memasukkan channel eksternal yang mereka gunakan.

17. Marketplace Interaction

Ketika customer menekan Marketplace:

tampilkan channel yang dikonfigurasi seller,
customer memilih channel,
baru lakukan authentication check,
jika guest → login/register,
jika authenticated → record customer interest,
redirect ke exact external URL.

Jangan langsung redirect sebelum channel dipilih.

Jangan menampilkan marketplace icon/logo.

18. WhatsApp Interaction

Ketika customer menekan WhatsApp:

Guest:

Login/Register
→ preserve context
→ return to product
→ continue WhatsApp action

Authenticated:

record Customer Interest
→ open WhatsApp

Product view atau share tidak boleh membuat Customer Interest.

19. Customer Interest

Customer Interest hanya mencatat:

WHATSAPP_CLICK
MARKETPLACE_CLICK

Tidak mencatat:

PRODUCT_VIEW
SHARE
LOGIN
LOGOUT
CATEGORY_ACTIVITY
STORE_VISIT

Marketplace activity harus menyimpan channel yang dipilih.

Identitas customer yang direkam:

Email
Phone

Tidak ada uploaded customer profile photo pada V1.

Activity owner di store miliknya sendiri TIDAK dicatat:

- seller membuka WhatsApp/Marketplace pada storefront miliknya sendiri → bukan Customer Interest.
- Frontend harus menghindari pencatatan; backend diharapkan menegakkan.

Contoh:

Customer A
Product: Laptop XYZ
Channel: Shopee
Date: ...

Customer yang sama dapat memiliki beberapa activity.

Jangan membuat customer record baru untuk setiap activity.

Total Interest berarti total record interaksi, bukan jumlah customer unique.

Customer Interest cards (Dashboard) menggunakan hierarchy:

1. Channel name di atas
2. Icon channel rata kanan (align right)
3. Activity count besar dan bold sebagai focal point
4. Teks pendukung "aktivitas minat" (contoh total, dalam bahasa "aktivitas minat", bukan "7 Minat")

Desktop: card-channel berbagi lebar yang tersedia secara merata (3 card side-by-side) tanpa fixed width memaksa.

Mobile: card boleh horizontal scroll.

Detail Customer Interest menampilkan:

Customer
Product
Activity
Time
Customer interaction history

Action detail:

"Lihat Product" → membuka product detail customer-facing.

"Tutup" → menutup detail.

Jangan menyediakan aksi kontak customer seperti:

Hubungi Customer
Buka WhatsApp Customer
Buka Marketplace
Buka Channel

20. Recent Activity

Recent Activity seller hanya mencakup:

Product Published
Product Edited
Product Sold Out
Product Reactivated
Product Archived
Product Restored
Store Updated

Dashboard menampilkan 4 aktivitas terbaru dan "Lihat Semua".

Lihat Semua membuka route:

/seller/activities

Halaman tersebut adalah list Recent Activity lengkap dan menyediakan "Kembali" ke Dashboard.

Filter pada halaman /seller/activities menggunakan TANGGAL TUNGGAL (single date), bukan date range.

Pemilihan tanggal menggunakan date picker, bukan input teks manual.

Date display:

12.09.2026

Datetime display:

12.09.2026 · 18:02

Tanpa weekday.

Customer Interest tidak boleh muncul di Recent Activity.

Jangan memasukkan:

WhatsApp Click
Marketplace Click
Product View
Share
Login
Logout
Category Create
Category Edit
Category Delete

Customer activity berada di Customer Interest.

21. Store Rules

Store:

1 Account = maximum 1 Store

Create Store hanya membutuhkan:

Store Name
Store ID

Setelah Create Store:

Login/Register
→ Create Store
→ My Store

Seller langsung mendarat di My Store.

Seller TIDAK diblokir dari sidebar atau pembuatan product karena informasi store belum lengkap.

Seller tetap dapat mengakses:

Dashboard
Products
Categories
Customer Interest
My Store
Profile

Jangan mengarahkan seller langsung ke empty Dashboard setelah membuat store.

22. Store ID

Store ID:

required,
unique,
public,
human-readable,
dapat diubah seller,
hanya dapat diubah sekali setiap 30 hari.

Format:

huruf kecil,
angka,
dan tanda hubung (-) saja.

diawali dan diakhiri karakter alfanumerik.

tidak ada tanda hubung berurutan.

di-trim.

Availability Store ID:

diperiksa saat Store ID valid,
saat Store ID berubah,
dan diperiksa ulang pada saat submit.

Frontend harus mengikuti backend validation.

Jangan hanya mengandalkan frontend validation untuk aturan 30 hari.

Store ID tidak ditampilkan secara visual pada Store Landing.

Store Link diturunkan dari Store ID saat ini dan ditampilkan di My Store.

Semua historical Store ID tetap menjadi valid alias yang redirect ke store saat ini.

Historical aliases adalah behavior backend-owned.

Frontend tidak memelihara alias mapping sendiri.

23. Public Store URL

Format:

/{storeId}

Product Listing:

/{storeId}/products

Product:

/{storeId}/product/{productId}/{slug}

productId adalah public numeric product ID.

slug adalah URL slug dari Product Name.

Contoh:

/toko-komputer-jaya
/toko-komputer-jaya/products
/toko-komputer-jaya/product/20/laptop-asus-rog
24. Store Landing

Store Landing harus:

responsive,
clean,
easy to scan,
focused on catalog.

Storefront navbar berisi:

Store Logo
Store Name
City/Province

Bukan: WhatsApp, Marketplace, atau Full Address di navbar.

Desktop actions:

Hubungi via WhatsApp
Marketplace
Share

Mobile:

Hubungi via WhatsApp
Marketplace + Share

Store ID tidak ditampilkan.

Store Landing mengarah ke Product Listing:

/{storeId}/products

yang menyediakan search, filter, sort, dan product grid.

25. Store Share

Store Share hanya membagikan:

Store Name
Store URL

Tidak ada QR Code.

Jangan membuat:

QR field
QR component
QR generator
QR backend requirement
26. Product Share

Product Share membagikan product-specific URL.

Share bukan Customer Interest.

Share analytics belum menjadi scope V1.

27. Search / Filter / Sort

Search, filter, dan sort customer berada di Product Listing:

/{storeId}/products

Search hanya mencari dalam current seller store.

Search:

case insensitive,
partial match,
multi-field,
relevance ranking.

Searchable:

Product Name
Brand
Category
Product Details
Description
Attributes

Filter:

Category
Condition: New / Second

Tidak ada:

Price filter
Attribute filter
Availability filter

Sort:

Relevance
Newest
Price Low → High
Price High → Low

Tidak ada availability ordering/grouping.

Tidak ada route tambahan untuk search/filter/sort.

28. Product Card

Product information (urutan):

1. Product image
2. Category
3. Product name
4. Price
5. Condition badge
6. Product Unggulan indicator (jika featured)

Price harus bold dan lebih menonjol dibandingkan nama produk.

Ditampilkan tanpa:

Brand
SKU
Availability

Conditional:

SOLD OUT indicator (jika product SOLD_OUT yang masih dalam auto archive)

SOLD OUT card menggunakan visual state GRAY yang jelas berbeda dari card aktif, lebih dari sekadar teks "Sold Out". Sold Out BUKAN state merah/error.

Actions (terpisah dari urutan informasi; posisi mengikuti layout yang sudah disetujui):

- Lihat Detail
- Share icon

Tidak menampilkan:

WhatsApp
Marketplace
Contact Seller

DRAFT dan ARCHIVED tidak pernah menjadi public product card.

29. Product Detail

Hierarchy:

Brand (jika tersedia) dengan format eksplisit "Brand : X"
Product Unggulan indicator (jika featured)
Product Name
Price (bold)
Category / Condition (bersebelahan, di bawah Price)
Actions
Product Details
Description

Featured indicator terpisah secara visual dari Brand.

Brand ditampilkan secara eksplisit pada Product Detail. Contoh tampilan penulisan nama brand diikuti colon:

Brand : ASUS

Bagian External Product Links TIDAK ditampilkan pada Product Detail. External Product Links tetap ada sebagai field data product (form product dan API), tetapi tidak dirender di halaman Product Detail customer-facing.

Actions:

WhatsApp
Marketplace
Share

Primary action adalah "Hubungi via WhatsApp".

Marketplace dan Share tersedia sebagai secondary actions.

Marketplace hanya ditampilkan jika store memiliki setidaknya satu external channel aktif.

Pada mobile, "Hubungi via WhatsApp" tetap menjadi primary action.

Product SOLD_OUT (masih dalam auto archive):

tetap dapat dilihat,
indikasi Sold Out yang jelas,
WhatsApp tidak tersedia,
Marketplace tidak tersedia,
Share tetap tersedia.

Desktop:

image/gallery fixed di kiri, panel info scroll di dalam area tersebut,
footer di luar area scroll.

Mobile:

images menggunakan swipe-only carousel/slider, info di bawah images.

Tidak menggunakan stock count.

30. Responsive Design

Desktop dan mobile bukan sekadar scaling.

Mobile harus mempertimbangkan:

touch target,
bottom navigation,
bottom sheet,
horizontal scrolling,
compact layout,
readable typography,
balanced sections.

Untuk detail layout yang menggunakan left/right sections:

usahakan visual height terasa seimbang.

Jika content panjang:

gunakan:

expand/collapse,
scroll,
truncation,

bukan memaksa layout menjadi tidak seimbang.

31. Assets

Dynamic assets dari backend/API:

store logo
product photo
seller avatar
store photo

Jangan menyimpannya sebagai production assets di:

src/assets/

Gunakan URL dari API.

Contoh:

product.imageUrl
store.logoUrl
user.avatarUrl

Static frontend-owned assets boleh berada di:

src/assets/

Contoh:

src/assets/branding/
src/assets/marketing/
32. Profile Photo

Customer tidak menggunakan uploaded profile photo pada V1.

Gunakan generic user-circle icon untuk:

customer navbar,
Customer Interest.

Seller/account owner (Profile) boleh memiliki profile photo/avatar.

Jangan menyamakan customer avatar dengan seller avatar.

33. Visual Implementation

Visual implementation harus mengikuti:

reference/screenshots/

Perhatikan:

spacing,
typography,
card layout,
button size,
border radius,
shadows,
navigation,
responsive behavior,
hierarchy.

Jangan membuat visual baru jika screenshot sudah menentukan desain.

Jika screenshot tidak menentukan suatu detail:

ikuti docs/UI_RULES.md.

Jika masih tidak jelas:

jangan invent UX yang memiliki dampak besar.

34. Stitch Code

Stitch code hanya digunakan sebagai reference.

Boleh mengambil inspirasi untuk:

markup structure,
Tailwind classes,
layout,
component idea.

Tetapi production code harus:

reusable,
cleaned,
typed,
integrated dengan architecture project.

Jangan copy-paste seluruh Stitch project menjadi production.

35. Mock Data

Mock data boleh digunakan selama API belum tersedia.

Namun:

pisahkan mock data dari UI,
gunakan typed models,
jangan menyebarkan hardcoded mock objects ke component,
buat API-ready abstraction.

Contoh:

src/
├── data/
├── services/
├── types/
└── components/

Ketika API tersedia, replacement harus mudah.

36. API Readiness

Frontend harus siap menerima data dari backend.

Hindari component yang hanya bekerja dengan hardcoded data.

Gunakan model seperti:

type Product = {
  id: number;
  name: string;
  ...
}

API mapping harus dipisahkan dari UI ketika diperlukan.

37. State Handling

Setiap data-driven page harus mempertimbangkan:

loading
success
empty
error

Contoh:

Products Loading
Products Empty
Products Error
Products Loaded

Jangan hanya membuat happy path.

38. Authentication

Protected seller routes harus membutuhkan authentication.

Customer auth hanya diperlukan untuk action yang membuat Customer Interest:

WhatsApp
Marketplace channel selection

Browsing storefront dan viewing product tidak membutuhkan login.

### Seller Preview Storefront (akun sudah login)

Ketika seller yang sudah login membuka storefront-nya sendiri (misalnya "Lihat Toko" dari Seller), sesi yang sama digunakan ulang:

- navbar storefront menampilkan icon user-circle untuk customer (bukan tombol Login/Daftar).
- "Lihat Toko" TIDAK menampilkan Login/Daftar karena user sudah authenticated.
- Mengakses store URL langsung (direct link) tanpa sesi berarti tampil sebagai guest.
- Seller boleh membuka WhatsApp/Marketplace pada storefront miliknya sendiri; interaksi tersebut tetap TIDAK dicatat sebagai Customer Interest (lihat §19).
- Tidak ada konsep role-switching "customer mode" baru; halaman yang sama dirender sesuai sesi auth yang ada.

39. Context Preservation

Jika guest melakukan action yang membutuhkan authentication:

simpan context yang diperlukan.

Contoh:

Product URL
Selected marketplace channel

Setelah login/register, user harus dapat kembali ke context sebelumnya.

Jangan membuang context tanpa alasan.

40. Component Reuse

Jika dua halaman memiliki UI atau behavior yang sama:

buat reusable component.

Contoh:

ProductForm

digunakan oleh:

Add Product
Edit Product

Edit Product harus menggunakan UI/form yang sama dengan Add Product.

Perbedaannya hanya:

mode = create
mode = edit

dan existing data.

41. No Duplicate Pages

Jangan membuat duplicate page untuk feature yang sama.

Contoh:

Customer Interest dashboard summary:

Dashboard
→ Customer Interest

dan sidebar:

Customer Interest
→ same Customer Interest page

Jangan membuat dua Customer Interest page berbeda.

42. Code Quality

Setelah perubahan:

fix TypeScript errors,
fix lint errors,
remove unused imports,
remove dead code,
avoid duplicated logic,
keep naming consistent,
keep components readable.

Jangan meninggalkan temporary debugging code.

Hindari:

console.log(...)

kecuali memang diperlukan.

43. Scope Control

Jangan mengerjakan fitur di luar task.

Jika task:

Implement Product Card

jangan sekaligus mengubah:

authentication,
dashboard,
backend model,
unrelated navigation.

Unrelated changes meningkatkan risk.

44. Before Coding

Untuk task non-trivial:

gunakan Plan Mode terlebih dahulu.

Plan harus menjawab:

file apa yang akan diubah,
component apa yang akan dibuat,
data/model apa yang diperlukan,
route apa yang terpengaruh,
existing code apa yang bisa digunakan,
potential regression,
verification yang akan dilakukan.

Setelah plan disetujui / jelas:

baru implement.

45. Before Editing Existing Code

Sebelum mengubah file:

baca file tersebut,
pahami existing architecture,
cari component/service/type terkait,
cek apakah reusable component sudah ada,
jangan membuat duplicate implementation.
46. Verification

Setelah implementation:

minimum verify:

TypeScript
Build
Routing
Responsive behavior
Existing functionality

Jika test tersedia:

jalankan test yang relevan.

Jika ada visual reference:

bandingkan implementation dengan screenshot.

47. Visual QA

Untuk UI task:

cek minimal:

Desktop
layout width,
spacing,
alignment,
typography,
sidebar,
content hierarchy,
button placement.
Mobile
responsive layout,
bottom navigation,
touch targets,
horizontal scroll,
bottom sheets,
text wrapping,
no horizontal overflow.
48. Accessibility

Gunakan semantic HTML.

Perhatikan:

button vs div,
keyboard navigation,
focus state,
accessible labels,
alt text,
sufficient contrast,
touch target size.

Icon-only button harus memiliki accessible label.

49. Error Handling

Jangan membuat silent failure.

Jika API/action gagal:

tampilkan feedback,
pertahankan user context jika memungkinkan,
jangan kehilangan input tanpa alasan.

Error message harus understandable oleh user.

50. Important UX Terminology

Gunakan terminology yang konsisten.

Product status:

DRAFT
PUBLISHED
SOLD_OUT
ARCHIVED

Condition:

New
Second

Category:

Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Dashboard:

Active Products

berarti:

Published

Produk SOLD OUT tetap dapat dilihat pelanggan.

Bukan database status baru.

51. Development Workflow

Kerjakan Kataloga secara incremental.

Urutan kerja mengikuti dokumentasi di:

docs/IMPLEMENTATION-PLAN.md

Urutan umum:

Documentation & AGENTS Alignment
→ Documentation Verification
→ Frontend Read-Only Audit
→ Human Review
→ Implementation Planning
→ Incremental Implementation

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

Testing dan visual QA dilakukan secara incremental, bukan hanya di akhir.

Jangan mengklaim phase implementation selesai hanya karena dokumentasi sudah diperbarui.

Jangan mencoba membangun seluruh Kataloga dalam satu task.

52. Git Discipline

Setiap milestone besar sebaiknya menghasilkan perubahan yang jelas dan terisolasi.

Hindari satu commit yang berisi:

unrelated features,
refactor besar,
UI changes,
API changes,

sekaligus.

Commit harus mudah dipahami dan di-review.

53. Final Rule

Kataloga harus tetap:

Simple
Focused
Consistent
Responsive
Maintainable
API-ready

Prioritaskan requirement yang sudah disetujui daripada asumsi atau "nice to have".

Jika ada konflik antara:

AI suggestion
vs
locked Kataloga requirement

ikuti locked Kataloga requirement.

Jika requirement belum cukup jelas dan keputusan tersebut berdampak pada UX, architecture, atau business logic:

STOP → explain the ambiguity → ask for clarification.


