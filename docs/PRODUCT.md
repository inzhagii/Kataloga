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

Satu account dapat:

- memiliki maksimal satu store pada V1,
- bertindak sebagai seller untuk store miliknya sendiri,
- menjadi customer ketika mengunjungi store lain.

Tidak ada sistem account "customer" / "seller" yang terpisah.

Tidak ada role-switching login flow.

Seller tetap menggunakan session/account yang sama ketika membuka storefront miliknya sendiri melalui:

`Seller Dashboard → Lihat Toko`

Lihat Toko membuka storefront customer-facing menggunakan session/account yang sudah authenticated.

Tidak diperlukan login kedua.

Ketika storefront dibuka dalam sesi authenticated:

- navbar storefront menampilkan icon user-circle untuk customer (bukan tombol Login/Daftar).
- "Lihat Toko" TIDAK menampilkan Login/Daftar.
- Mengakses store URL langsung (direct link) tanpa sesi berarti tampil sebagai guest.
- Seller boleh membuka WhatsApp/Marketplace pada storefront miliknya sendiri; interaksi tersebut tetap TIDAK dicatat sebagai Customer Interest (lihat Customer Interest).
- Tidak ada konsep role-switching "customer mode" baru; halaman yang sama dirender sesuai sesi auth yang ada.

### Authentication

Login menggunakan:

- Email atau phone number
- Password

Tidak menggunakan username.

Register menggunakan:

- Email, atau
- Phone

Field register:

- Email/phone
- Password
- Re-password
- Customer name bersifat optional

### Email Registration

Register menggunakan email:

- email verification wajib.

### Phone Registration

Register menggunakan phone:

- account dapat menjadi active tanpa registration verification.

Customer yang register menggunakan phone harus memiliki recovery email untuk password recovery / change-password flow.

### Change Password

Change-password flow (termasuk seller) membutuhkan input email terlebih dahulu.

Dokumen ini menetapkan business requirement saja.

Mekanisme teknis OTP/token tidak ditentukan di sini jika belum diputuskan di tempat lain / oleh backend.

Jika mekanisme verifikasi/recovery belum diputuskan backend, tandai sebagai needs backend confirmation.

---

# 3. Store Model

Store memiliki public URL:

`/{storeId}`

Contoh:

`/toko-komputer-jaya`

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

### Historical Store ID

Jika Store ID berubah, URL lama tetap berlaku:

```text
/arya
→ /toko-arya
```

Jika diubah lagi:

```text
/arya
→ /toko-arya
→ /toko-arya-bandung
```

Semua historical Store ID tetap menjadi valid alias yang menuju store saat ini (redirect).

Historical aliases adalah behavior yang dimiliki backend.

Frontend tidak memelihara alias mapping sendiri.

Detail backend (redirect/alias) belum diputuskan — needs backend confirmation.

### Create Store

Saat account belum memiliki store, seller dapat membuat store.

Field wajib:

- Store Name
- Store ID

Field lain tidak wajib pada Create Store.

Setelah store berhasil dibuat, seller **langsung diarahkan ke My Store** untuk melengkapi informasi toko.

Flow:

`Login/Register → Create Store → My Store`

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

### Required / Optional Store Profile

Required pada penyimpanan store profile:

- Store ID
- Store Logo
- Store Name
- Description / Bio
- Province
- City / Regency
- Operating Hours
- WhatsApp

Optional:

- Full Address
- External Sales Channels
- Announcement

Tidak diperlukan label "wajib" pada UI.

Validation harus mengkomunikasikan field yang wajib ketika user mencoba Save.

Create Store tetap hanya membutuhkan Store Name dan Store ID.

### Location

Location dipilih dengan urutan: Province dahulu, kemudian City/Regency yang scoped ke province tersebut.

City/Regency options dibatasi oleh Province yang dipilih.

Store Landing menampilkan lokasi dengan format kota terlebih dahulu, kemudian province, misalnya:

`Kota Bandung, Jawa Barat`

Full Address adalah opsional.

Full Address digunakan untuk membangun Google Maps search action.

Tidak ada requirement latitude/longitude.

---

# 5. Store Landing

Store Landing adalah storefront publik milik seller.

Route:

`/{storeId}`

Contoh:

`/toko-komputer-jaya`

