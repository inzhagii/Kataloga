# Kataloga — UX Flow

## 1. Tujuan Dokumen

Dokumen ini mendefinisikan alur pengalaman pengguna (UX Flow) Kataloga untuk:

- Customer/visitor
- Seller/store owner
- Guest
- User yang sudah login

Dokumen ini menjadi acuan implementasi frontend bersama:

- `PRODUCT.md` → product requirements
- `ROUTES.md` → route structure
- `UI_RULES.md` → visual/UI rules
- `reference/screenshots/` → visual source of truth
- `reference/stitch-code/` → implementation reference

Jika terdapat perbedaan antara dokumen dan screenshot final, jangan mengubah requirement secara sepihak. Ajukan perubahan terlebih dahulu.

---

# 2. User Roles

Kataloga tidak menggunakan role account yang permanen sebagai "Customer" atau "Seller".

Satu account dapat:

- menjadi customer ketika mengunjungi toko orang lain
- memiliki satu store sendiri dan menjadi seller/store owner

Tidak ada role-switching login flow.

Seller membuka storefront miliknya sendiri melalui:

Seller Dashboard → Lihat Toko

menggunakan session/account yang sudah authenticated.

Tidak ada login kedua.

Ketika storefront dibuka dalam sesi authenticated:

- navbar storefront menampilkan icon user-circle untuk customer (bukan tombol Login/Daftar).
- "Lihat Toko" TIDAK menampilkan Login/Daftar.
- Mengakses store URL langsung (direct link) tanpa sesi berarti tampil sebagai guest.
- Tidak ada konsep role-switching "customer mode" baru; halaman yang sama dirender sesuai sesi auth yang ada.

Activity owner di storefront miliknya sendiri TIDAK membuat Customer Interest.

### Guest

User belum login.

Guest dapat:

- membuka marketing landing
- membuka store
- melihat produk
- mencari produk
- filter dan sort produk
- membuka product detail
- melihat informasi store
- menggunakan Share

Guest tidak dapat:

- melakukan Customer Interest activity
- membuka WhatsApp melalui flow Kataloga
- memilih marketplace/external channel sampai melakukan login/register

---

### Logged-in User

User yang sudah login dapat:

- melakukan seluruh aktivitas guest
- menghubungi seller melalui WhatsApp
- memilih external sales channel
- membuat Customer Interest activity
- membuat store jika belum memiliki store
- mengelola store jika sudah memiliki store

---

# 3. High-Level User Flow

## 3.1 Guest Customer

```text
Marketing Landing
      │
      └── Store Link
             │
             ▼
       Store Landing
             │
             ▼
Product Listing ({storeId}/products)
   ┌─────────┼────────────┬──────────────┐
   │         │            │              │
   ▼         ▼            ▼              ▼
 Search    Filter       Sort       Product Detail
                                       │
                                 ┌─────┼──────────────┐
                                 │     │              │
                                 ▼     ▼              ▼
                             WhatsApp Marketplace   Share
                                 │     │
                                 └─────┴──► Login/Register
                                            │
                                            ▼
                                 Return to Product Detail
```

4. Marketing Landing Flow

Route:

/

Marketing landing digunakan untuk orang yang ingin menggunakan Kataloga untuk membuat atau mengelola store.

Flow
Marketing Landing
      │
      ├── Login
      │      ▼
      │    Login
      │
      ├── Daftar
      │      ▼
      │    Register
      │
      └── CTA Create Store
             │
             ▼
          Login/Register

Jika user sudah login dan belum memiliki store:

Marketing Landing
      │
      ▼
    Buat Toko

Jika user sudah login dan sudah memiliki store:

Marketing Landing
      │
      ▼
    Dashboard
5. Authentication Flow
5.1 Login

Route:

/login

Login menggunakan:

Email atau Phone
Password

Flow:

Login
 │
 ├── Success
 │      │
 │      ├── User belum punya store
 │      │       └── Buat Toko
 │      │
 │      └── User sudah punya store
 │              └── Dashboard
 │
 └── Error
        └── Tampilkan validation/error message
6. Register Flow

Route:

/register

Register menggunakan:

Email, atau
Phone

Fields:

Email/Phone
Password
Re-password
Customer Name optional

Tidak menggunakan username.

Email Registration:

email verification wajib.

Phone Registration:

account dapat menjadi active tanpa registration verification.

Customer yang register menggunakan phone harus memiliki recovery email untuk password recovery / change-password flow.

Change-password flow membutuhkan input email terlebih dahulu.

Mekanisme teknis OTP/token tidak ditentukan di sini — needs backend confirmation.

Customer Name boleh:

kosong
menggunakan "-"
atau value yang diberikan user

Profile photo customer tidak digunakan.

Setelah register berhasil:

Register
   │
   ▼
Logged-in User
   │
   └── User belum memiliki store
           │
           ▼
        Buat Toko
7. Create Store Flow

Route:

/create-store

Create Store hanya meminta:

Store Name
Store ID

Tidak meminta informasi store lainnya.

Flow:

Buat Toko
   │
   ├── Store Name
   │
   └── Store ID
          │
          ▼
       Submit
          │
     ┌────┴────┐
     │         │
   Error     Success
     │         │
     ▼         ▼
 Validation  My Store

Setelah store berhasil dibuat, user langsung mendarat di My Store, bukan Dashboard.

Flow:

Login/Register
     │
     ▼
 Create Store
     │
     ▼
 My Store

Seller TIDAK diblokir dari sidebar atau pembuatan product jika informasi store belum lengkap.

Seller tetap dapat mengakses:

