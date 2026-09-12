import { Link } from 'react-router-dom'
import EmptyState from '../../shared/EmptyState'

const VARIANTS = {
  none: {
    icon: 'inventory_2',
    title: 'Belum ada produk aktif',
    description:
      'Produk yang kamu publish atau simpan sebagai draft akan muncul di sini.',
  },
  draft: {
    icon: 'description',
    title: 'Belum ada draft',
    description:
      'Produk yang belum selesai dan disimpan sebagai draft akan tampil di tab ini.',
  },
  search: {
    icon: 'search_off',
    title: 'Tidak ada hasil',
    description:
      'Coba ubah kata kunci pencarian atau atur ulang filter untuk hasil lainnya.',
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
 * @param {{ variant: 'none'|'draft'|'search'|'archived', action?: import('react').ReactNode }} props
 */
function EmptyProducts({ variant = 'none', action }) {
  const content = VARIANTS[variant]

  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm">
      <EmptyState
        icon={content.icon}
        title={content.title}
        description={content.description}
        action={
          action ?? (
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
        }
      />
    </div>
  )
}

export default EmptyProducts