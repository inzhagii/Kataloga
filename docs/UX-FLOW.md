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
       ┌─────┼─────────────┐
       │     │             │
       ▼     ▼             ▼
    Search  Product      Share Store
       │     Detail
       │       │
       │   ┌───┼──────────────┐
       │   │   │              │
       │   ▼   ▼              ▼
       │ WhatsApp Marketplace Share
       │   │   │
       │   └───┴──► Login/Register
       │
       ▼
    Product
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

Fields:

Email/Phone
Password
Re-password
Customer Name optional

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

kataloga.com/{storeId}

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

Pada Store Landing, Store ID tidak ditampilkan sebagai informasi visual.

Contoh URL:

kataloga.com/toko-komputer-jaya
9. Customer Store Landing Flow

Route:

/{storeId}

Customer membuka store melalui link yang dibagikan seller.

Flow utama:

Store Landing
    │
    ├── Search
    │
    ├── Filter
    │
    ├── Sort
    │
    ├── Product Card
    │      └── Product Detail
    │
    ├── WhatsApp
    │
    ├── Marketplace
    │
    └── Share Store
10. Store Landing — Search Flow

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

Store Landing
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

11. Store Landing — Filter Flow

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

Tidak ada filter:

Price
Attribute

12. Store Landing — Sort Flow

Sort options:

Relevance
Newest
Price Low → High
Price High → Low

Tidak ada availability grouping/ordering.

Selected sort diterapkan langsung pada seluruh product di katalog aktif.

13. Store Landing — Product Card Flow

Product card menampilkan:

Condition badge
Product image
Product name
Category
Price
Lihat Detail
Share icon

Condition:

NEW
SECOND

Catalog aktif hanya berisi produk PUBLISHED.

Produk SOLD_OUT tidak tampil di katalog aktif.

Tidak ada tampilan availability pada Product Card.

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

/{storeId}/products/{productId}

Flow:

Product Detail
      │
      ├── Product Information
      │
      ├── Product Details
      │
      ├── Description
      │
      ├── WhatsApp
      │
      ├── Marketplace
      │
      └── Share

Hierarchy utama:

Product Name
      ↓
Price
      ↓
Brand / Category / Condition
      ↓
Actions
      ↓
Technical Details
      ↓
Description
15. Product Detail — WhatsApp Flow

Saat user menekan:

Contact via WhatsApp

System melakukan auth check.

Guest
WhatsApp
   │
   ▼
Auth Check
   │
   ▼
Guest
   │
   ▼
Login / Register
   │
   ▼
Preserve Product Context
   │
   ▼
Return to Product
   │
   ▼
Continue WhatsApp

Context product harus tetap dipertahankan setelah login/register.

Logged-in User
WhatsApp
   │
   ▼
Auth Check
   │
   ▼
Authenticated
   │
   ▼
Create Customer Interest
   │
   ▼
Open WhatsApp

Customer Interest:

channelType = WHATSAPP_CLICK

Product View tidak dicatat sebagai Customer Interest.

16. Product Detail — Marketplace Flow

Marketplace tidak langsung melakukan auth check.

Pertama tampilkan channel yang dikonfigurasi seller.

Desktop:

Marketplace
     │
     ▼
Popover / Dropdown
     │
     ├── Channel A
     ├── Channel B
     └── Channel C

Mobile:

Marketplace
     │
     ▼
Bottom Sheet
     │
     ├── Channel A
     ├── Channel B
     └── Channel C

Tidak menggunakan marketplace icon/logo.

Channel hanya memiliki:

name
url
Setelah channel dipilih
Selected Channel
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

Customer Interest menyimpan channel yang dipilih.

Contoh:

channelType = MARKETPLACE_CLICK
channelName = "Shopee"

Nama channel harus menggunakan channel yang dipilih user, bukan nama generic seperti "Marketplace".

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

Store dapat memiliki satu active announcement.

Flow:

Store Landing
     │
     ▼
Announcement
     │
     ├── Collapsed
     │
     └── Expanded

Announcement dapat berisi beberapa informasi.

Tidak menggunakan carousel.

20. Seller Entry Flow

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

Prioritas informasi:

1. Catalog Condition
2. Customer Interest
3. Recent Activity
4. Quick Actions

Flow:

Dashboard
   │
   ├── Active Products
   │       └── Products
   │
   ├── Archived Products
   │       └── Archived Products
   │
   ├── Customer Interest
   │       └── Customer Interest Page
   │
   ├── Recent Activity
   │       └── Lihat Semua
   │              └── /seller/activities
   │
   └── Quick Actions
22. Catalog Condition Flow