Dashboard
Products
Categories
Customer Interest
My Store
Profile

8. Store ID UX

Store ID digunakan sebagai public URL:

/{storeId}

Store ID:

wajib saat Create Store
harus unique
dapat diubah oleh seller
perubahan maksimal satu kali setiap 30 hari

Format Store ID:

huruf kecil
angka
tanda hubung (-)
diawali dan diakhiri karakter alfanumerik
tanpa tanda hubung berurutan
di-trim

Availability Store ID diperiksa saat valid, saat berubah, dan diperiksa ulang pada saat submit.

Store Link diturunkan dari Store ID saat ini dan ditampilkan di My Store.

Store Link berada di bawah Store ID.

Actions Store Link:

Salin
Bagikan

Tidak ada QR Code.

### Historical Store ID

Jika Store ID berubah:

/arya
→ /toko-arya

Jika diubah lagi:

/arya
→ /toko-arya
→ /toko-arya-bandung

Setiap historical Store ID menjadi valid alias yang redirect ke store saat ini selama 90 hari sejak perubahan, lalu kedaluwarsa. Historical aliases TIDAK permanen.

Historical aliases adalah behavior backend-owned.

Frontend tidak memelihara alias mapping sendiri.

Pada Store Landing, Store ID tidak ditampilkan sebagai informasi visual.

Contoh URL:

/toko-komputer-jaya
9. Customer Store Landing Flow

Route:

/{storeId}

Customer membuka store melalui link yang dibagikan seller.

Flow utama:

Store Landing
    │
    ├── Link ke Product Listing
    │      └── /{storeId}/products
    │           ├── Search
    │           ├── Filter
    │           ├── Sort
    │           └── Product Card / Product Grid
    │
    ├── Product Card
    │      └── Product Detail
    │
    ├── WhatsApp (floating action bar)
    │
    ├── Marketplace (floating action bar)
    │      └── modal/bottom sheet list channel
    │
    └── Share Store (floating action bar desktop & mobile)

Product Listing menyediakan:

Toolbar (Search + Filter + Sort)
Product grid
Search

Menggunakan reusable ProductCard dan ProductGrid.

Katalog hanya berisi PUBLISHED dan SOLD_OUT yang masih dalam jendela auto archive.

Ordering:

Featured Published → Published lebih baru → Published lebih lama → Sold Out

### Toolbar

Desktop:

`[Search (full width)] [Filter (compact)]`

berada pada baris yang sama. Filter berisi Category, Condition, dan Sort
(TIDAK ada category chips). 

Mobile:

`[Search (full width)]`
`[Filter] [Urutkan]`

Search full width; baris kedua memisahkan tombol Filter dan Urutkan.

### Storefront Footer

Footer ditampilkan pada Store Landing (Product Detail TIDAK memiliki footer — lihat Product Detail Flow).

Footer bersifat compact dan berisi:

Store Identity
- Store Name
- Store Description / Bio

Contact
- WhatsApp / Contact

External Sales Channels
- Marketplace / external sales channels seller

Address
- Full Address jika tersedia

Footer TIDAK memuat:

- Store Logo
- Tentang Kataloga
- kumpulan link informasi Kataloga

Baris terbawah footer adalah satu baris centered:

- © 2026 Kataloga · Made with Kataloga

dengan "Made with Kataloga" clickable menuju `/`.

External channels menunjuk ke shared channel master (CMS) sebagai referensi:

channelId
url

Definisi channel (name + logo) di-resolve dari master; custom channel
(store-scoped) ber-prefix `CUSTOM:`. Tidak ada persisted channel ID
per-referensi atau field marketplace-specific pada model/API contract.

Channel master mock berisi persis 3 channel (Shopee / Tokopedia / Lazada);
TikTok Shop & Blibli tersisa sebagai hint display (destinationPresets) —
apakah production CMS menyertakannya needs backend confirmation.

WhatsApp dan Marketplace pada footer mengikuti aturan authentication + Customer Interest yang sama.
10. Product Listing — Search Flow

Search hanya mencari produk pada store yang sedang dibuka.

Search mendukung:

partial match
case-insensitive
exact/close match
multi-field search
relevance ranking

Field yang dapat dicari:

Product Name
Brand
Category
Product Details
Description
Custom Attributes

Flow:

Product Listing
     │
     ▼
 Search Input
     │
     ▼
 Enter Search
     │
     ▼
 Search Current Store
     │
     ├── Result Found
     │       └── Display Products
     │
     └── No Result
             └── Empty Search State

Search tidak membuat Customer Interest activity.

11. Product Listing — Filter Flow

Desktop:

Filter
  │
  ▼
Filter Choices
  │
  ├── Category
  │
  └── Condition
       ├── New
       └── Second

User harus menekan:

Apply Filter

untuk menerapkan filter.

Mobile:

Filter Button
     │
     ▼
Bottom Sheet
     │
     ├── Category
     │
     ├── New
     │
     └── Second
             │
             ▼
        Apply Filter

Category bersifat dua level.

State awal: Kategori Utama.

Setelah customer memilih Kategori Utama:

→ tampilkan Sub Kategori milik Kategori Utama tersebut.

Contoh:

Kategori Utama
- Elektronik
- Fashion

Pilih: Elektronik

→ Sub Kategori
- Laptop
- Smartphone
- Aksesoris

Hanya Sub Kategori milik Kategori Utama yang dipilih yang ditampilkan.

Terminology user-facing:

Kategori
Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

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

12. Product Listing — Sort Flow

Sort options:

Relevance
Newest
Price Low → High
Price High → Low

Tidak ada availability grouping/ordering.