Tidak terdapat public directory atau halaman yang menampilkan seluruh store Kataloga.

Customer mendapatkan Store Landing melalui link store yang dibagikan seller atau sumber lainnya.

---

# 6. Store Landing Navigation

### Guest

Navbar:

- Store Logo
- Store Name
- City/Province (compact)
- Login
- Daftar

### Logged-in Customer

Navbar:

- Store Logo
- Store Name
- City/Province (compact)
- Generic User Circle
- Profile controls

WhatsApp/Contact dan Marketplace BUKAN action navbar pada Store Landing maupun Product Detail.

Full Address BUKAN bagian dari storefront navbar.

WhatsApp, Marketplace, dan Full Address tetap tersedia pada area konten/footer storefront yang sesuai.

City/Province navbar:

- format: City dahulu, kemudian Province
- contoh: Kota Bandung, Jawa Barat
- compact
- natural truncation/wrapping jika diperlukan
- bukan card besar

Jangan menduplikasi Full Address secara tidak perlu pada area storefront yang menonjol.

Lokasi storefront di dekat operating hours tetap:

City, Province

Contoh:

Kota Bandung, Jawa Barat

Customer profile photo tidak digunakan pada navbar.

Tidak menggunakan hamburger/store-specific navigation tambahan pada desktop.

Mobile menggunakan navbar yang lebih compact.

### Storefront Footer

Footer storefront ditampilkan pada Store Landing dan Product Detail.

Bagian:

- Store Identity: Store Logo dan Store Name
- Contact: WhatsApp / Contact
- External Sales Channels: marketplace / external sales channels seller
- Address: Full Address jika tersedia
- Kataloga: Tentang Kataloga (hanya link/konten existing)

External Sales Channels tetap arbitrary:

```ts
type ExternalChannel = {
  name: string;
  url: string;
}
```

Tidak ada persisted channel ID pada model/API contract.

Tidak menggunakan field marketplace-specific seperti:

shopeeUrl
tokopediaUrl

WhatsApp dan Marketplace pada footer mengikuti aturan authentication + Customer Interest yang sama.

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

Jika store memiliki marketplace/external sales channels:

Desktop:

`[Hubungi via WhatsApp] [Marketplace] [Share]`

Mobile:

`[Hubungi via WhatsApp]`

`[Marketplace] [Share]`

Jika store tidak memiliki marketplace:

Desktop:

`[Hubungi via WhatsApp] [Share]`

Mobile:

`[Hubungi via WhatsApp] [Share]`

Mobile tanpa marketplace menggunakan rasio lebar 3:2:

`Hubungi via WhatsApp` = 3
`Share` = 2

Label action WhatsApp selalu `Hubungi via WhatsApp`, jangan disingkat menjadi "WhatsApp".

WhatsApp adalah primary contact action.

### WhatsApp

Customer dapat menghubungi seller melalui WhatsApp.

Label action:

`Hubungi via WhatsApp`

Jika guest:

`WhatsApp → Login/Register → kembali ke context sebelumnya → record Customer Interest → buka WhatsApp`

Jika authenticated customer:

`WhatsApp → record Customer Interest → buka WhatsApp`

Jika seller membuka store miliknya sendiri:

`WhatsApp → buka WhatsApp (TANPA Customer Interest)`

Activity owner di storefront miliknya sendiri TIDAK membuat Customer Interest.

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

Jika seller membuka store miliknya sendiri:

`Marketplace → pilih channel → buka URL (TANPA Customer Interest)`

Activity owner di storefront miliknya sendiri TIDAK membuat Customer Interest.

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

Store memiliki satu object announcement:

```ts
type Announcement = {
  title: string;
  message: string;
  is_enabled: boolean;
}
```

Bukan array.

Jika announcement disabled:

- data announcement tetap tersimpan,
- customer storefront tidak merender announcement.

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
- Product Unggulan

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

Setiap category memiliki "Lihat Produk" yang mengarah ke:

`/seller/products?category=...`

Category product filtering menggunakan URL query sebagai source of truth.

Category deletion tidak diperbolehkan jika masih digunakan oleh product.

Kategori Utama yang masih memiliki child tidak boleh dihapus.

Tidak ada cascade delete.

Hitung penggunaan product kategori:

Kategori Utama count mencakup seluruh product di descendant-nya (Sub Kategori).

Contoh:

```
Computer (5)
└── Laptop (3)
└── Desktop (2)
```

Computer = aggregate usage 5 product.

---

# 15. Brand

Brand bersifat optional.

Brand terpisah dari Category.

Brand tidak ditampilkan pada Product Card.

Brand ditampilkan pada Product Detail.

### Brand Management

Brand Management adalah halaman seller untuk mengelola daftar brand store.

Layout:

- Desktop: card grid 4 kolom × 4 baris
- Mobile: card grid 2 kolom

Setiap brand card berisi:

- Nama brand
- Product usage count
- Edit
- Lihat Produk

Tidak perlu decorative icon per brand.

"Lihat Produk" menerapkan filter brand pada `/seller/products`.

### Hapus Brand

Brand dengan 0 product usage boleh dihapus.

Brand yang masih digunakan oleh product tidak boleh dihapus.

Tidak ada cascade delete ke product.

### Tambah Brand

Seller dapat membuat brand baru langsung dari Add/Edit Product.

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

Kataloga V1 tidak menggunakan stock quantity.

Tidak ada stock count seperti:

`Stock: 10`

### Sold Out Auto Archive

Auto Archive adalah setting level store, bukan pilihan per-product.

UI Auto Archive terletak pada halaman Archive (`/seller/products/archived`), BUKAN pada My Store.

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

Seller tidak boleh memilih nilai lain selain daftar tersebut.

Threshold dihitung dari durasi waktu produk menjadi SOLD_OUT.

Perubahan setting diterapkan terhadap durasi SOLD_OUT yang sudah berjalan.

Jika SOLD_OUT melewati threshold auto archive:

`SOLD_OUT → ARCHIVED`

Product masa-ojak SOLD_OUT otomatis menjadi ARCHIVED oleh backend dan tidak tampil di katalog.

Jika seller mereactivate sebelum melewati threshold:

`SOLD_OUT → PUBLISHED`

SOLD_OUT yang masih dalam jendela auto archive tetap tampil di katalog aktif dengan indikasi Sold Out.

Frontend mendeskripsikan behavior ini.

Mekanisme scheduling/mekanisme penerapan auto archive di backend tidak ditentukan di dokumen ini — needs backend confirmation.

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

SOLD_OUT dapat tetap tampil pada katalog/storefront sesuai jendela auto archive.

Reactivation dari SOLD_OUT menghasilkan:

`SOLD_OUT → PUBLISHED`

Label aksi seller untuk reaktivasi SOLD_OUT adalah "Publish Kembali".

Reaktivasi ke PUBLISHED TIDAK otomatis mengembalikan status Product Unggulan.

SOLD_OUT adalah lifecycle status, bukan availability field.

SOLD_OUT tidak menampilkan "Always Sold Out permanen" di katalog.

### Archived

Product tidak ditampilkan pada Store Landing.

Archive terpisah dari Active Products.

Archiving otomatis menghapus status Product Unggulan.

### Restore

Restore dari Archived selalu menghasilkan:

`ARCHIVED → DRAFT`

Bukan Published.

### Lifecycle

`DRAFT → PUBLISHED`

`PUBLISHED → SOLD_OUT`

`SOLD_OUT → PUBLISHED`

`PUBLISHED → ARCHIVED`

`DRAFT → ARCHIVED`

`ARCHIVED → DRAFT`

Tidak ada `SOLD_OUT → DRAFT`.

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
  - Restore tersedia dari menu aksi pada list, mengubah `ARCHIVED → DRAFT`.

### Product Timestamps

Backend-managed timestamps:

- created_at
- updated_at
- published_at
- sold_out_at
- archived_at

`sold_out_until` tidak lagi menjadi field per-product; batas auto archive diturunkan dari setting store (Auto Archive) dan durasi SOLD_OUT yang sudah berjalan.

Frontend display menggunakan date-only formatting:

`12.09.2026`

Date dan waktu:

`12.09.2026 · 18:02`

Tanpa weekday.

Jangan berimplikasi bahwa backend harus membuang presisi timestamp.

---

# 21. Active Products

"Active Products" adalah konsep statistik/dashboard, bukan status database.

