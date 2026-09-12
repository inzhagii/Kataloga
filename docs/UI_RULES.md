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

Tiga fitur utama berada di Bottom Navigation.

Fitur lainnya berada di More.

7. Seller Navigation

Desktop:

Dashboard
Products
Categories
Customer Interest
My Store

[ User / Account Card ]

Logout

Tidak ada item "Profile" terpisah pada sidebar utama.

User/Account Card pada sidebar adalah akses ke halaman Profile (/seller/account).

Logout berada langsung di bawah account card.

Mobile:

Bottom Navigation
├── Main Feature 1
├── Main Feature 2
└── Main Feature 3

More
├── Categories
├── My Store
├── Profile
└── Logout

Semua seller page harus menggunakan navigation component yang sama.

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
[Store Logo] [Store Name] [Address*] ... [Login] [Daftar]
Logged-in
[Store Logo] [Store Name] [Address*] ... [User Circle]

*Address menggunakan optional Full Address, compact, natural truncation/wrapping, bukan card besar.

WhatsApp/Contact dan Marketplace BUKAN action navbar pada Store Landing maupun Product Detail.

WhatsApp dan Marketplace tetap tersedia pada area konten/footer storefront yang sesuai.

Jangan menduplikasi Full Address secara tidak perlu pada area storefront yang menonjol.

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

WhatsApp:

[       WhatsApp       ]

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

Desktop:

[ WhatsApp ] [ Marketplace ] [ Share ]

Mobile:

[          WhatsApp          ]

[ Marketplace ] [   Share   ]

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

Produk Unggulan

Featured products ditampilkan dalam horizontal scrolling area.

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
│ Condition Badge     │
│                     │
│      Image          │
│                     │
├─────────────────────┤
│ Product Name        │
│ Category            │
│ Price               │
│                     │
│ [Lihat Detail]  ↗   │
└─────────────────────┘

Menampilkan:

Condition
Product Image
Product Name
Category
Price
Lihat Detail
Share icon

Tidak menampilkan:

Brand
WhatsApp
Marketplace
Contact Seller
17. Product Card — Condition

Condition badge:

NEW
SECOND

Badge berada pada area image.

18. Product Card — Sold Out

Catalog aktif hanya berisi produk PUBLISHED.

Produk SOLD_OUT tidak tampil di katalog aktif.

Tidak ada sold-out visual state pada Product Card.

SOLD_OUT hanya merupakan area seller management.

19. Product Grid

Desktop:

3 columns

Mobile:

2 columns

Grid harus tetap readable pada mobile.

20. Search UI

Search hanya mencari dalam current store.

Search harus selalu mudah ditemukan pada Store Landing.

Search state tidak menjadi page baru.

Search dapat menggunakan URL query parameter jika dibutuhkan.

Example:

/{storeId}?search=laptop
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
│                     │ Product Name         │
│                     │ Price                │
│ Product Gallery     │ Brand / Category     │
│                     │ Condition            │
│                     │ Actions              │
│                     │ Details              │
│                     │ Description          │
└─────────────────────┴──────────────────────┘

Gallery berada di kiri.

Product information berada di kanan.

26. Product Detail — Mobile

Urutan:

Gallery
   ↓
Product Name
   ↓
Product Information
   ↓
Price
   ↓
Actions
   ↓
Product Details
   ↓
Description

Long description menggunakan expand/collapse jika diperlukan.

27. Product Detail Hierarchy

Primary:

Product Name
Price

Secondary:

Brand
Category
Condition
Short Description

Third level:

Actions

Later information:

Product Details
Description
28. Sold Out — Product Status

Sold Out adalah product lifecycle status, bukan availability field.

Tidak ada field product availability pada UI V1.

Jangan gunakan:

Tersedia / Sold Out

sebagai availability display pada product.

Jangan gunakan:

Stok Siap Kirim

karena Kataloga tidak menggunakan stock quantity pada V1.

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

Dashboard menampilkan:

Active
Draft
Sold Out
Archived

Active Products berarti:

Published

SOLD_OUT dihitung terpisah.
Draft dihitung terpisah.
Archived terpisah.

Visual:

Card tetap berwarna putih.

Status colors adalah subtle accents/tints:

Active → subtle blue accent/tint
Draft → subtle amber/yellow accent/tint
Sold Out → subtle red accent/tint
Archived → subtle neutral/gray accent/tint

Rule:

"Status colors are subtle accents/tints while the main card background remains white."

Jangan menggunakan full-card strong blue/yellow/red/gray background.

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

Dashboard menampilkan summary.

Action:

Lihat Semua

mengarah ke:

/seller/customer-interest

Tidak membuat Customer Interest page kedua.

32. Recent Activity

Recent Activity hanya menampilkan:

Product Published
Product Edited
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

Dashboard menampilkan "Lihat Semua":

Lihat Semua
    ↓
/seller/activities

Halaman /seller/activities adalah list Recent Activity lengkap dan menyediakan "Kembali" ke Dashboard.

33. Quick Actions

Quick Actions merupakan shortcut ke fungsi utama seller.

Minimal mengarah ke:

Add Product
Products
My Store

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
Featured

Actions:

Save as Draft
Publish Product
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
Featured

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

SOLD_OUT dihitung terpisah pada seller management.
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

Archived Products view menyediakan:

Kembali

Kembali → /seller/products

Tidak membuat route baru.

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

Setiap category memiliki "Lihat Product" yang mengarah ke:

/seller/products?category=...

Category deletion harus dicegah jika masih digunakan product.

Kategori Utama yang masih memiliki child tidak dapat dihapus.

Tidak ada cascade delete.

### Collapse Semua

Desktop:

[ Cari category...                         Collapse Semua ]

"Collapse Semua" berada di sisi kanan search field pada baris yang sama.

Bukan baris/row yang terpisah.

Mobile tetap usable dan responsive.

Fungsi collapse, logika tree category, data model, dan categories.parent_id tidak berubah.

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

My Store menampilkan Store Link yang diturunkan dari Store ID saat ini.

Create Store tidak meminta semua field tersebut.

Create Store hanya:

Store Name
Store ID
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
horizontal scrolling untuk featured products
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
Sold Out → red
Archived → neutral/gray
Error → red
Success → green
Warning → amber/yellow
WhatsApp → darker/refined WhatsApp green

Jangan overuse warna semantik.

Gunakan hanya pada konteks yang sesuai.

Warna semantik adalah accents/tints, bukan strong full-card fill.