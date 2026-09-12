# Kataloga — Product Requirements

## 1. Product Overview

Kataloga adalah platform katalog/storefront yang membantu seller:

- Mengelola produk dan katalog.
- Menampilkan toko secara rapi kepada customer.
- Membagikan link toko dan produk.
- Menghubungkan customer ke WhatsApp dan channel penjualan eksternal.

Kataloga **bukan platform transaksi**.

Kataloga tidak menangani:

- Checkout.
- Pembayaran.
- Order.
- Keranjang belanja.
- Transaksi marketplace.
- Manajemen stok/quantity.
- CRM kompleks.
- Analytics lanjutan.

Customer melihat katalog di Kataloga, kemudian diarahkan ke channel penjualan seller jika ingin menghubungi atau melanjutkan pembelian.

---

# 2. Account Model

Satu account dapat memiliki maksimal satu store pada V1.

Satu account tidak memiliki role permanen sebagai "customer" atau "seller".

Account yang memiliki store dapat bertindak sebagai seller untuk tokonya sendiri dan tetap dapat menjadi customer ketika mengunjungi store lain.

### Authentication

Login menggunakan:

- Email atau phone number
- Password

Register menggunakan:

- Email/phone
- Password
- Re-password
- Customer name bersifat optional

Tidak menggunakan username.

---

# 3. Store Model

Store memiliki public URL:

`/{storeId}`

Contoh:

`kataloga.com/toko-komputer-jaya`

Store ID adalah identifier yang digunakan pada public URL.

### Store ID Rules

- Store ID wajib saat membuat toko.
- Store ID harus unique.
- Store ID dapat diubah seller.
- Perubahan Store ID hanya dapat dilakukan maksimal satu kali dalam 30 hari.
- Store ID tidak menggunakan nama toko secara otomatis sebagai satu-satunya identifier yang tidak dapat diubah.
- Format Store ID: huruf kecil, angka, dan tanda hubung (`-`) saja.
- Diawali dan diakhiri karakter alfanumerik.
- Tidak ada tanda hubung berurutan.
- Store ID di-trim.
- Availability Store ID diperiksa saat Store ID valid, saat Store ID berubah, dan diperiksa ulang pada saat submit.

### Create Store

Saat account belum memiliki store, seller dapat membuat store.

Field wajib:

- Store Name
- Store ID

Field lain tidak wajib pada Create Store.

Setelah store berhasil dibuat, seller **langsung diarahkan ke My Store** untuk melengkapi informasi toko.

Flow:

`Create Store → My Store → Dashboard`

---

# 4. Store Information

Informasi store yang dapat dikelola seller melalui My Store meliputi:

- Store Logo
- Store Name
- Store ID
- Store Description / Bio
- Province
- City / Regency
- Full Address (opsional, free-text)
- Operating Hours
- WhatsApp
- External Sales Channels
- Announcement

Store ID dapat diedit sesuai aturan perubahan 30 hari.

Customer tidak melihat Store ID sebagai informasi visual pada Store Landing. Store ID tetap digunakan sebagai bagian URL.

Store Link diturunkan dari Store ID saat ini dan ditampilkan di My Store.

Location dipilih dengan urutan: Province dahulu, kemudian City/Regency yang scoped ke province tersebut.

Store Landing menampilkan lokasi dengan format kota terlebih dahulu, kemudian province, misalnya:

`Kota Bandung, Jawa Barat`

---

# 5. Store Landing

Store Landing adalah storefront publik milik seller.

Route:

`/{storeId}`

Contoh:

`kataloga.com/toko-komputer-jaya`

Tidak terdapat public directory atau halaman yang menampilkan seluruh store Kataloga.

Customer mendapatkan Store Landing melalui link store yang dibagikan seller atau sumber lainnya.

---

# 6. Store Landing Navigation

### Guest

Navbar:

- Store Logo
- Store Name
- Login
- Daftar

### Logged-in Customer

Navbar:

- Store Logo
- Store Name
- Generic User Circle
- Profile controls

Customer profile photo tidak digunakan pada navbar.

Tidak menggunakan hamburger/store-specific navigation tambahan pada desktop.

Mobile menggunakan navbar yang lebih compact.

---

# 7. Store Header