Active Products hanya:

Published

SOLD_OUT dan Draft dihitung terpisah.

Dashboard:

Active Products
      │
      ▼
   Products

SOLD_OUT merupakan area seller management terpisah dari katalog aktif.

Seller dapat mengembalikan product SOLD_OUT menjadi PUBLISHED.

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

Detail Customer Interest menampilkan:

Customer
Product
Activity
Time
Customer interaction history

Action detail:

Lihat Product → membuka product detail customer-facing di /{storeId}/products/{productId}
Tutup → menutup detail

Jangan menyediakan aksi kontak customer seperti:

Hubungi Customer
Buka WhatsApp Customer
Buka Marketplace
Buka Channel

24. Recent Activity Flow

Recent Activity hanya menampilkan aktivitas seller/store yang relevan.

Activity:

Product Published
Product Edited
Store Updated

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
   ├── Sort
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
   └── Featured
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
External Product Links
Featured

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
External Product Links
Featured

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
   ▼
Update
   │
   ▼
Products
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

Setiap category memiliki "Lihat Product" yang mengarah ke:

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
33. My Store Flow

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
Announcement

My Store menampilkan Store Link yang diturunkan dari Store ID saat ini.

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

34. Store ID Change Flow
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

Availability Store ID diperiksa kembali pada saat submit.

Format Store ID: huruf kecil, angka, dan tanda hubung (-); diawali dan diakhiri karakter alfanumerik; tanpa tanda hubung berurutan; di-trim.

35. External Sales Channel Flow

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
   │
   ├── Edit Channel
   │
   └── Remove Channel

Channel yang dikonfigurasi seller akan muncul pada:

Store Landing
Product Detail jika product memiliki external product link
36. Profile Flow

Route:

/seller/account

Terminology UI menggunakan "Profile".

Route tetap /seller/account.

User dapat mengelola informasi account pada Profile.

Profile photo/avatar seller bersifat optional.

Customer tidak menggunakan uploaded profile photo pada UI customer.

37. Seller Navigation Flow
Desktop

Sidebar reusable:

Dashboard
Products
Categories
Customer Interest
My Store
Profile
Logout

Semua seller page menggunakan sidebar yang sama.

Mobile

Bottom navigation berisi tiga fitur utama.

Fitur lain berada di:

More

More:

Categories
My Store
Profile
Logout

Bottom Navigation dan More harus reusable.

38. Authentication Context Preservation

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

39. Empty States

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

40. Error & Loading Flow

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

41. Responsive UX Flow

Desktop dan mobile menggunakan flow bisnis yang sama.

Yang berbeda hanya presentation/interactions.

Desktop

Contoh:

Filter → Popover / Inline
Marketplace → Dropdown / Popover
Sidebar → Fixed Sidebar
Mobile

Contoh:

Filter → Bottom Sheet
Marketplace → Bottom Sheet
Navigation → Bottom Navigation + More

Business logic tidak boleh diduplikasi hanya karena perbedaan responsive UI.

42. UX Rules yang Harus Dipertahankan
Guest boleh browsing store tanpa login.
Login/register hanya diwajibkan untuk activity yang membuat Customer Interest.
WhatsApp Click membuat Customer Interest.
Marketplace Click membuat Customer Interest.
Product View tidak membuat Customer Interest.
Share tidak membuat Customer Interest.
Share tidak membutuhkan login.
Tidak ada QR Code.
Marketplace channel bersifat arbitrary.
Marketplace channel tidak menggunakan icon/logo.
Store ID tidak ditampilkan secara visual pada Store Landing.
Store ID dapat berubah maksimal sekali setiap 30 hari.
Restore Archived Product selalu menjadi Draft.
Active Products = Published.
SOLD_OUT dihitung terpisah.
Draft dihitung terpisah.
Archived dipisahkan dari Active Products.
Sold Out adalah product lifecycle status, bukan availability field.
Product Details wajib untuk Publish.
Description wajib untuk Publish.
Product tidak menggunakan stock quantity.
Product hanya memiliki satu category.
Category maksimal dua level pada V1.
Customer Interest bukan CRM.
Recent Activity bukan Customer Activity.
Recent Activity hanya Product Published, Product Edited, dan Store Updated.
Seller navigation menggunakan reusable components.
Add Product dan Edit Product menggunakan reusable ProductForm.
Responsive UI tidak mengubah business flow.
Jangan membuat route baru untuk state/interaksi yang seharusnya berada di halaman existing.

### Struktur flow utamanya sekarang jadi cukup jelas:

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
WhatsApp       Marketplace
 │                 │
 ▼                 ▼
Customer Interest