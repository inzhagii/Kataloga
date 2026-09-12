# KATALOGA — AI Coding Agent Instructions

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
/{storeId}/products/{productId}

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

Dashboard
Products
Categories
Customer Interest
My Store
Profile
Logout

Jangan membuat sidebar berbeda-beda untuk setiap halaman.

Gunakan satu component:

SellerSidebar

Mobile menggunakan:

BottomNavigation
MoreMenu / MoreSheet

3 fitur utama berada di bottom navigation.

Fitur lainnya berada di More.

10. Product Rules

Product status:

DRAFT
PUBLISHED
SOLD_OUT
ARCHIVED

Jangan menggunakan ACTIVE sebagai database status.

Lifecycle:

DRAFT → PUBLISHED → SOLD_OUT → PUBLISHED
PUBLISHED → ARCHIVED
ARCHIVED → DRAFT

SOLD_OUT adalah lifecycle status, BUKAN availability field.

Storefront/catalog aktif hanya berisi produk PUBLISHED.

SOLD_OUT dan DRAFT tidak termasuk katalog aktif.

Dashboard:

Active Products = PUBLISHED

SOLD_OUT count terpisah.

Draft terpisah.

Restore:

ARCHIVED → DRAFT

Bukan:

ARCHIVED → PUBLISHED
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
Featured

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

Jangan memakai perilaku lama "Sold Out tetap ditampilkan" di katalog/storefront.

Katalog/catalog aktif hanya berisi produk PUBLISHED.
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

Setiap category memiliki "Lihat Product".

"Lihat Product" mengarah ke:

/seller/products?category=...

Category filter pada seller products menggunakan URL query sebagai source of truth.

Category yang masih digunakan product tidak boleh dihapus.

Kategori Utama yang masih memiliki child tidak boleh dihapus.

Tidak ada cascade delete.

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

Marketplace activity harus menyimpan channel yang dipilih.

Contoh:

Customer A
Product: Laptop XYZ
Channel: Shopee
Date: ...

Customer yang sama dapat memiliki beberapa activity.

Jangan membuat customer record baru untuk setiap activity.

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

20. Recent Activity

Recent Activity seller hanya mencakup:

Product Published
Product Edited
Store Updated

Dashboard menampilkan "Lihat Semua".

Lihat Semua membuka route:

/seller/activities

Halaman tersebut adalah list Recent Activity lengkap dan menyediakan "Kembali" ke Dashboard.

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

23. Public Store URL

Format:

/{storeId}

Product:

/{storeId}/products/{productId}

productId adalah public numeric product ID.

Contoh:

/toko-komputer-jaya
/toko-komputer-jaya/products/20
24. Store Landing

Store Landing harus:

responsive,
clean,
easy to scan,
focused on catalog.

Desktop actions:

WhatsApp
Marketplace
Share

Mobile:

WhatsApp
Marketplace + Share

Store ID tidak ditampilkan.

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

28. Product Card

Product card menampilkan:

Condition badge
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
Sold Out state (SOLD_OUT tidak muncul di katalog aktif)

29. Product Detail

Hierarchy:

Product Name
Price
Brand / Category / Condition
Actions
Product Details
Description

Actions:

WhatsApp
Marketplace
Share

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

SOLD_OUT count terpisah.

Bukan database status baru.

51. Development Workflow

Kerjakan Kataloga secara incremental.

Urutan umum:

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
→ My Store
→ Customer Interest
→ Recent Activity (incl. /seller/activities)
→ Profile
→ API Integration
→ Validation
→ Testing
→ Visual QA

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