Artinya "Active Products" adalah label dashboard/catalog yang merepresentasikan produk PUBLISHED, bukan lifecycle status tambahan.

Active Products terdiri dari:

- Published

Jadi:

`Active Products = PUBLISHED`

Produk SOLD OUT tetap dapat dilihat pelanggan.

Draft dihitung secara terpisah.

Archived dihitung secara terpisah.

SOLD_OUT tidak termasuk Active Products.

### Public Catalog Visibility

"Active Products" adalah metrik dashboard/catalog; visibilitas katalog publik dibedakan secara terpisah:

- PUBLISHED → tampil publik.
- SOLD_OUT yang masih dalam jendela auto archive → tetap tampil publik.
- ARCHIVED → tidak tampil publik.
- DRAFT → tidak tampil publik.

---

# 22. Product Required Fields

Untuk Publish Product:

Required:

- Product Name
- Product Photo (1-5)
- Category
- Product Details
- Description
- Condition
- Price

Optional:

- Brand
- External Product Links
- Product Unggulan

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

24. Product Unggulan

Product Unggulan adalah properti boolean terpisah di product, BUKAN lifecycle status.

Maksimum 10 Product Unggulan per store.

Product Unggulan ditampilkan pada section:

Product Unggulan

di Store Landing.

Ordering Product Unggulan:

- Featured Published tampil lebih dahulu daripada Published lainnya.

Product yang berubah menjadi SOLD_OUT otomatis kehilangan status Product Unggulan (`is_featured = false`).

Reaktivasi SOLD_OUT ke PUBLISHED TIDAK otomatis mengembalikan status Product Unggulan.

Feature dapat diaktifkan/dinonaktifkan hanya pada product status PUBLISHED.

DRAFT tidak pernah Product Unggulan.

Product ARCHIVED tidak pernah Product Unggulan.

Archiving otomatis menghapus status Product Unggulan.

Product Unggulan:

Horizontal scrolling
Tidak menggunakan auto-slide
Desktop dapat menggunakan subtle navigation arrows
Mobile menggunakan swipe
25. Product Card

Product information (urutan):

1. Product image
2. Category
3. Product name
4. Price
5. Condition
6. Product Unggulan indicator (ketika featured)

Price harus bold dan lebih menonjol dibandingkan nama produk.

Ditampilkan tanpa:

- Brand
- SKU
- Availability

Conditional:

- SOLD OUT indicator untuk produk SOLD_OUT yang masih dalam jendela auto archive

SOLD OUT card menggunakan visual state GRAY yang jelas berbeda dari card aktif, lebih dari sekadar teks "Sold Out". Sold Out BUKAN state merah/error.

Actions (terpisah dari urutan informasi; posisi mengikuti layout yang sudah disetujui):

- Lihat Detail
- Share icon

Tidak menampilkan:

WhatsApp
Marketplace
Contact Seller

Product card memiliki:

Desktop: 3 columns
Mobile: 2 columns

Katalog aktif hanya berisi produk PUBLISHED dan SOLD_OUT yang masih dalam jendela auto archive.

Produk DRAFT dan ARCHIVED tidak termasuk katalog aktif.

SOLD OUT indicator hanya tampil untuk produk SOLD_OUT yang masih dalam jendela auto archive.

26. Product Listing

Route:

`/{storeId}/products`

Product Listing menyediakan:

Search
Category filter
Filter
Sort
Product grid

Menggunakan reusable:

ProductCard
ProductGrid

### Ordering

Urutan katalog/listing customer:

Featured Published
→ Published lebih baru
→ Published lebih lama
→ Sold Out

Search/filter diterapkan pada current store/result set terlebih dahulu, kemudian ordering diterapkan.

Sold Out yang masih dalam jendela auto archive dapat muncul pada listing results tetapi diurutkan di bawah Published aktif.

Archived bukan public catalog product.

### Product Search

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

Category bersifat dua level:

State awal: Kategori Utama.

Ketika customer memilih Kategori Utama:

→ menampilkan Sub Kategori milik Kategori Utama tersebut.

Contoh:

Kategori Utama
- Elektronik
- Fashion

Customer memilih:

Elektronik

Maka ditampilkan:

Sub Kategori
- Laptop
- Smartphone
- Aksesoris