Selected sort diterapkan langsung pada seluruh product di katalog aktif.

13. Store Landing — Product Card Flow

Product information (urutan):

1. Product image
2. Category
3. Product name
4. Price
5. Condition
6. Product Unggulan indicator (ketika featured)

Price memiliki penekanan visual lebih kuat daripada Product Name.

Condition:

NEW
SECOND

Ditampilkan tanpa:

Brand
SKU
availability

Conditional:

SOLD OUT indicator untuk produk SOLD_OUT yang masih dalam jendela auto archive

Actions (terpisah dari urutan informasi; posisi mengikuti layout yang sudah disetujui):

- Lihat Detail
- Share icon

Tidak menampilkan:

WhatsApp
Marketplace
Contact Seller

Catalog aktif hanya berisi produk PUBLISHED dan SOLD_OUT yang masih dalam jendela auto archive.

Produk DRAFT dan ARCHIVED tidak termasuk katalog aktif.

SOLD OUT indicator hanya tampil pada produk SOLD_OUT yang masih dalam jendela auto archive.

Flow:

Product Card
    │
    ├── Lihat Detail
    │       └── Product Detail
    │
    └── Share
            └── Share Product

Product View tidak membuat Customer Interest.

14. Product Detail Flow

Route:

/{storeId}/product/{productId}/{slug}

Flow:

Product Detail
      │
      ├── Product Information
      │
      ├── Product Details
      │
      ├── Description
      │
      ├── CTA (Beli / Tawar / label kustom)
      │      └── menu destination product berisi SEMUA External Product Links (modal desktop / bottom sheet mobile)
      │
      └── Share

Hierarchy utama:

Brand (jika tersedia) dengan format eksplisit "Brand : X"
      ↓
Product Unggulan indicator (jika featured)
      ↓
Product Name
      ↓
Price (bold)
      ↓
Category / Condition (bersebelahan, di bawah Price)
      ↓
Actions (CTA : Share = 70 : 30)
      ↓
Product Details
      ↓
Description

Brand ditampilkan secara eksplisit pada Product Detail. Contoh tampilan penulisan nama brand diikuti colon:

`Brand : ASUS`

Bagian External Product Links TIDAK ditampilkan pada Product Detail.

External Product Links tetap ada sebagai field data product (form product dan API), tetapi tidak dirender di halaman Product Detail customer-facing.

Desktop:

info card (Brand, product info, harga, kategori/kondisi, CTA + Share) fixed dan
selalu terlihat; hanya bagian Product Details dan Description yang scroll di
dalam area tersebut,
TIDAK ada footer pada Product Detail.

Mobile:

images menggunakan swipe-only carousel/slider, info di bawah images,
CTA + Share tetap tampil sebagai floating bottom bar di atas content (rasio
CTA : Share = 70 : 30).

