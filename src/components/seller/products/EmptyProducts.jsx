import { Link } from 'react-router-dom'
import EmptyState from '../../shared/EmptyState'

const VARIANTS = {
  none: {
    icon: 'inventory_2',
    title: 'Belum ada produk aktif',
    description:
      'Mulai katalog kamu dengan menambah product. Lengkapi Informasi Toko di My Store agar storefront tampil maksimal dan mudah dihubungi customer.',
  },
  draft: {
    icon: 'description',
    title: 'Belum ada draft',
    description:
      'Produk yang belum selesai dan disimpan sebagai draft akan tampil di tab ini.',
  },
  search: {
    icon: 'search_off',
    title: 'Tidak ada produk yang ditemukan.',
    description:
      'Coba ubah kata kunci pencarian atau reset filter untuk menampilkan produk lainnya.',
  },
  archived: {
    icon: 'archive',
    title: 'Belum ada produk yang diarsipkan',
    description:
      'Produk yang kamu arsipkan akan tersimpan di sini dan bisa direstore ke draft kapan saja.',
  },
}

/**
 * Empty states for the products list / archived page.
 * The `none` variant (no active products) shows two default CTAs:
 * "+ Tambah Product" and "Lengkapi Informasi Toko" (My Store).
 * @param {{ variant: 'none'|'draft'|'search'|'archived', action?: import('react').ReactNode }} props
 */
function EmptyProducts({ variant = 'none', action }) {
  const content = VARIANTS[variant]

  const defaultAction =
    variant === 'none' ? (
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:justify-center">
        <Link
          to="/seller/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
        >
          + Tambah Product
        </Link>
        <Link
          to="/seller/my-store"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            storefront
          </span>
          Lengkapi Informasi Toko
        </Link>
      </div>
    ) : (
      <Link
        to="/seller/products/new"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          add
        </span>
        Tambah Produk
      </Link>
    )

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
      <EmptyState
        icon={content.icon}
        title={content.title}
        description={content.description}
        action={action ?? defaultAction}
      />
    </div>
  )
}

export default EmptyProducts