Hanya Sub Kategori milik Kategori Utama yang dipilih yang ditampilkan.

Memilih Kategori Utama mencakup produk pada descendant categories-nya (Sub Kategori).

Terminology user-facing:

Kategori
Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Model teknis tetap dapat menggunakan:

categories.parent_id

Aturan yang dipertahankan:

- maksimal dua level
- root = Kategori Utama
- child = Sub Kategori
- child tidak memiliki child lain
- satu product memiliki tepat satu category
- category scoped ke store

Tidak ada filter:

Price
Attribute

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

/{storeId}/product/{productId}/{slug}

Contoh:

/toko-komputer-jaya/product/20/laptop-asus-rog

productId adalah public numeric database-style ID.

slug adalah URL slug dari Product Name.

Desktop:

Gallery di kiri
Product information di kanan
Formulir info panel scroll di dalam area tersebut
Footer di luar area scroll

Mobile:

Gallery (images menggunakan swipe-only carousel/slider)
Product information
Price
Actions
Product details
Description

Hierarchy:

Brand (jika tersedia) dengan format eksplisit "Brand : X"
Product Unggulan indicator (jika featured)
Product Name
Price (bold)
Category / Condition (bersebelahan, di bawah Price)
Actions
Product Details
Description

Product Detail mengandung:

- Product Name
- Brand (jika tersedia)
- Category
- Price
- Product Unggulan indicator
- Condition
- Product Details
- Description
- Actions

Featured indicator terpisah secara visual dari Brand.

Brand ditampilkan secara eksplisit pada Product Detail. Contoh tampilan penulisan nama brand diikuti colon:

`Brand : ASUS`

Bagian External Product Links TIDAK ditampilkan pada Product Detail.

External Product Links tetap ada sebagai field data product (form product dan API), tetapi tidak dirender di halaman Product Detail customer-facing.

Tidak ada tampilan availability (Tersedia / Sold Out) pada Product Detail.

Tidak menggunakan "Stok Siap Kirim".

### Sold Out pada Product Detail

Jika product SOLD_OUT (masih dalam jendela auto archive):

- indikasi "Sold Out" yang jelas,
- product tetap dapat dilihat jika masih dalam jendela auto archive,
- WhatsApp tidak tersedia,
- Marketplace tidak tersedia,
- Share tetap tersedia.

Tidak ada section availability.

30. Product Detail Actions

Actions:

WhatsApp
Marketplace
Share

Primary action adalah "Hubungi via WhatsApp".

Marketplace dan Share tersedia sebagai secondary actions.

Marketplace hanya ditampilkan jika store memiliki setidaknya satu external channel aktif.

Pada mobile, "Hubungi via WhatsApp" tetap menjadi primary action.

WhatsApp dan Marketplace mengikuti authentication + Customer Interest rules.

Share tidak membutuhkan authentication dan tidak membuat Customer Interest.

Untuk product SOLD_OUT:

- WhatsApp tidak tersedia,
- Marketplace tidak tersedia,
- Share tetap tersedia.

Navbar Product Detail tidak mengandung:

- WhatsApp / Contact
- Marketplace

Keputusan tersebut hanya menyangkut penempatan navbar.

WhatsApp, Marketplace, dan Share tetap tersedia pada area action Product Detail.

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
Store Visit
Category interaction
Generic browsing

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

Customer identity display:

- Email account → email
- Phone account → phone

Total Interest berarti total record interaksi, bukan jumlah customer unique.

### Self-Store Exclusion (Owner Activity)

Ketika seller membuka store miliknya sendiri:

- seller tetap authenticated menggunakan account yang sama,
- setiap activity owner di storefront miliknya sendiri TIDAK membuat Customer Interest.

Contoh:

- seller klik WhatsApp store sendiri → TIDAK ada Customer Interest
- seller klik Marketplace store sendiri → TIDAK ada Customer Interest
- seller buka Product Detail store sendiri → TIDAK ada Customer Interest
- seller share store/product sendiri → TIDAK ada Customer Interest

Frontend harus menghindari pencatatan activity owner.

Backend diharapkan juga menegakkan rule ownership.

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

### Layout Customer Interest

Channel cards berisi WhatsApp dan channel external yang dikonfigurasi seller.