Product Details dan Description menggunakan expand/collapse ("Lihat
selengkapnya" / "Tutup") jika content panjang; jangan mengarang batas karakter
tanpa requirement.

Gallery menyediakan mode fullscreen "Lihat Full" (overlay hitam, swipe horizontal, tombol close ×).

Primary action adalah CTA product (Beli / Tawar / Custom).

CTA TIDAK menggunakan WhatsApp maupun Marketplace (store channels).

CTA tidak tersedia jika menu destination external product kosong:

- tidak ada fallback, tidak mengarang destination,
- CTA tidak ditampilkan,
- kebutuhan ini dicatat sebagai API/product dependency.

Menu destination product menggunakan modal (desktop) / bottom sheet (mobile), bukan dropdown.

Navbar Product Detail tidak mengandung WhatsApp/Contact maupun Marketplace.

Product Detail tidak memiliki footer.

### Sold Out pada Product Detail

Jika product SOLD_OUT (masih dalam jendela auto archive):

indikasi "Sold Out" yang jelas
product tetap dapat dilihat
CTA tidak tersedia
Share tetap tersedia

Tidak ada section availability.
15. Product Detail — CTA Destination Flow

Saat user menekan CTA:

CTA (Beli / Tawar / label kustom)
   │
   ▼
Auth Check terlebih dahulu? Tidak.

CTA menampilkan menu destination product (modal desktop / bottom sheet mobile) berisi SEMUA External Product Links product:

Product CTA
   │
   ├── Destination A (Shopee)
   ├── Destination B (Tokopedia)
   └── Destination C (Custom)

Setelah destination dipilih

Selected Destination
       │
       ▼
    Auth Check
       │
  ┌────┴─────┐
  │          │
Guest    Logged-in
  │          │
  ▼          ▼
Login     Record Interest
Register     │
  │           ▼
  ▼        Redirect URL
Return

Guest:

CTA → Login/Register → kembali ke context product → continue CTA destination → record Customer Interest → redirect ke exact URL destination.

CTA (Beli/Tawar/label kustom) adalah selection dari Store CTA Options (level store); CTA tidak berisi daftar destination. Klik CTA membuka menu yang berisi SEMUA External Product Links product (bukan library: Add/Edit Product tidak pernah membuat definisi CTA baru).

Autentikasi hanya dilakukan SETELAH destination dipilih.

Customer Interest menyimpan destination yang benar-benar dipilih (context PRODUCT).

Product View tidak dicatat sebagai Customer Interest.

CUSTOM destination:

Customer Interest channel disimpan sesuai nama/nilai yang dipilih (needs backend confirmation untuk representasi wire).

Perilaku CTA terhadap product SOLD_OUT:

CTA tidak tersedia; tidak ada ecommerce checkout/perantara.

Share tetap tersedia.

Seller (owner) di storefront miliknya sendiri:

CTA
   │
   ▼
Pilih Destination
   │
   ▼
Redirect URL
(TANPA Customer Interest)

Activity owner di storefront miliknya sendiri tidak pernah membuat Customer Interest.

16. (hapus — WhatsApp/Marketplace Product Detail digantikan CTA + Share; lihat # 15 dan # 17)

17. Product Share Flow

Share tidak membutuhkan login.

Share Product
      │
      ▼
Generate Product URL
      │
      ▼
Share UI / Native Share

Product share berisi:

Product Name
Product URL

Share tidak membuat Customer Interest.

Share analytics belum menjadi bagian V1.

Tidak ada QR Code.

18. Store Share Flow

Share Store tidak membutuhkan login.

Share Store
     │
     ▼
Store Name + Store URL
     │
     ▼
Share UI / Native Share

Share Store tidak membuat Customer Interest.

Tidak ada QR Code.

19. Announcement Flow

Store memiliki satu object announcement:

{ title, message, is_enabled }

Bukan array.

Flow:

Store Landing
     │
     ▼
Announcement (hanya jika is_enabled)
     │
     ├── Collapsed
     │
     └── Expanded

Jika announcement disabled:

data announcement tetap tersimpan,
customer storefront tidak merender announcement.

Tidak menggunakan carousel.

20. Seller Entry Flow

Entry gateway seller menggunakan route `/seller`.

`/seller`:

Guest
   │
   ▼
Redirect ke /login

Authenticated tanpa store
   │
   ▼
Redirect ke /create-store

Authenticated dengan store
   │
   ▼
Redirect ke /seller/dashboard

Route `/seller/*` tetap diproteksi SellerLayout.

Gateway `/seller` tidak membutuhkan endpoint backend baru; status auth dan store diperoleh dari session.

Setelah user login:

Login
  │
  ├── Belum punya store
  │       └── Buat Toko
  │
  └── Sudah punya store
          └── Dashboard

Jika user membuat store:

Login/Register
     │
     ▼
 Create Store
     │
     ▼
 My Store
21. Seller Dashboard Flow

Route:

/seller/dashboard

Dashboard merupakan control center, bukan tempat untuk mengelola semua data secara langsung.

Urutan section:

1. Catalog Overview
2. Quick Actions
3. Customer Interest + Recent Activity

Flow:

Dashboard
   │
   ├── Catalog Overview
   │       ├── Active Products
   │       │       └── Products
   │       ├── Draft Products
   │       ├── Sold Out Products
   │       └── Archived Products
   │               └── Archived Products
   │
   ├── Quick Actions
   │
   ├── Customer Interest
   │       └── Customer Interest Page
   │
   └── Recent Activity
           └── Lihat Semua
                   └── /seller/activities
22. Catalog Overview Flow

Catalog Overview menampilkan dalam SATU BARIS horizontal:

Active    Draft    Sold Out    Archive

Setiap kartu menggunakan icon tertentu sebagai visual anchor.

Active Products hanya:

Published

Produk SOLD OUT tetap dapat dilihat pelanggan.

Draft dihitung terpisah.

Dashboard:

Active Products
      │
      ▼
   Products

SOLD_OUT merupakan area seller management terpisah dari katalog aktif.

Auto archive SOLD_OUT mengikuti setting store (Auto Archive):

- Never (default, `null`)
- 1 hari
- 7 hari
- 30 hari
- 90 hari
- 180 hari
- 360 hari

TIDAK ada opsi "Tidak ada" maupun nilai 365 hari.

Bukan pilihan durasi per-product.

Reactivation dari SOLD_OUT:

SOLD_OUT
   │
   ▼
PUBLISHED

Langsung ke PUBLISHED (label aksi "Publish Kembali"),

ATAU turun ke DRAFT untuk diedit sebelum republish:

SOLD_OUT
   │
   ▼
DRAFT

Archived terpisah:

Archived Products
      │
      ▼
 Archived Products

Restore dari Archived:

ARCHIVED
   │
   ▼
Restore
   │
   ▼
DRAFT

Restore tidak langsung menjadi Published.

23. Customer Interest Flow

Customer Interest hanya mencatat:

WhatsApp Click
Marketplace Click

Tidak mencatat:

Product View
Share
Login
Logout
Category activity
Store Visit
Generic browsing

Customer identity display:

Email account → email
Phone account → phone

Flow:

Dashboard Customer Interest
          │
          ▼
Customer Interest Page
          │
          ├── Customer
          ├── Product
          ├── Channel
          └── Date / Time

Satu customer dapat memiliki beberapa activity.

Contoh:

Customer A
 ├── WhatsApp → Product A
 ├── Shopee   → Product A
 └── Website  → Product B

Activity tersebut tetap berasal dari customer yang sama.

Customer Interest bukan CRM penuh.

Total Interest berarti total record interaksi, bukan jumlah customer unique.

Self-Store Exclusion:

Activity owner di store miliknya sendiri TIDAK membuat Customer Interest:

seller klik WhatsApp store sendiri → TIDAK
seller klik Marketplace store sendiri → TIDAK
seller buka Product Detail store sendiri → TIDAK
seller share store/product sendiri → TIDAK

Frontend harus menghindari pencatatan.

Backend diharapkan juga menegakkan rule ownership.

Detail Customer Interest menampilkan:

Customer
Product
Activity
Time
Customer interaction history

Action detail:

Lihat Product → membuka product detail customer-facing di /{storeId}/product/{productId}/{slug}
Tutup → menutup detail

Jangan menyediakan aksi kontak customer seperti:

Hubungi Customer
Buka WhatsApp Customer
Buka Marketplace
Buka Channel

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

- STORE (Store Landing)
- PRODUCT (Product Detail)

Membedakan aktivitas yang berasal dari Store Landing dan Product Detail.

Records tetap tampil meskipun channel dihapus dari konfigurasi store.

24. Recent Activity Flow

Recent Activity dibuat oleh backend; frontend hanya mengonsumsi (tidak ada `POST /activities`).

Activity:

Product Published
Product Updated
Product Sold Out
Product Reactivated
Product Archived
Product Restored
Category Created
Category Updated
Announcement Created
Announcement Updated
Store Updated

Dashboard menampilkan 4 aktivitas terbaru (newest first).

Halaman /seller/activities menyediakan filter:

activity type
date TANGGAL TUNGGAL (single date), bukan date range

Pemilihan tanggal menggunakan date picker, bukan input teks manual.

Date display:

12.09.2026

Datetime display:

12.09.2026 · 18:02

Tanpa weekday.

Flow:

Dashboard
    │
    ▼
Recent Activity
    │
    ▼
Lihat Semua
    │
    ▼
/seller/activities

Halaman /seller/activities adalah list Recent Activity lengkap.

Halaman tersebut menyediakan "Kembali" ke Dashboard.

Recent Activity merupakan summary/timeline.

Customer activity tidak dimasukkan ke Recent Activity.

25. Products Flow

Route:

/seller/products

Flow:

Products
   │
   ├── Search
   ├── Filter
   │
   ├── Add Product
   │      └── Add Product
   │
   ├── View Product
   │      └── Public Product Detail
   │
   ├── Edit
   │      └── Edit Product
   │
   ├── Archive
   │      └── Archived
   │
   ├── Sold Out
   │      └── SOLD_OUT
   │
   └── Product Unggulan

Tidak ada Sort pada halaman Seller Products.

Status tab "Active" pada halaman Seller Products menggunakan label dashboard (Active Products) dan berarti produk PUBLISHED, bukan status lifecycle baru.

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

Seller management ordering:

Featured terlebih dahulu, kemudian produk yang lebih baru sebelum yang lebih lama.

### Product Status Actions (Seller)

Tindakan yang tersedia per status pada seller management (list Products / Archived):

- PUBLISHED (Active): Lihat Product, Edit, Archive, Feature / Unfeature
- DRAFT: Edit, Publish, Archive
  - Tidak ada aksi Lihat Product pada DRAFT.
  - DRAFT tidak pernah Product Unggulan, jadi tidak ada aksi Feature/Unfeature.
- SOLD_OUT: Lihat Product, Publish Kembali, Archive
  - Reaktivasi SOLD_OUT menggunakan label aksi seller "Publish Kembali".
  - Reaktivasi ke PUBLISHED TIDAK mengubah status Product Unggulan (bila masih SOLD_OUT dengan featured, status tetap berlanjut).
- ARCHIVED (halaman Archive): Detail Product, Restore
  - Halaman Archive TIDAK memiliki aksi "Lihat Product".
  - Aksi archive adalah "Detail Product" yang membuka tampilan read-only product archived.
  - Restore tersedia dari menu aksi pada list, mengubah ARCHIVED → DRAFT.

### Product Sold Out Flow

Published
   │
   ▼
Mark Sold Out
   │
   ▼
SOLD_OUT
   │
   ├── (Jika melewati threshold auto archive store) → ARCHIVED
   │
   └── (Publish Kembali)
            │
            ▼
         PUBLISHED

SOLD_OUT juga dapat kembali ke DRAFT untuk diedit sebelum republish:

SOLD_OUT
   │
   ▼
DRAFT
   │
   ▼
PUBLISHED

Reactivation dari SOLD_OUT langsung ke PUBLISHED menggunakan label aksi "Publish Kembali".

Reaktivasi ke PUBLISHED TIDAK mengubah status Product Unggulan.

Product yang berubah menjadi SOLD_OUT TETAP mempertahankan status Product Unggulan.

Auto archive adalah setting store-level, bukan pilihan per-product.

Mekanisme scheduling/penerapan auto archive backend tidak ditentukan di sini.
26. Add Product Flow

Route:

/seller/products/new

Add Product merupakan full page.

Sections:

Photos
Product Name
Category
Brand
Product Details
Description
Condition
Price
Product CTA (Call-to-Action): selection satu opsi dari Store CTA Options (Beli | Tawar | label kustom; default Beli) — bukan definisi baru
External Product Links / Destinations
Product Unggulan

Actions:

Save as Draft
Publish Product
27. Save Draft Flow

Draft tidak harus memenuhi seluruh required publish fields.

Add Product
     │
     ▼
Save as Draft
     │
     ▼
Validate basic form state
     │
     ▼
Save
     │
     ▼
Products

Status:

DRAFT
28. Publish Product Flow

Publish membutuhkan:

Product Name
Product Photo (minimum 1)
Category
Product Details
Description
Condition
Price

Optional:

Brand
Product CTA (Call-to-Action) — selection opsi (default `BUY`/"Beli" selalu tersedia, tidak memblokir Publish)
External Product Links / Destinations
Product Unggulan

Flow:

Add Product
     │
     ▼
Publish Product
     │
     ▼
Validation
     │
 ┌───┴────┐
 │        │
Error   Valid
 │        │
 ▼        ▼
Show    Publish
Errors    │
          ▼
       Products

Published status:

PUBLISHED
29. Edit Product Flow

Route:

/seller/products/:productId/edit

Edit Product menggunakan UI/form yang sama dengan Add Product.

Actions Edit Product hanya:

Batal
Simpan

Tidak ada Publish Product atau Save Draft di dalam Edit Product.

Perbedaan:

Add Product
     └── Empty Form

Edit Product
     └── Prefilled Form

Flow:

Products
   │
   ▼
Edit
   │
   ▼
Edit Product
   │
   ├── Batal
   │        └── Kembali ke Products (tanpa activity)
   │
   └── Simpan
            │
            ▼
        Persist
            │
        ┌───┴────┐
        │        │
     Gagal    Berhasil
        │        │
        ▼        ▼
   Error     Product Updated
        │        │
        ▼        ▼
  Tetap     Products
  (tanpa activity)

Activity Product Updated (PRODUCT_UPDATED) dibuat oleh backend ketika Simpan berhasil dipersist; frontend tidak membuat activity sendiri (tidak ada `POST /activities`).

Tidak ada activity untuk:

membuka form edit
perubahan belum disimpan
Batal/Cancel
validation failure
request API gagal
30. Archive Product Flow
Products
   │
   ▼
Archive
   │
   ▼
Confirmation
   │
   ▼
ARCHIVED
   │
   ▼
Archived Products

Product tidak dihapus secara permanen melalui flow archive.

Archived Products view menyediakan action:

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

Auto Archive:

- setting level store yang UI-nya terletak pada halaman Archive.
- nilai: Never (default, `null`) / 1 hari / 7 hari / 30 hari / 90 hari / 180 hari / 360 hari.
- TIDAK ada opsi "Tidak ada" maupun nilai 365 hari.
- perubahan diterapkan dari popover pada halaman Archive, bukan pada My Store.

31. Restore Product Flow
Archived Products
      │
      ▼
Restore
      │
      ▼
DRAFT
      │
      ▼
Products

Product yang di-restore tidak otomatis Published.

32. Category Flow

Route:

/seller/categories

Category mendukung maksimal dua level:

Kategori Utama
   └── Sub Kategori

Terminology user-facing:

Kategori Utama
Sub Kategori

Jangan menggunakan "Parent Category" pada user-facing UI.

Product hanya memiliki satu category.

Seller dapat:

melihat category
membuat Kategori Utama baru langsung dari form pembuatan category
membuat Sub Kategori
mengedit category
menghapus category jika tidak digunakan product

Setiap category memiliki "Lihat Produk" yang mengarah ke:

/seller/products?category=...

Category product filtering menggunakan URL query sebagai source of truth.

Jika category masih digunakan product atau Kategori Utama masih memiliki child:

Delete Category
      │
      ▼
Blocked
      │
      ▼
Show Explanation

Tidak ada cascade delete.

Penghitungan penggunaan product kategori:

Kategori Utama count mencakup seluruh product di descendant-nya (Sub Kategori).

Contoh:

Computer (5)
  └── Laptop (3)
  └── Desktop (2)

Computer = aggregate usage 5 product.

33. Brand Management Flow

Route:

/seller/categories (section terpisah Brand) atau halaman Brand Management dedicated sesuai rute.

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

Delete brand:

Delete Brand
      │
      ▼
Jika usage = 0 → Deleted
      │
Jika usage > 0 → Blocked + Show Explanation

Tidak ada cascade delete ke product.

Seller dapat membuat brand langsung dari Add/Edit Product.

34. My Store Flow

Route:

/seller/my-store

My Store digunakan untuk melengkapi dan mengelola informasi store.

Fields:

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
Store CTA Options (BUY "Beli" + BARGAIN "Tawar" permanent default; seller dapat menambah opsi CUSTOM berlabel kustom)
Announcement

Auto Archive TIDAK berada di My Store. Auto Archive terletak pada halaman Archive.

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

My Store menampilkan Store Link yang diturunkan dari Store ID saat ini.

Store Link berada di bawah Store ID.

Actions Store Link:

Salin
Bagikan

Tidak ada QR Code.

Jika Store ID berubah, Store Link ikut berubah.

Location dipilih dengan urutan: Province dahulu, kemudian City/Regency yang scoped ke province tersebut.

Flow:

My Store
   │
   ▼
Edit Information
   │
   ▼
Save
   │
   ▼
Store Updated

Store Updated dapat muncul pada Recent Activity.

Perubahan pada My Store bersifat draft sampai tombol Simpan diklik.

Jika ada perubahan yang belum disimpan dan seller mencoba navigasi keluar, tampilkan konfirmasi sebelum keluar.

Pada mobile, judul halaman My Store ditampilkan centered.

35. Store ID Change Flow
My Store
   │
   ▼
Edit Store ID
   │
   ▼
Check 30-day restriction
   │
 ┌─┴──────────────┐
 │                │
Allowed        Not Allowed
 │                │
 ▼                ▼
Change ID       Block Change
 │                │
 ▼                ▼
Save            Show Restriction

Jika Store ID berhasil diubah, public URL store ikut berubah.

Store ID lama tetap menjadi valid alias yang redirect ke Store ID saat ini selama 90 hari sejak perubahan, lalu kedaluwarsa.

Setiap historical Store ID menuju store yang sama (redirect) selama jendela 90 hari; alias tidak permanen.

Historical aliases adalah behavior backend-owned.

Frontend tidak memelihara alias mapping sendiri.

Availability Store ID diperiksa kembali pada saat submit.

Format Store ID: huruf kecil, angka, dan tanda hubung (-); diawali dan diakhiri karakter alfanumerik; tanpa tanda hubung berurutan; di-trim.

36. External Sales Channel Flow

Seller dapat menambahkan channel eksternal secara bebas.

Contoh:

Shopee
Tokopedia
Website
Instagram
Custom Website

Struktur:

name
url

Tidak menggunakan daftar marketplace yang hardcoded.

Flow:

My Store
   │
   ▼
External Sales Channels
   │
   ├── Add Channel
   │      ├── Name
   │      └── URL

   ├── Edit Channel
   │
   └── Remove Channel

Add/Edit Channel TIDAK menggunakan dropdown.

Pemilihan channel menggunakan pola "Tambah External" yang reusable:

- Desktop: modal.
- Mobile: bottom sheet.
- Item hasil tambah ditampilkan dengan icon + name + URL + tombol remove.

Pola yang sama dipakai oleh Product External Links (Add/Edit Product).

Product External dan Store External adalah konsep yang terpisah, meskipun berbagi komponen UI yang sama.

Channel yang dikonfigurasi seller akan muncul pada:

Store Landing
External channels store tidak muncul pada Product Detail
(batasan: Product Detail hanya menampilkan CTA destination product)
37. Profile Flow

Route:

/seller/account

Terminology UI menggunakan "Profile".

Route tetap /seller/account.

User dapat mengelola informasi account pada Profile.

Profile photo/avatar seller bersifat optional.

Customer tidak menggunakan uploaded profile photo pada UI customer.

### Change Password

Change-password flow membutuhkan input email terlebih dahulu.

Flow:

Profile
   │
   ▼
Change Password
   │
   ▼
Input Email
   │
   ▼
Lanjutkan flow recovery/change password

Customer phone-registered harus memiliki recovery email untuk flow ini.

Mekanisme teknis OTP/token tidak ditentukan di sini — needs backend confirmation.

Urutan halaman:

1. Informasi Akun Kamu
2. Ringkasan Toko

Ringkasan Toko tetap ada dan tidak diduplikasi.

Profile diakses melalui User/Account Card pada bagian bawah sidebar seller.

Tidak ada item "Profile" terpisah pada sidebar desktop.

38. Seller Navigation Flow
Desktop

Sidebar reusable:

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

User/Account Card merupakan akses ke halaman Profile (/seller/account).

Logout berada langsung di bawah account card.

Semua seller page menggunakan sidebar yang sama.

Mobile

Bottom navigation berisi:

Dashboard
Products
Customer Interest

Fitur lain berada di:

More

More:

Recent Activity
My Store
Categories
Profile
Logout

Bottom Navigation dan More harus reusable.

39. Authentication Context Preservation

Jika guest melakukan action yang membutuhkan login:

Guest Action
     │
     ▼
Login/Register
     │
     ▼
Authentication Success
     │
     ▼
Return to Original Context

Contoh:

Store Product A
      │
      ▼
WhatsApp
      │
      ▼
Login
      │
      ▼
Return to Product A
      │
      ▼
Continue WhatsApp

Context tidak boleh hilang setelah authentication.

40. Empty States

UI harus menangani minimal:

Empty Store

Store belum memiliki product yang dapat ditampilkan.

Empty Search

Search tidak menemukan product.

Empty Product

Seller belum memiliki product.

Empty Archived

Belum ada product archived.

Empty Customer Interest

Belum ada WhatsApp/Marketplace activity.

Empty Category

Belum ada category custom yang dibuat seller.

Empty state harus memberikan informasi yang jelas dan tidak menampilkan data dummy sebagai data nyata.

41. Error & Loading Flow

Semua operasi asynchronous harus memiliki state:

Idle
  ↓
Loading
  ↓
Success
  atau
Error

Contoh:

Publish Product
      │
      ▼
   Loading
      │
 ┌────┴────┐
 │         │
Success   Error
 │         │
 ▼         ▼
Products  Error Message

Tidak boleh membuat user mengira action berhasil jika request gagal.

42. Responsive UX Flow

Desktop dan mobile menggunakan flow bisnis yang sama.

Yang berbeda hanya presentation/interactions.

Desktop

Contoh:

Filter → Popover / Inline
Marketplace / Destination → Modal
CTA + Share → rasio 70 : 30
Sidebar → Fixed Sidebar
Mobile

Contoh:

Filter → Bottom Sheet
Marketplace / Destination → Bottom Sheet
CTA + Share → rasio 70 : 30
Navigation → Bottom Navigation + More
Store actions → floating action bar (hidden saat footer masuk viewport); Share di floating bar desktop & mobile

Business logic tidak boleh diduplikasi hanya karena perbedaan responsive UI.

43. UX Rules yang Harus Dipertahankan
Guest boleh browsing store tanpa login.
Login/register hanya diwajibkan untuk activity yang membuat Customer Interest.
WhatsApp Click membuat Customer Interest.
Marketplace Click membuat Customer Interest.
Product View tidak membuat Customer Interest.
Share tidak membuat Customer Interest.
Share tidak membutuhkan login.
Tidak ada QR Code.
Marketplace channel menunjuk ke shared channel master (CMS): mock persis Shopee/Tokopedia/Lazada + custom store-scoped `CUSTOM:`; TikTok Shop/Blibli hanya hint display (`destinationPresets`); icon/logo = mapping frontend-owned, bukan requirement backend V1.
Store ID tidak ditampilkan secara visual pada Store Landing.
Product Detail TIDAK memiliki footer.
Product Detail actions = CTA (primary) + Share (secondary), rasio 70 : 30. Desktop: inline di info card. Mobile: floating action bar terpaku di dasar viewport (pola sama dengan floating action bar Store Landing).
CTA TIDAK menggunakan WhatsApp maupun Marketplace (store channels).
CTA membuka menu destination product; destination TIDAK memakai dropdown (modal desktop / bottom sheet mobile).
CTA tidak tersedia jika destination external product kosong (tidak ada fallback).
Gallery Product Detail menyediakan "Lihat Full" (overlay hitam, swipe horizontal, close ×).
Store Landing actions menggunakan floating action bar (WhatsApp + Marketplace + Share, desktop & mobile; Share TIDAK di navbar).
Floating action bar hidden ketika footer Store Landing masuk viewport.
Storefront Footer compact: Store Name + Description, WhatsApp/Contact, external channels, Full Address jika ada; TANPA Store Logo dan TANPA Tentang Kataloga; baris bawah satu baris centered `© 2026 Kataloga · Made with Kataloga` ("Made with Kataloga" clickable menuju `/`).
Entry `/seller` = gateway: guest → /login; auth tanpa store → /create-store; auth dengan store → /seller/dashboard.
CTA internal types: BUY / BARGAIN / CUSTOM; label UI: Beli / Tawar / label kustom. CTA adalah opsi store (Store CTA Options); product memilih tepat satu opsi (default BUY/"Beli") dan TIDAK membuat definisi CTA baru. CTA tidak berisi daftar destination; klik CTA membuka menu berisi SEMUA External Product Links.
Scroll tidak membuat route baru untuk action floating maupun fullscreen gallery.
Store ID tidak ditampilkan secara visual pada Store Landing.
Store ID dapat berubah maksimal sekali setiap 30 hari.
Store ID maksimal 50 karakter.
Historical Store ID menjadi valid alias yang redirect ke Store ID saat ini selama 90 hari sejak perubahan, lalu kedaluwarsa (backend-owned, tidak permanen).
Restore Archived Product selalu menjadi Draft.
Reactivation SOLD_OUT langsung ke PUBLISHED (label aksi seller: "Publish Kembali"), atau turun ke DRAFT untuk diedit sebelum republish.
Sold out auto archive: setting store-level dengan nilai Never (default, `null`) / 1 hari / 7 hari / 30 hari / 90 hari / 180 hari / 360 hari; jika melewati threshold → ARCHIVED. TIDAK ada opsi "Tidak ada" maupun nilai 365 hari.
UI Auto Archive berada di halaman Archive, bukan di My Store.
Active Products = Published.
Produk SOLD OUT tetap dapat dilihat pelanggan.
Draft dihitung terpisah.
Archived dipisahkan dari Active Products.
Sold Out adalah product lifecycle status, bukan availability field.
Feature hanya dapat diaktifkan/dinonaktifkan pada product status PUBLISHED atau SOLD_OUT.
DRAFT tidak pernah Product Unggulan.
Product ARCHIVED tidak pernah Product Unggulan.
Archiving otomatis menghapus status Product Unggulan.
Product yang berubah menjadi SOLD_OUT TETAP mempertahankan status Product Unggulan (is_featured tetap).
Reaktivasi SOLD_OUT ke PUBLISHED TIDAK mengubah status Product Unggulan.
Maksimum 10 Product Unggulan per store.
Katalog aktif hanya berisi PUBLISHED dan SOLD_OUT yang masih dalam jendela auto archive.
Product Details bersifat opsional untuk Publish.
Description wajib untuk Publish.
Price bernilai 0 (gratis) valid untuk Publish.
Product tidak menggunakan stock quantity.
Product hanya memiliki satu category.
Category maksimal dua level pada V1.
Customer Interest bukan CRM.
Customer Interest direkam agregat (key: store + customer + product + context + channel; field total_clicks, first/last_activity_at, context STORE|PRODUCT; TIDAK ada channel_type).
Destination WhatsApp/Marketplace hanya dibuka SETELAH pencatatan Customer Interest sukses.
Identity Customer Interest: email account → email; phone account → phone.
Activity owner di store miliknya sendiri TIDAK membuat Customer Interest.
Recent Activity bukan Customer Activity.
Recent Activity dibuat oleh backend; frontend hanya mengonsumsi (tidak ada `POST /activities`).
Recent Activity berisi 11 tipe: Product Published, Product Updated, Product Sold Out, Product Reactivated, Product Archived, Product Restored, Category Created, Category Updated, Announcement Created, Announcement Updated, Store Updated.
Dashboard Recent Activity menampilkan 4 terbaru.
/seller/activities memiliki filter activity type dan date (TANGGAL TUNGGAL, menggunakan date picker, bukan input teks manual).
Edit Product hanya Batal dan Simpan.
Change-password membutuhkan input email terlebih dahulu.
Register via email membutuhkan email verification; register via phone aktif tanpa verification.
Seller navigation menggunakan reusable components.
Add Product dan Edit Product menggunakan reusable ProductForm.
Responsive UI tidak mengubah business flow.
Jangan membuat route baru untuk state/interaksi yang seharusnya berada di halaman existing.

```text
                    KATALOGA
                       │
          ┌────────────┴────────────┐
          │                         │
       CUSTOMER                   SELLER
          │                         │
    ┌─────┴─────┐             ┌─────┴──────┐
    │           │             │            │
   Guest     Logged-in      Dashboard    My Store
    │           │             │            │
    ▼           ▼             ▼            ▼
Store Landing  Interest    Products      Store Info
    │                         │
    ▼                         ▼
Product Detail          Add / Edit / Archive
    │
 ┌──┴──────────────┐
 │                 │
CTA (Beli/        Share
Tawar/Custom)
 │
 ▼
Destination list → Customer Interest
(field channel = destination dipilih)