Store Landing menampilkan:

- Store Logo
- Store Name
- Verification Badge jika tersedia
- Store Description / Bio
- City / shipping origin
- Operating Hours

Store ID tidak ditampilkan sebagai informasi visual.

### Mobile Header

Urutan:

1. Store profile/logo
2. Store name
3. Store description
4. Address/city dan operating hours secara berdampingan
5. Full-width WhatsApp button
6. Marketplace dan Share secara berdampingan

---

# 8. Store Actions

Desktop:

`[WhatsApp] [Marketplace] [Share]`

Mobile:

`[WhatsApp]`

`[Marketplace] [Share]`

### WhatsApp

Customer dapat menghubungi seller melalui WhatsApp.

Jika guest:

`WhatsApp → Login/Register → kembali ke context sebelumnya → record Customer Interest → buka WhatsApp`

Jika authenticated:

`WhatsApp → record Customer Interest → buka WhatsApp`

---

# 9. Marketplace

Marketplace adalah kumpulan external sales channels yang dikonfigurasi seller.

Channel tidak dibatasi pada marketplace tertentu.

Seller dapat menambahkan arbitrary external channels menggunakan:

- Channel name
- URL

Tidak menggunakan marketplace icon/logo sebagai requirement V1.

Contoh:

- Shopee
- Tokopedia
- Website
- Instagram
- Channel eksternal lainnya

### Store-level Marketplace

Store dapat memiliki beberapa external sales channels.

Ketika customer klik Marketplace:

- Desktop: tampilkan popover/dropdown.
- Mobile: tampilkan bottom sheet.

Customer memilih channel terlebih dahulu.

Setelah channel dipilih:

- Guest → Login/Register → kembali ke context → record interest → redirect ke URL channel.
- Authenticated → record interest → redirect ke exact URL channel.

Customer Interest menyimpan channel yang benar-benar dipilih.

---

# 10. Share

Share tidak memerlukan authentication.

Share tidak membuat Customer Interest.

Share tidak menggunakan QR Code.

Tidak ada QR Code requirement pada V1.

### Store Share

Membagikan:

- Store name
- Store URL

### Product Share

Membagikan:

- Product name
- Product URL

Share analytics ditunda/deferred untuk V1.

---

# 11. Announcement

Store dapat memiliki satu active announcement pada satu waktu.

Announcement dapat berisi beberapa informasi.

UI:

- Compact banner/card
- Expandable/collapsible

Tidak menggunakan carousel.

---

# 12. Products

Product adalah item katalog yang ditampilkan seller.

Product fields:

- Product Name
- Product Photo
- Category
- Brand
- Product Details
- Description
- Condition
- Price
- External Product Links
- Status
- Featured Product

---

# 13. Product Photos

Product memiliki:

- Minimum 1 photo
- Maximum 5 photos

Seller dapat memilih salah satu foto sebagai Main Photo.

Customer melihat gallery pada Product Detail.

---

# 14. Product Category

Product hanya memiliki satu category pada V1.

Category mendukung maksimal dua level:

- Kategori Utama
- Sub Kategori

Terminology user-facing:

- Kategori Utama
- Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Contoh:

`Elektronik → Laptop`

Seller dapat menggunakan default/built-in categories dan custom categories milik store.

Seller dapat membuat Kategori Utama baru langsung dari form pembuatan category.

Setiap category memiliki "Lihat Product" yang mengarah ke:

`/seller/products?category=...`

Category product filtering menggunakan URL query sebagai source of truth.

Category deletion tidak diperbolehkan jika masih digunakan oleh product.

Kategori Utama yang masih memiliki child tidak boleh dihapus.

Tidak ada cascade delete.

---

# 15. Brand

Brand bersifat optional.

Brand tidak ditampilkan pada Product Card.

Brand ditampilkan pada Product Detail.

---

# 16. Product Details

Product Details menggunakan hybrid structured + custom attributes.

Category dapat memberikan rekomendasi attribute.

Seller tetap dapat menambahkan custom attributes.

Product Details **wajib untuk Publish**.

Namun Draft dapat disimpan walaupun Product Details belum lengkap.

Contoh:

- RAM — 16 GB
- Storage — 512 GB
- Processor — Intel Core i7

