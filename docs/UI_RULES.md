# Kataloga — UI Rules

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan aturan UI/UX visual Kataloga untuk implementasi frontend.

Sumber acuan:

1. `reference/screenshots/` → visual source of truth
2. `PRODUCT.md` → product requirements
3. `UX-FLOW.md` → UX behavior
4. `ROUTES.md` → routing
5. `reference/stitch-code/` → implementation reference

Screenshot final memiliki prioritas tertinggi untuk visual implementation.

Stitch code hanya digunakan sebagai referensi implementasi, bukan production code.

---

# 2. General Design Direction

Kataloga menggunakan visual direction:

- modern
- clean
- professional
- simple
- contemporary
- trustworthy
- responsive
- tidak terlalu ramai
- tidak menggunakan visual yang berlebihan

Primary visual direction:

```text
Blue
White
Black / Dark Neutral
Neutral Gray

UI harus memiliki hierarchy yang jelas dan whitespace yang cukup.

Hindari:

terlalu banyak warna
gradient berlebihan
shadow berlebihan
border berlebihan
decorative element yang tidak memiliki fungsi
layout terlalu padat
animasi yang mengganggu
3. Visual Source of Truth

Folder:

reference/screenshots/
├── public/
├── customer/
└── seller/

Screenshot final pada folder tersebut menjadi referensi utama untuk:

spacing
typography
layout
component placement
button hierarchy
card structure
responsive behavior
navigation
modal
bottom sheet
sidebar
bottom navigation

Jika implementasi berbeda dengan screenshot:

cek screenshot
cek requirement
cek UX flow
jangan langsung mengubah requirement
4. Responsive Design

Kataloga harus responsive.

Minimal mendukung:

Desktop
Mobile

Responsive bukan sekadar mengecilkan desktop layout.

Desktop dan mobile dapat menggunakan:

different navigation
different component arrangement
different interaction pattern

Tetapi business logic harus tetap sama.

5. Desktop Layout

Desktop seller menggunakan:

┌──────────────┬──────────────────────────┐
│              │                          │
│   Sidebar    │       Main Content       │
│              │                          │
│              │                          │
└──────────────┴──────────────────────────┘

Sidebar bersifat reusable.

Gunakan:

SellerSidebar

Jangan membuat sidebar berbeda untuk setiap halaman seller.

### Seller Visual System

Visual seller mengikuti gaya clean, modern, terstruktur:

- rounded cards
- subtle borders/shadows
- typography yang kuat
- whitespace yang cukup
- primary action berwarna blue/primary
- iconography konsisten

Icons berperan sebagai visual anchor untuk:

- Dashboard summary (Catalog Overview cards)
- Quick Actions
- Customer Interest channel cards dan activity indicator
- Recent Activity
- My Store sections
- Categories
- Account/Security

Brand cards tidak memerlukan decorative icon.

6. Mobile Layout

Mobile seller menggunakan:

┌─────────────────────────┐
│                         │
│      Main Content       │
│                         │
│                         │
├─────────────────────────┤
│   Bottom Navigation     │
└─────────────────────────┘

Navigation:

BottomNavigation
MoreMenu / MoreSheet

Bottom Navigation berisi:

Dashboard
Products
Customer Interest

Fitur lainnya berada di More:

Recent Activity
My Store
Categories
Profile
Logout

7. Seller Navigation

Desktop:

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

User/Account Card pada sidebar adalah akses ke halaman Profile (/seller/account).

Logout berada langsung di bawah account card.

Mobile:

Bottom Navigation
├── Dashboard
├── Products
└── Customer Interest

More
├── Recent Activity
├── My Store
├── Categories
├── Profile
└── Logout

Semua seller page harus menggunakan navigation component yang sama.

Pada mobile, judul halaman Profile ditampilkan centered.

8. Public Marketing Navbar

Marketing landing:

Logo
Navigation / relevant links
Login
Daftar

Visual harus clean dan tidak terlalu banyak navigation item.

Marketing landing berbeda dari storefront seller.

9. Storefront Navbar
Guest
[Store Logo] [Store Name] [City/Province] ... [Login] [Daftar]
Logged-in
[Store Logo] [Store Name] [City/Province] ... [User Circle]

Navbar storefront hanya menampilkan:

Store Logo
Store Name
City/Province

City/Province compact dengan natural truncation/wrapping, bukan card besar.

Tidak menempatkan di dalam navbar storefront:

WhatsApp
Marketplace
Full Address

Full Address tidak boleh diduplikasi secara tidak perlu pada area storefront yang menonjol.

WhatsApp, Marketplace, dan Full Address tetap tersedia pada area konten/footer storefront yang sesuai.

Lokasi storefront di dekat operating hours tetap:

City, Province

Guest tidak menampilkan generic profile icon.

Logged-in customer menggunakan generic User Circle.

Customer tidak menggunakan uploaded profile photo pada storefront UI.

10. Store Header

Store header menampilkan:

Store Logo
Store Name
Verification Badge
Description / Bio
City, Province
Operating Hours

City dan Province ditampilkan dengan urutan:

City dahulu, kemudian Province.

Contoh:

Kota Bandung, Jawa Barat

Store ID tidak ditampilkan secara visual.

11. Store Header — Mobile

Urutan:

Store Logo
      ↓
Store Name
      ↓
Store Description
      ↓
Address + Open Hours
      ↓
WhatsApp
      ↓
Marketplace + Share

Mobile:

Address       Open Hours

berada side-by-side.

Hubungi via WhatsApp:

[       Hubungi via WhatsApp       ]

full width.

Marketplace dan Share:

[ Marketplace ] [ Share ]

side-by-side.

12. Balanced Layout

Pada layout dengan dua sisi atau dua section:

Left Section
Right Section

tinggi visual harus terasa seimbang.

Jika salah satu content lebih panjang:

gunakan expand/collapse
gunakan scroll jika diperlukan
gunakan controlled content height

Jangan memaksa layout menjadi tidak seimbang hanya karena salah satu content lebih panjang.

13. Store Action Hierarchy

Label action WhatsApp selalu:

Hubungi via WhatsApp

Dengan Marketplace:

Desktop:

[ Hubungi via WhatsApp ] [ Marketplace ] [ Share ]

Mobile:

[          Hubungi via WhatsApp          ]

[ Marketplace ] [   Share   ]

Tanpa Marketplace (seller tidak mengkonfigurasi external channel):

Desktop:

[ Hubungi via WhatsApp ] [ Share ]

Mobile:

[     Hubungi via WhatsApp (proporsi lebih besar, 3:2)     ] [ Share ]

WhatsApp merupakan primary contact action.

Marketplace merupakan secondary external-channel action.

Share merupakan utility action.

WhatsApp button menggunakan:

- icon WhatsApp yang recognizable
- warna hijau WhatsApp yang lebih gelap/refined

Jangan menggunakan hijau neon yang terlalu terang.

Warna hijau WhatsApp hanya untuk action WhatsApp aktual.

Jangan menerapkan warna hijau WhatsApp pada:

- success state generic
- button yang tidak related
- aksi telepon yang tidak membuka WhatsApp
- UI yang tidak berhubungan

14. Announcement

Announcement menggunakan compact:

banner
card
expandable section

Satu active announcement pada satu waktu.

Announcement dapat berisi beberapa informasi.

Tidak menggunakan carousel.

15. Product Section

Section title:

Product Unggulan

Product Unggulan ditampilkan dalam horizontal scrolling area.

Desktop:

mouse/trackpad scrolling
subtle navigation arrows jika diperlukan

Mobile:

swipe horizontal

Tidak menggunakan auto-slide.

Tidak menggunakan automatic rotation.

16. Product Card

Struktur:

┌─────────────────────┐
│   Image             │
│   Category          │
│                     │
│   Product Name      │
│   Price (emphasis)  │
│   Condition Badge   │
│   [Lihat Detail] ↗  │
└─────────────────────┘

Product information (urutan):

1. Product Image
2. Category
3. Product Name
4. Price
5. Condition
6. Product Unggulan indicator (jika featured)

Price merupakan elemen yang menonjol dibandingkan nama produk.

Penempatan Price mengikuti reference screenshots.

Ditampilkan tanpa:

Brand
SKU
Availability

Conditional:

SOLD OUT indicator (jika product SOLD_OUT yang masih dalam jendela auto archive)

Actions (terpisah dari urutan informasi; posisi mengikuti layout yang sudah disetujui):

- Lihat Detail
- Share icon

Tidak menampilkan:

WhatsApp
Marketplace
Contact Seller

Product Card adalah component shared:

- dipakai pada featured section
- dipakai pada Product Listing page
- reuse, jangan duplicate markup

17. Product Card — Condition

Condition badge:

NEW
SECOND

Badge berada pada area image.

### Product Card — Product Unggulan

Product Unggulan ditandai dengan indicator pada card.

Product Unggulan indicator terpisah secara visual dari Condition badge.

Tidak ada duplicate indicator untuk non-featured product.

18. Product Card — Sold Out

Catalog aktif menampilkan:

PUBLISHED
SOLD_OUT yang masih dalam jendela auto archive

Produk SOLD_OUT yang masih dalam jendela auto archive ditampilkan dengan SOLD OUT indicator yang jelas.

SOLD OUT card menggunakan visual state GRAY yang jelas berbeda dari card aktif, lebih dari sekadar teks "Sold Out". Sold Out BUKAN state merah/error.

Auto archive adalah setting store-level (nilai: Tidak ada default / 1 hari / 7 hari / 30 hari / 90 hari / 180 hari / 365 hari / Never), bukan pilihan durasi per-product.

SOLD_OUT yang melewati threshold auto archive menjadi ARCHIVED dan tidak tampil di katalog.

Produk SOLD_OUT tampil di urutan paling bawah dibandingkan produk PUBLISHED (semua kondisi sorting).

19. Product Grid

Menuangkan listing produk (katalog) pada:

Store Landing featured section
Product Listing page

Desktop:

3 columns

Mobile:

2 columns

Grid harus tetap readable pada mobile.

### Product Listing Page

Product Listing page (= /{storeId}/products) merupakan halaman listing utama.

Menyediakan:

Search
Category filter
Filter
Sort
Product grid

Menggunakan reusable ProductCard dan ProductGrid.

Ordering produk:

Featured Published
→ Published lebih baru
→ Published lebih lama
→ Sold Out (di bawah semua Published)

Category filter mencakup descendant Sub Kategori.

Search dapat menggunakan URL query parameter jika dibutuhkan.

Column count mengikuti grid rules desktop/mobile di atas.

20. Search UI

Search hanya mencari dalam current store.

Search harus selalu mudah ditemukan pada Product Listing.

Search state tidak menjadi page baru.

Search dapat menggunakan URL query parameter jika dibutuhkan.

Example:

/{storeId}/products?search=laptop
21. Filter UI

Desktop:

Filter

Filter menampilkan:

Category
Condition
  ├── New
  └── Second

Category bersifat dua level:

Kategori Utama → Sub Kategori

State awal: Kategori Utama.

Ketika Kategori Utama dipilih:

→ tampilkan Sub Kategori milik Kategori Utama tersebut.

Contoh:

Kategori Utama: Elektronik

→ Sub Kategori: Laptop, Smartphone, Aksesoris

Hanya Sub Kategori milik Kategori Utama yang dipilih yang ditampilkan.

Terminology user-facing:

Kategori
Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Harus ada:

Apply Filter

Mobile menggunakan:

Filter Button
     ↓
Bottom Sheet

Tidak menyediakan filter:

Price
Attribute
22. Sort UI

Sort options:

Relevance
Newest
Price Low → High
Price High → Low

Desktop dapat menggunakan:

Dropdown / Popover

Mobile dapat menggunakan:

Bottom Sheet

Tidak ada availability ordering/grouping.

Tidak ada availability sort option.

23. Marketplace UI

Marketplace tidak menggunakan icon/logo.

Channel hanya ditampilkan berdasarkan konfigurasi seller.

Example:

Marketplace
├── Shopee
├── Tokopedia
└── Website

Desktop:

Popover / Dropdown

Mobile:

Bottom Sheet

Tidak membuat marketplace page.

24. Share UI

Share tidak membutuhkan login.

Product share:

Product Name
Product URL

Store share:

Store Name
Store URL

Tidak menggunakan QR Code.

Tidak menambahkan QR-related UI.

Share tidak membuat Customer Interest.

25. Product Detail Layout
Desktop
┌─────────────────────┬──────────────────────┐
│                     │ Brand (jika ada)     │
│                     │ Product Unggulan     │
│ Product Gallery     │ Product Name         │
│ (fixed)             │ Price (bold)         │
│                     │ Category / Condition │
│                     │ Actions              │
│                     │ Details              │
│                     │ Description          │
└─────────────────────┴──────────────────────┘

Gallery berada di kiri dan fixed.

Product information berada di kanan; panel info scroll di dalam area tersebut.

Footer berada di luar area scroll.

Brand ditampilkan secara eksplisit pada Product Detail. Contoh tampilan penulisan nama brand diikuti colon:

`Brand : ASUS`

Bagian External Product Links TIDAK ditampilkan pada Product Detail.

External Product Links tetap ada sebagai field data product (form product dan API), tetapi tidak dirender di halaman Product Detail customer-facing.

26. Product Detail — Mobile

Urutan:

Gallery (swipe-only carousel/slider)
   ↓
Brand (jika tersedia)
   ↓
Product Unggulan indicator (jika featured)
   ↓
Product Name
   ↓
Price (bold)
   ↓
Category / Condition
   ↓
Actions
   ↓
Product Details
   ↓
Description

Long description menggunakan expand/collapse jika diperlukan.

27. Product Detail Hierarchy

Primary:

Brand (jika tersedia) dengan format eksplisit "Brand : X"
Product Unggulan indicator (jika featured)
Product Name
Price (bold)

Category / Condition tampil bersebelahan di bawah Price.

Secondary:

Product Details
Description

Third level:

Actions

Product Unggulan indicator terpisah secara visual dari Brand.

### Product Detail Actions

Primary action adalah "Hubungi via WhatsApp".

Marketplace dan Share tersedia sebagai secondary actions.

Marketplace hanya ditampilkan jika store memiliki setidaknya satu external channel aktif.

Pada mobile, "Hubungi via WhatsApp" tetap menjadi primary action.

28. Sold Out — Product Status

Sold Out adalah product lifecycle status, bukan availability field.

Tidak ada field product availability pada UI V1.

Jangan gunakan:

Tersedia / Sold Out

sebagai availability display pada product.

Jangan gunakan:

Stok Siap Kirim

karena Kataloga tidak menggunakan stock quantity pada V1.

### Product Detail — Sold Out

Produk SOLD_OUT yang masih dalam jendela auto archive tetap dapat dibuka di Product Detail.

Menampilkan:

indikasi "Sold Out" yang jelas
WhatsApp tidak tersedia
Marketplace tidak tersedia
Share tetap tersedia

Share product SOLD_OUT tetap menggunakan:

/{storeId}/product/{productId}/{slug}

Tidak ada section availability.

29. Seller Dashboard

Urutan section:

1. Catalog Overview
2. Quick Actions
3. Customer Interest + Recent Activity

Desktop concept:

Catalog Overview

Quick Actions

Customer Interest        Recent Activity

Dashboard bukan replacement untuk dedicated management pages.

30. Catalog Overview

Dashboard menampilkan SATU BARIS horizontal:

Active    Draft    Sold Out    Archive

Setiap kartu Catalog Overview menggunakan icon tertentu sebagai visual anchor.

Active Products berarti:

Published

Produk SOLD OUT tetap dapat dilihat pelanggan.
Draft dihitung terpisah.
Archived terpisah.

Visual:

Card tetap berwarna putih.

Status colors adalah subtle accents/tints:

Active → subtle blue accent/tint
Draft → subtle amber/yellow accent/tint
Sold Out → subtle neutral/gray accent/tint
Archived → subtle neutral/gray accent/tint

Rule:

"Status colors are subtle accents/tints while the main card background remains white."

Jangan menggunakan full-card strong blue/yellow/red/gray background.

Sold Out tidak pernah menggunakan warna merah/error.

Click behavior:

Active Products
    ↓
/seller/products

Archived Products
    ↓
/seller/products/archived
31. Customer Interest Dashboard

Customer Interest hanya berasal dari:

WhatsApp Click
Marketplace Click

Identitas customer yang disimpan:

Email
Phone

Tidak menggunakan uploaded customer profile photo (generic user-circle icon).

Marketplace activity menyimpan channel yang dipilih.

Dashboard menampilkan summary.

Total Interest berarti total record interaksi, bukan jumlah customer unique.

Activity owner di store miliknya sendiri TIDAK dicatat:

Buka WhatsApp/Marketplace pada store sendiri → bukan Customer Interest.

Frontend harus menghindari pencatatan, backend diharapkan menegakkan.

Action:

Lihat Semua

mengarah ke:

/seller/customer-interest

Tidak membuat Customer Interest page kedua.

Layout Customer Interest:

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
- Date TANGGAL TUNGGAL (single date), bukan date range

Context field:

- Store Landing
- Product Detail

Records tetap tampil meskipun channel dihapus dari konfigurasi store.

32. Recent Activity

Recent Activity hanya menampilkan:

Product Published
Product Edited
Product Sold Out
Product Reactivated
Product Archived
Product Restored
Store Updated

Tidak menampilkan:

WhatsApp Click
Marketplace Click
Product View
Share
Login
Logout
Category Create
Category Edit
Category Delete

Recent Activity adalah dashboard summary/timeline.

Dashboard menampilkan 4 aktivitas terbaru dan "Lihat Semua":

Lihat Semua
    ↓
/seller/activities

Setiap section (Customer Interest dan Recent Activity) memiliki "Lihat Semua" di kanan atas heading-nya.

Halaman /seller/activities adalah list Recent Activity lengkap dan menyediakan "Kembali" ke Dashboard.

Filter pada /seller/activities:

Filter tipe activity
Filter tanggal TANGGAL TUNGGAL (single date), bukan date range

Pemilihan tanggal menggunakan date picker, bukan input teks manual.

Tanggal ditampilkan dalam format:

12.09.2026

Datetime display:

12.09.2026 · 18:02

Tanpa hari (weekday).

Customer activity tidak masuk Recent Activity.

33. Quick Actions

Quick Actions merupakan shortcut ke fungsi utama seller.

Minimal mengarah ke:

Add Product
Products
My Store

Quick Actions boleh menggunakan icon sebagai visual anchor.

Quick Actions bukan tempat untuk membuat business flow baru.

34. Add Product / Edit Product

Add dan Edit harus memiliki visual/form structure yang sama.

Reusable component:

ProductForm

Create mode:

Add Product

Edit mode:

Edit Product

Edit harus melakukan prefill existing product data.

35. Product Form Sections

Urutan:

Photos
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

Create mode:

Save as Draft
Publish Product

Edit mode:

Batal
Simpan

Edit mode hanya memiliki Batal dan Simpan (tanpa tombol status).

Product Edited activity hanya dibuat ketika Simpan diklik dan perubahan berhasil dipersist.
36. Required Publish Fields

Publish membutuhkan:

Product Name
Minimum 1 Photo
Category
Product Details
Description
Condition
Price

Optional:

Brand
External Product Links
Product Unggulan

UI harus membedakan field required dan optional dengan jelas.

37. Product Details UI

Product Details menggunakan hybrid structure:

Recommended Attributes
+
Custom Attributes

Recommended attributes dapat bergantung pada category.

Seller tetap dapat menambahkan custom attributes.

Customer-facing display harus tetap clean dan readable.

Tidak semua possible attributes harus diwajibkan.

Product Details sendiri wajib untuk Publish.

38. Description

Description wajib untuk Publish.

Long description dapat menggunakan:

Expand
Collapse

jika content terlalu panjang.

Jangan membuat halaman description terpisah.

39. Product Status

Gunakan status:

DRAFT
PUBLISHED
SOLD_OUT
ARCHIVED

Active Products bukan database status.

Active Products merupakan aggregate:

PUBLISHED

Produk SOLD OUT tetap dapat dilihat pelanggan.

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

### Seller Products Page Layout

Desktop:

- Baris atas: Judul halaman + tombol Add Product di kanan.
- Baris kedua: Search dan Filter sejajar horizontal.
- Status tab: Active | Draft | Sold Out.
- Archive adalah aksi terpisah pada baris yang sama dengan tindakan product.

Mobile:

- Search penuh lebar terlebih dahulu.
- Lalu Filter dan tombol Archive.
- Lalu status tab: Active | Draft | Sold Out.

Tidak ada Sort pada halaman Seller Products.

Status tab "Active" pada halaman Seller Products menggunakan label dashboard (Active Products) dan berarti produk PUBLISHED, bukan status lifecycle baru.

40. Archive UI

Archive merupakan action seller.

Flow:

Archive
   ↓
Confirmation
   ↓
ARCHIVED

Restore:

Restore
   ↓
DRAFT

Restore tidak langsung Published.

Archiving otomatis menghapus status Product Unggulan.

Product yang berubah menjadi SOLD_OUT otomatis kehilangan status Product Unggulan (is_featured = false).

Reaktivasi SOLD_OUT ke PUBLISHED TIDAK otomatis mengembalikan status Product Unggulan.

Archived Products view menyediakan:

Kembali

Kembali → /seller/products

Tidak membuat route baru.

Tindakan per product pada list Archived:

- Detail Product → membuka tampilan read-only product archived.
- Restore → tersedia dari menu aksi pada list, mengubah ARCHIVED → DRAFT.

Halaman Archive TIDAK memiliki aksi "Lihat Product".

Archive Detail Product:

- tampilan read-only yang menampilkan seluruh informasi product, termasuk Product Catalog Settings, gambar, Brand, Category, Condition, Price, Description, status Product Unggulan, dan status (ARCHIVED).
- tidak ada field editable, tidak ada tombol Save/Edit/Restore di dalam tampilan ini.
- hanya menyediakan navigasi Kembali (ke halaman Archive).
- detail dibuka tanpa route baru (state/internal view pada halaman Archive).

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
- jika nilai berubah, label tombol mengikuti nilai yang tersimpan (contoh: "Auto Archive", "Auto Archive 30 hari").
- Simpan mem-persist setting; Batal membuang perubahan dan menutup popover.

41. Category UI

Category UI maksimal dua level:

Kategori Utama
└── Sub Kategori

Terminology user-facing:

Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Product memilih tepat satu category.

Seller dapat membuat Kategori Utama baru langsung dari form pembuatan category.

Setiap category memiliki "Lihat Produk" yang mengarah ke:

/seller/products?category=...

"Lihat Produk" menggunakan hover treatment sederhana (text/action hover).

Bukan "Lihat Semua".

Category deletion harus dicegah jika masih digunakan product.

Kategori Utama yang masih memiliki child tidak dapat dihapus.

Tidak ada cascade delete.

Penghitungan penggunaan:

Kategori Utama count mencakup seluruh product di descendant-nya (Sub Kategori).

Contoh:

Computer (5)
  └── Laptop (3)
  └── Desktop (2)

Computer = aggregate usage 5 product.

### Collapse Semua

Desktop:

[ Cari category...                         Collapse Semua ]

"Collapse Semua" berada di sisi kanan search field pada baris yang sama.

Bukan baris/row yang terpisah.

Mobile tetap usable dan responsive.

Fungsi collapse, logika tree category, data model, dan categories.parent_id tidak berubah.

### Brand UI

Brand bersifat optional dan terpisah dari Category.

Layout brand card:

- Desktop: card grid 4 kolom × 4 baris
- Mobile: card grid 2 kolom

Brand card berisi:

- Nama brand
- Product usage count
- Edit
- Lihat Produk

Lihat Produk menerapkan filter brand pada /seller/products.

Brand card menggunakan label "Lihat Produk" yang sama dengan category card agar terminologi konsisten.

Tidak perlu decorative icon per brand.

Delete brand hanya diizinkan jika product usage = 0.

Brand yang masih digunakan product tidak dapat dihapus.

Tidak ada cascade delete.

Seller dapat membuat brand baru langsung dari Add/Edit Product.

42. My Store UI

My Store digunakan untuk mengelola:

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

Auto Archive TIDAK berada di My Store. Auto Archive terletak pada halaman Archive (lihat §40 Archive UI).

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

My Store menampilkan Store Link yang diturunkan dari Store ID saat ini.

Store Link berada di bawah Store ID.

Actions Store Link:

Salin
Bagikan

Tidak ada QR Code.

Jika Store ID berubah, Store Link ikut berubah.

Create Store tidak meminta semua field tersebut.

Create Store hanya:

Store Name
Store ID

### Store Form Required / Optional

Tidak ada label "wajib" pada form store.

Kewajiban field divalidasi pada saat Simpan:

Field yang belum lengkap (mis. City/Province, WhatsApp) ditandai sebagai required pada titik validasi tersebut.

Seller tetap dapat menyimpan store dengan field belum lengkap selama validasi dasar terpenuhi.

Seller tidak diblokir dari sidebar/product karena informasi store belum lengkap.
43. Store Logo

Store Logo merupakan dynamic asset.

Production value berasal dari backend/API.

Contoh:

store.logoUrl

Jangan hardcode uploaded store logo ke:

src/assets/

Static placeholder/mock asset diperbolehkan untuk development.

44. Seller Avatar

Seller/account owner dapat memiliki optional profile photo/avatar.

Jika tersedia:

avatarUrl

digunakan sebagai profile image.

Jika tidak tersedia:

Generic User Icon
45. Customer Avatar

Customer tidak menggunakan uploaded profile photo pada UI Kataloga.

Gunakan:

Generic User Circle Icon

terutama pada Customer Interest.

46. Dynamic Assets

Asset yang berasal dari backend/API/database:

Store Logo
Product Photos
Seller Avatar
Store Photos

harus direpresentasikan sebagai URL/data dari API.

Contoh:

product.imageUrl
store.logoUrl
user.avatarUrl

Jangan menganggap dynamic asset sebagai frontend-owned static asset.

47. Static Assets

Frontend-owned static assets dapat berada di:

src/assets/

Recommended:

src/assets/
├── branding/
│   └── kataloga-logo.svg
└── marketing/
    └── ...

Contoh static asset:

Kataloga logo
permanent marketing illustration
frontend-owned decorative asset

Logo Kataloga saat ini belum dianggap final.

48. Icons

Gunakan icon library untuk common UI icons jika tersedia.

Jangan membuat icon SVG manual untuk icon umum tanpa alasan.

Contoh:

User
Search
Filter
Share
Edit
Delete
Archive
Chevron
Plus
Menu

Marketplace tidak menggunakan marketplace logo/icon.

49. Button Hierarchy

Gunakan hierarchy yang jelas.

Primary action:

Tambah Produk
Publish Product
Lihat Detail

Secondary action:

Marketplace
Apply Filter
Save

Utility action:

Share
Edit
More

Jangan membuat semua button terlihat sebagai primary action.

50. Loading State

Semua asynchronous UI harus memiliki loading state yang jelas.

Contoh:

Loading
Skeleton
Spinner
Disabled Button

sesuai kebutuhan component.

Saat submit:

Button
   ↓
Loading

Button tidak boleh memungkinkan duplicate submission.

51. Error State

Error harus:

jelas
dekat dengan sumber masalah
mudah dipahami
tidak menyalahkan user
tidak menghilangkan input yang sudah dimasukkan

Form error harus menunjuk field terkait jika memungkinkan.

52. Success Feedback

Action penting harus memberikan feedback.

Contoh:

Product Published
Product Updated
Product Archived
Product Restored
Store Updated
Category Updated

Feedback dapat berupa:

toast
inline confirmation
success state

sesuai screenshot/reference.

53. Empty State

Minimal support:

Empty Store
Empty Search Result
Empty Products
Empty Archived Products
Empty Customer Interest
Empty Categories

Empty state harus jelas.

Jangan menggunakan mock data sebagai data nyata pada production state.

54. Confirmation

Confirmation digunakan untuk destructive/high-impact actions.

Contoh:

Archive Product
Delete Category
Remove External Channel

Tidak semua action membutuhkan confirmation.

55. External Channel UI

External channel memiliki:

type ExternalChannel = {
  name: string
  url: string
}

Tidak ada field id pada persisted model/API contract.

Tidak menambahkan:

id
iconUrl
description
displayOrder
analytics

ke UI requirement V1 tanpa keputusan baru.

56. Customer Interest UI

Customer Interest merupakan activity list, bukan CRM.

Tampilkan:

Customer
Product
Channel
Date / Time

Channel dapat berupa:

WhatsApp
Shopee
Tokopedia
Website
Custom Channel

Customer yang sama tetap merupakan satu customer meskipun memiliki beberapa activity.

Total Interest berarti total record interaksi, bukan jumlah customer unique.

Detail Customer Interest menampilkan:

Customer
Product
Activity
Time
Customer interaction history

Action detail:

Lihat Product → membuka product detail customer-facing
Tutup → menutup detail

Jangan menyediakan aksi kontak customer seperti:

Hubungi Customer
Buka WhatsApp Customer
Buka Marketplace
Buka Channel

57. Typography

Typography harus:

readable
clear hierarchy
consistent
tidak terlalu banyak font size
heading lebih prominent daripada supporting text

Hierarchy minimal:

Page Title
Section Title
Card Title
Body
Caption / Metadata

Gunakan typography yang konsisten di seluruh application.

58. Spacing

Gunakan spacing system yang konsisten.

Hindari:

random margin
random padding

Gunakan reusable spacing/token jika design system frontend sudah dibuat.

Tujuan:

Consistency > Pixel-perfect random values

Screenshot digunakan untuk menentukan visual target.

59. Border & Radius

Gunakan border dan radius secara konsisten.

Jangan setiap element memiliki radius berbeda tanpa alasan.

Card, input, button, modal, dan sheet harus mengikuti visual language yang sama.

60. Shadow

Shadow digunakan secara subtle.

Prioritas:

Hierarchy
Elevation
Separation

Jangan menggunakan heavy shadow pada semua card.

61. Animation

Animation harus:

subtle
cepat
purposeful

Gunakan untuk:

modal
bottom sheet
dropdown
expand/collapse
feedback

Jangan menggunakan:

auto-sliding product carousel
excessive animation
decorative animation yang mengganggu usability
62. Mobile Interaction

Mobile menggunakan interaction pattern yang sesuai touch interface.

Target utama:

button mudah disentuh
spacing cukup
bottom sheet untuk pilihan kompleks
horizontal scrolling untuk Product Unggulan
bottom navigation untuk seller
63. Desktop Interaction

Desktop dapat menggunakan:

sidebar
dropdown
popover
hover states
subtle arrows
mouse/trackpad horizontal scrolling

Jangan mengubah business logic hanya karena desktop.

64. Accessibility

UI harus memperhatikan:

semantic HTML
keyboard navigation
visible focus state
accessible labels
sufficient contrast
button/link semantics
alt text untuk meaningful images
form labels

Icon-only button harus memiliki accessible label.

Contoh:

Share Product
Edit Product
Archive Product

jangan hanya mengandalkan icon visual.

65. Form Rules

Form:

gunakan label yang jelas
tandai required field
tampilkan validation error dekat field
pertahankan input user ketika validation gagal
disable submit saat request sedang berjalan
cegah duplicate submit

Draft dan Publish memiliki validation behavior berbeda.

66. Business Logic vs UI

Frontend UI tidak boleh mengubah business rule.

Contoh:

Active Products

bukan status baru.

Artinya:

PUBLISHED

Frontend tidak boleh membuat enum:

ACTIVE

hanya karena dashboard menggunakan label Active Products.

67. No Business Rule Invention

Jika requirement belum ditentukan:

Jangan OpenCode langsung memutuskan:

business rule
data model
validation rule
navigation behavior
new route
new feature
analytics behavior
permission model

Jika keputusan tersebut memengaruhi UX atau architecture:

Stop
↓
Identify ambiguity
↓
Ask / propose
↓
Wait for decision
68. Reusable Components

Prioritaskan reusable component.

Contoh:

SellerLayout
SellerSidebar
BottomNavigation
MoreMenu
ProductForm
ProductCard
ProductGrid
ProductFilters
ProductSort
MarketplaceSelector
ShareButton
StoreHeader
StoreActions
Announcement
EmptyState
LoadingState
ErrorState

Jangan copy-paste component yang memiliki behavior sama ke banyak halaman.

69. Page vs Component Rule

Gunakan page jika:

memiliki URL
merupakan destination navigasi
memiliki independent page context

Gunakan component jika:

hanya UI state
modal
dropdown
bottom sheet
reusable section
action

Contoh:

Filter

adalah component/state.

Bukan:

/filter
70. Public vs Seller UI

Public/customer UI dan seller UI memiliki context berbeda.

Public:

Storefront
Product Discovery
Contact Seller
External Channels

Seller:

Management
CRUD
Store Configuration
Customer Interest

Jangan mencampurkan seller management UI ke storefront.

71. Data Source Readiness

UI component harus disiapkan agar mock data dapat diganti API tanpa rewrite besar.

Hindari component yang terlalu bergantung pada hardcoded data.

Contoh:

<ProductCard product={product} />

lebih baik daripada component yang memiliki product data hardcoded di dalamnya.

72. Mock Data

Mock data boleh digunakan selama frontend development.

Namun harus jelas bahwa:

Mock Data ≠ Production Data

Mock data harus mudah diganti dengan API response.

73. Stitch Code Usage

reference/stitch-code/ digunakan sebagai:

Implementation Reference

Boleh digunakan untuk:

melihat struktur component
melihat styling approach
memahami layout
mempercepat implementasi

Tidak boleh dianggap sebagai production source code.

Production implementation tetap berada di:

src/
74. Stitch Screenshot Priority

Jika Stitch code dan screenshot berbeda:

Screenshot
    >
Requirement
    >
UX Flow
    >
Stitch Code

Stitch code tidak boleh mengalahkan requirement yang sudah dikunci.

75. No Unrelated UI Changes

Saat mengerjakan satu task:

Jangan mengubah:

halaman lain
navigation lain
business logic lain
visual system lain

kecuali perubahan tersebut memang diperlukan oleh task.

Jika perubahan berdampak luas:

Explain impact
↓
Propose
↓
Wait for approval
76. UI Lock Rule

Setelah screenshot/design suatu page dianggap final:

UI = LOCKED

OpenCode harus mengimplementasikan desain tersebut.

Jangan:

redesign
menambah section
menghapus section
mengubah hierarchy
mengganti navigation
menambah feature

tanpa explicit approval.

77. Implementation Priority

Saat membangun sebuah page:

1. Layout
2. Responsive structure
3. Component hierarchy
4. Typography
5. Spacing
6. Interaction
7. Loading
8. Error
9. Empty state
10. API integration

Visual structure harus stabil sebelum logic kompleks ditambahkan.

78. Definition of Done — UI

Sebuah page dianggap selesai jika:

layout sesuai screenshot
desktop sesuai
mobile sesuai
responsive behavior benar
navigation benar
component reusable
loading state tersedia
error state tersedia
empty state tersedia jika relevan
form validation sesuai requirement
tidak ada route tambahan yang tidak diperlukan
tidak ada business rule baru yang dibuat sepihak
TypeScript/build tidak error

79. Storefront Footer

Footer ditampilkan pada Store Landing dan Product Detail.

Bagian:

Store Identity
- Store Logo
- Store Name

Contact
- WhatsApp / Contact

External Sales Channels
- Marketplace / external sales channels seller

Address
- Full Address jika tersedia

Kataloga
- Tentang Kataloga (hanya link/konten existing)

External channels tetap:

{ name, url }

Tidak ada persisted channel ID.

Tidak ada field marketplace-specific:

shopeeUrl
tokopediaUrl

WhatsApp dan Marketplace pada footer mengikuti aturan authentication + Customer Interest yang sama.

80. WhatsApp Visual Rule

Setiap action WhatsApp aktual menggunakan:

- icon WhatsApp yang recognizable
- warna hijau WhatsApp yang lebih gelap/refined

Jangan menggunakan hijau neon yang terlalu terang.

Warna hijau WhatsApp hanya untuk action WhatsApp aktual.

Jangan menerapkan warna hijau WhatsApp pada:

- success state generic
- button yang tidak related
- aksi telepon yang tidak membuka WhatsApp
- UI yang tidak berhubungan

Gunakan icon/component/design token WhatsApp yang sudah ada.

81. Semantic Color Rules

Mapping warna semantik:

Active → blue
Draft → amber/yellow
Sold Out → neutral/gray
Archived → neutral/gray
Error → red
Success → green
Warning → amber/yellow
WhatsApp → darker/refined WhatsApp green

Sold Out TIDAK menggunakan color semantik merah/error.

Warna semantik adalah accents/tints, bukan strong full-card fill.