Jumlah channel tidak hardcoded; mengikuti konfigurasi store saat ini.

Card hierarchy per channel:

1. Channel name di atas
2. Icon channel rata kanan (align right)
3. Activity count besar dan bold sebagai focal point
4. Teks pendukung "aktivitas minat" (contoh total, dalam bahasa "aktivitas minat", bukan "7 Minat")

Desktop: card-channel berbagi lebar yang tersedia secara merata (contoh 3 card side-by-side) tanpa fixed width memaksa.

Mobile: channel cards boleh horizontal scroll.

Posisi Total Interest:

- Jika channel < 4: Total Interest dapat berada pada baris yang sama dengan channel cards.
- Jika channel ≥ 4: Total Interest berada di sebelah heading.

Search dan Filter berada di bawah channel cards.

Filter:

- Activity type (WhatsApp / Marketplace)
- Date TANGGAL TUNGGAL (single date), bukan date range.

Date display:

12.09.2026

Tanpa weekday.

Context field:

- Store Landing
- Product Detail

Membedakan aktivitas yang berasal dari Store Landing dan Product Detail.

Records tetap tampil meskipun channel dihapus dari konfigurasi store.

32. Seller Dashboard

Dashboard berfungsi sebagai pusat informasi dan shortcut seller.

Urutan section:

1. Catalog Overview
2. Quick Actions
3. Customer Interest + Recent Activity

Desktop concept:

Catalog Overview

Quick Actions

Customer Interest        Recent Activity

Catalog Overview

Menampilkan dalam SATU BARIS horizontal:

Active    Draft    Sold Out    Archive

Active Products = Published.

Produk SOLD OUT tetap dapat dilihat pelanggan.

Draft dihitung terpisah.

Setiap kartu Catalog Overview menggunakan icon tertentu sebagai visual anchor.

Customer Interest

Menampilkan ringkasan WhatsApp dan Marketplace activity.

Dashboard Customer Interest dan dedicated Customer Interest menggunakan halaman Customer Interest yang sama.

Recent Activity

Menampilkan:

Product Published
Product Edited
Product Sold Out
Product Reactivated
Product Archived
Product Restored
Store Updated

Dashboard menampilkan 4 aktivitas terbaru (newest first).

Tidak menampilkan:

WhatsApp Click
Marketplace Click
Product View
Share
Login/logout
Category create/edit/delete

Customer Interest dan Recent Activity ditampilkan berdampingan (side-by-side) pada desktop.

Setiap section memiliki "Lihat Semua" di kanan atas heading-nya.

Dashboard menampilkan "Lihat Semua".

Lihat Semua membuka route:

/seller/activities

Halaman tersebut adalah list Recent Activity lengkap dan menyediakan "Kembali" ke Dashboard.

Halaman /seller/activities menyediakan filter:

- activity type
- date TANGGAL TUNGGAL (single date), bukan date range

Pemilihan tanggal menggunakan date picker, bukan input teks manual.

Date display:

12.09.2026

Datetime display:

12.09.2026 · 18:02

Tanpa weekday.

Quick Actions

Digunakan sebagai shortcut untuk pekerjaan seller yang paling sering digunakan.

Termasuk:

Lihat Toko

Lihat Toko membuka storefront customer-facing store milik sendiri menggunakan session/account yang sama.

Tidak diperlukan login kedua.

Activity owner di store miliknya sendiri TIDAK membuat Customer Interest.

33. Seller Products

Seller dapat:

Melihat products
Search products
Filter sesuai kebutuhan UI
Add Product
Edit Product
Archive Product
Restore Product
Mengatur Product Unggulan
Melihat status (DRAFT / PUBLISHED / SOLD_OUT / ARCHIVED)

Tidak ada Sort pada halaman Seller Products.

Status tab "Active" pada halaman Seller Products menggunakan label dashboard (Active Products) dan berarti produk PUBLISHED, bukan status lifecycle baru.

Status SOLD_OUT merupakan area seller management terpisah dari katalog aktif.

Auto archive SOLD_OUT mengikuti setting store (Auto Archive), bukan pilihan per-product.

Reactivation dari SOLD_OUT:

SOLD_OUT → PUBLISHED

langsung ke PUBLISHED.

Layout Seller Products:

Desktop:

- Baris atas: Judul halaman + tombol Add Product di kanan.
- Baris kedua: Search dan Filter sejajar horizontal.
- Status tab: Active | Draft | Sold Out.
- Archive adalah aksi terpisah pada baris yang sama dengan tindakan product.

Mobile:

- Search penuh lebar terlebih dahulu.
- Lalu Filter dan tombol Archive.
- Lalu status tab: Active | Draft | Sold Out.

Seller management product ordering:

Product Unggulan terlebih dahulu, kemudian produk yang lebih baru sebelum produk yang lebih lama.

Routes konseptual:

/seller/products
/seller/products/new
/seller/products/:productId/edit
/seller/products/archived

Archived Products menyediakan action:

Kembali

Kembali → /seller/products

Tidak membuat route baru.

Tindakan per product pada list Archived:

- Detail Product → membuka tampilan read-only product archived.
- Restore → tersedia dari menu aksi pada list, mengubah ARCHIVED → DRAFT.

Halaman Archive TIDAK memiliki aksi "Lihat Product".

Archive Detail Product:

- tampilan read-only product yang menampilkan seluruh informasi product, termasuk Product Catalog Settings, gambar, Brand, Category, Condition, Price, Description, status Product Unggulan, dan status (ARCHIVED).
- tidak ada field editable, tidak ada tombol Save/Edit/Restore di dalam tampilan ini.
- hanya menyediakan navigasi Kembali (ke halaman Archive).
- restore hanya dilakukan dari menu aksi pada list Archived.

Auto Archive:

- setting level store yang UI-nya terletak pada halaman Archive.
- nilai: Tidak ada (default) / 1 hari / 7 hari / 30 hari / 90 hari / 180 hari / 365 hari / Never.
- perubahan diterapkan dari popover pada halaman Archive, bukan pada My Store.

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
Product Unggulan

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

Actions Edit Product hanya:

Batal
Simpan

Tidak ada:

- Publish Product
- Save Draft

di dalam Edit Product.

Product Edited activity hanya dibuat ketika:

- tombol Simpan diklik,
- dan perubahan berhasil dipersist.

Tidak ada activity untuk:

- membuka form edit,
- perubahan belum disimpan,
- Batal/Cancel,
- validation failure,
- request API gagal.

Conceptual implementation:

<ProductForm mode="create" />
<ProductForm mode="edit" />
36. Seller Navigation

Desktop menggunakan reusable Seller Sidebar.

Menu utama:

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

Tidak ada item "Profile" terpisah pada sidebar utama.

Tidak ada item "Archive" pada sidebar desktop.

User/Account Card pada bagian bawah sidebar adalah akses ke halaman Profile.

Route tetap:

/seller/account

Logout berada langsung di bawah account card.

Profile page order:

1. Informasi Akun Kamu
2. Ringkasan Toko

Ringkasan Toko tetap ada dan tidak diduplikasi.

Mobile menggunakan reusable Bottom Navigation dengan:

Dashboard
Products
Customer Interest

More

More berisi:

Recent Activity
My Store
Categories
Profile
Logout

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

Store Link ditampilkan di bawah Store ID.

Actions Store Link:

Salin
Bagikan

Tidak ada QR Code.

Jika Store ID berubah, Store Link ikut berubah.

Store ID lama tetap menjadi alias yang redirect ke Store ID saat ini (behavior backend-owned).

Tidak membuat halaman onboarding toko terpisah.

My Store menyediakan setting:

Auto Archive TIDAK berada di My Store. Auto Archive terletak pada halaman Archive (lihat Sold Out Auto Archive).

### Operating Hours

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

### Draft & Navigation Confirmation

Perubahan pada My Store bersifat draft sampai tombol Simpan diklik.

Jika ada perubahan yang belum disimpan dan seller mencoba navigasi keluar, tampilkan konfirmasi sebelum keluar.

### Mobile My Store Title

Pada mobile, judul halaman My Store ditampilkan centered.

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

/{storeId}/products

/{storeId}/product/{productId}/{slug}

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

Search, filter, dan sort merupakan state/interaction di dalam halaman Product Listing yang sudah ada.

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
Product Listing
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
Sold Out (lifecycle + auto archive + reactivation)

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