Seller dapat menambahkan custom attribute.

---

# 17. Product Description

Description **wajib untuk Publish**.

Description digunakan untuk penjelasan produk yang lebih panjang.

Pada customer Product Detail, description yang panjang dapat menggunakan expand/collapse atau mekanisme yang sesuai dengan desain.

---

# 18. Product Condition

Condition memiliki dua pilihan:

- NEW
- SECOND

Customer dapat memfilter product berdasarkan:

- New
- Second

---

# 19. Sold Out — Product Status

Sold Out adalah product lifecycle status, bukan availability field.

Tidak ada field Product availability (AVAILABLE / SOLD_OUT) pada V1.

Katalog/storefront aktif hanya berisi produk PUBLISHED.

Produk SOLD_OUT tidak termasuk katalog aktif.

Kataloga V1 tidak menggunakan stock quantity.

Tidak ada stock count seperti:

`Stock: 10`

---

# 20. Product Status

Product memiliki empat status:

- DRAFT
- PUBLISHED
- SOLD_OUT
- ARCHIVED

### Draft

Product belum ditampilkan kepada customer.

Draft boleh belum lengkap.

### Published

Product ditampilkan pada Store Landing.

Published harus memenuhi required fields.

### Sold Out

Status lifecycle setelah product kehabisan/terjual.

SOLD_OUT adalah area seller management yang terpisah dari katalog aktif.

SOLD_OUT tidak ditampilkan pada katalog/storefront aktif.

Seller dapat mengembalikan product SOLD_OUT menjadi PUBLISHED.

### Archived

Product tidak ditampilkan pada Store Landing.

Archive terpisah dari Active Products.

### Restore

Restore dari Archived selalu menghasilkan:

`ARCHIVED → DRAFT`

Bukan Published.

### Lifecycle

`DRAFT → PUBLISHED → SOLD_OUT → PUBLISHED`
`PUBLISHED → ARCHIVED`
`ARCHIVED → DRAFT`

---

# 21. Active Products

"Active Products" adalah konsep statistik/dashboard, bukan status database.

Active Products terdiri dari:

- Published

Jadi:

`Active Products = PUBLISHED`

SOLD_OUT dihitung secara terpisah.

Draft dihitung secara terpisah.

Archived dihitung secara terpisah.

SOLD_OUT tidak termasuk Active Products.

---

# 22. Product Required Fields

Untuk Publish Product:

Required:

- Product Name
- Minimum 1 Product Photo
- Category
- Product Details
- Description
- Condition
- Price

Optional:

- Brand
- External Product Links
- Featured Product

Draft dapat disimpan walaupun field publish belum lengkap.

---

# 23. External Product Links

External Product Links bersifat arbitrary.

Model konseptual:

```ts
type ExternalProductLink = {
  name: string;
  url: string;
}

Tidak ada field `id` pada persisted model/API contract.

Tidak menggunakan fixed fields seperti:

shopeeUrl
tokopediaUrl
lazadaUrl

Tidak ada requirement:

iconUrl
analytics
API integration

untuk V1.

24. Featured Product

Seller dapat menandai product sebagai Featured.

Featured product ditampilkan pada section:

Produk Unggulan

di Store Landing.

Featured products:

Horizontal scrolling
Tidak menggunakan auto-slide
Desktop dapat menggunakan subtle navigation arrows
Mobile menggunakan swipe
25. Product Card

Product Card menampilkan:

Condition badge pada bagian kiri atas image
Product image
Product name
Category
Price
Lihat Detail
Share icon

Tidak menampilkan:

Brand
WhatsApp
Marketplace
Contact Seller

Product card memiliki:

Desktop: 3 columns
Mobile: 2 columns

Sold-out product tetap terlihat dengan SOLD OUT state/badge.

26. Product Search

Search hanya mencari product pada current store.

Search:

Case-insensitive
Mendukung partial match
Mendukung close/exact match
Multi-field
Menggunakan relevance ranking

Searchable fields:

Product Name
Brand
Category
Product Details
Description
Attributes

Attribute filtering belum tersedia pada V1.

27. Product Filter

Customer dapat melakukan filtering pada catalog.

Filter:

Category
Condition

Condition:

New
Second

Tidak ada filter:

Price
Attribute
Desktop

Filter ditampilkan secara compact/horizontal.

Ketika filter dibuka, customer dapat memilih:

Condition
□ New
□ Second

dan Category.

Terdapat tombol:

Apply Filter

Mobile

Filter menggunakan bottom sheet.

28. Product Sort

Sort options:

Relevance
Newest
Price Low → High
Price High → Low

Tidak ada availability grouping/ordering.

Sort diterapkan langsung pada seluruh product di katalog aktif.
29. Product Detail

Route:

/{storeId}/products/{productId}

Contoh:

kataloga.com/toko-komputer-jaya/products/20

productId adalah public numeric database-style ID.

Desktop:

Gallery di kiri
Product information di kanan

Mobile:

Gallery
Product information
Price
Actions
Product details
Description

Hierarchy:

Product Name
Price
Brand / Category / Condition / short description
Actions
Product Details
Description

Tidak ada tampilan availability (Tersedia / Sold Out) pada Product Detail.

Tidak menggunakan "Stok Siap Kirim".

30. Product Detail Actions

Actions:

WhatsApp
Marketplace
Share

WhatsApp dan Marketplace mengikuti authentication + Customer Interest rules.

Share tidak membutuhkan authentication dan tidak membuat Customer Interest.

31. Customer Interest

Customer Interest bukan CRM penuh.

Customer Interest hanya mencatat meaningful channel intent:

WhatsApp Click
Marketplace Click

Tidak mencatat:

Product View
Share
Login/logout
Search
Filter
Sort

Customer yang melakukan beberapa aktivitas tetap merupakan satu customer.

Contoh:

Customer A:

WhatsApp → Product A
Shopee → Product B
Website → Product C

tetap merupakan satu customer dengan beberapa activities.

Seller dapat melihat:

Customer
Product
Channel
Date/time

Customer profile photo tidak digunakan. Gunakan generic User Circle icon.

Total Interest berarti total record interaksi, bukan jumlah customer unique.

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

32. Seller Dashboard

Dashboard berfungsi sebagai pusat informasi dan shortcut seller.

Prioritas:

Catalog Condition
Customer Interest
Recent Activity
Quick Actions
Catalog Condition

Menampilkan:

Active Products
Sold Out Products
Archived Products

Active Products = Published.

SOLD_OUT dihitung terpisah.

Draft dihitung terpisah.

Customer Interest

Menampilkan ringkasan WhatsApp dan Marketplace activity.

Dashboard Customer Interest dan dedicated Customer Interest menggunakan halaman Customer Interest yang sama.

Recent Activity

Hanya menampilkan:

Product Published
Product Edited
Store Updated

Tidak menampilkan:

WhatsApp Click
Marketplace Click
Product View
Share
Login/logout
Category create/edit/delete

Dashboard menampilkan "Lihat Semua".

Lihat Semua membuka route:

/seller/activities

Halaman tersebut adalah list Recent Activity lengkap dan menyediakan "Kembali" ke Dashboard.

Quick Actions

Digunakan sebagai shortcut untuk pekerjaan seller yang paling sering digunakan.

33. Seller Products

Seller dapat:

Melihat products
Search products
Filter/sort sesuai kebutuhan UI
Add Product
Edit Product
Archive Product
Restore Product
Mengatur Featured
Melihat status (DRAFT / PUBLISHED / SOLD_OUT / ARCHIVED)

Status SOLD_OUT merupakan area seller management terpisah dari katalog aktif.

Routes konseptual:

/seller/products
/seller/products/new
/seller/products/:productId/edit
/seller/products/archived

Category filter pada seller products menggunakan URL query sebagai source of truth:

/seller/products?category=...
34. Add Product

Add Product menggunakan full-page form.

Form berisi:

Product Photos
Product Name
Category
Brand
Product Details
Description
Condition
Price
External Product Links
Featured Product

Actions:

Save as Draft
Publish Product

Setelah berhasil:

Add Product → Products

35. Edit Product

Edit Product menggunakan UI/form yang sama dengan Add Product.

Perbedaannya:

Title berubah dari "Tambah Produk" menjadi "Edit Produk"
Existing product data sudah terisi
Save/update behavior menyesuaikan existing product

Tidak membuat desain/form Edit Product terpisah.

Conceptual implementation:

<ProductForm mode="create" />
<ProductForm mode="edit" />
36. Seller Navigation

Desktop menggunakan reusable Seller Sidebar.

Menu utama:

Dashboard
Products
Categories
Customer Interest
My Store
Profile
Logout

Mobile menggunakan reusable Bottom Navigation dengan:

3 main features
More

More berisi:

Categories
My Store
Profile

Seller navigation harus konsisten di seluruh seller pages.

37. My Store

My Store digunakan untuk mengelola informasi storefront.

My Store digunakan dalam dua kondisi:

Setelah Create Store

Seller langsung diarahkan:

Login/Register → Create Store → My Store

Seller langsung mendarat di My Store.

Seller TIDAK diblokir dari sidebar atau pembuatan product jika informasi toko belum lengkap.

Seller tetap dapat mengakses Dashboard, Products, Categories, Customer Interest, My Store, dan Profile.

Setelah onboarding selesai

Seller dapat membuka My Store kapan saja melalui Seller Navigation untuk mengedit informasi toko.

My Store menampilkan Store Link yang diturunkan dari Store ID saat ini.

Tidak membuat halaman onboarding toko terpisah.

38. Marketing Landing

Route:

/

Marketing Landing adalah halaman utama Kataloga untuk seller acquisition.

Kataloga tidak memiliki public store directory.

Hero headline:

"Toko Lebih Rapi. Jualan Jadi Lebih Mudah dengan Kataloga."

Subheadline:

"Kelola produk, tampilkan toko dengan mudah, dan terhubung dengan customer tanpa harus berpindah-pindah."

Primary purpose:

Menjelaskan value Kataloga
Mengajak seller membuat toko

CTA utama:

Buat Toko

39. Marketing Landing Value Propositions
Kelola Produk dengan Mudah

"Tambah, edit, kategorikan, dan atur produkmu dari satu tempat."

Tampilkan Toko dengan Rapi

"Semua produkmu tersusun dalam satu halaman toko yang mudah dibagikan kepada customer."

Terhubung dengan Channel Penjualanmu

"Hubungkan produk dengan WhatsApp, marketplace, atau channel eksternal yang kamu gunakan."

Marketing Landing juga memiliki section:

"APA YANG KAMU DAPATKAN DI KATALOGA?"

yang menjelaskan value Kataloga termasuk mobile-friendly experience.

40. Main Customer Routes

Public/customer routes:

/
  
/{storeId}

/{storeId}/products/{productId}

/login

/register

Tidak membuat route khusus untuk:

Search
Filter
Sort
Marketplace
Share
WhatsApp
Announcement

Fitur tersebut merupakan interaction/state pada halaman yang sudah ada.

41. Authentication Context Preservation

Jika guest melakukan action yang membutuhkan authentication:

Customer memilih action.
Customer diarahkan ke Login/Register.
Context sebelumnya disimpan.
Setelah authentication selesai, customer kembali ke context sebelumnya.
Action dilanjutkan.

Contoh:

Store → Product → WhatsApp → Login → kembali ke Product → record interest → WhatsApp

Hal yang sama berlaku untuk Marketplace setelah channel dipilih.

42. UI / Product Principles

Kataloga menggunakan visual modern dengan:

Clean layout
Responsive desktop/mobile
Clear hierarchy
Consistent spacing
Reusable components
Tidak berlebihan secara visual

Approved Stitch screenshots menjadi visual reference utama untuk implementasi.

Stitch code digunakan sebagai implementation reference, bukan production code.

43. V1 Scope Boundaries

Fitur yang termasuk V1:

Customer
Marketing Landing
Store Landing
Product Detail
Search
Filter
Sort
WhatsApp
External Marketplace/Channel
Share
Login
Register
Seller
Dashboard
Products
Add Product
Edit Product
Categories
Customer Interest
My Store
Profile
Archive/Restore Product

Tidak termasuk V1:

Checkout
Payment
Order management
Stock quantity/inventory management
Advanced analytics
Advanced CRM
Share analytics
QR Code
Marketplace transaction integration
Product View tracking sebagai Customer Interest