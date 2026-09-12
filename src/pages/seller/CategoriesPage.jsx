import { useMemo, useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import AlertDialog from '../../components/shared/AlertDialog'
import Toast from '../../components/shared/Toast'
import CategoryTree from '../../components/seller/categories/CategoryTree'
import CategoryFormModal from '../../components/seller/categories/CategoryFormModal'
import { useCategories } from '../../hooks/useCategories'
import { createCategory, updateCategory, deleteCategory } from '../../services/categoryService'

function StatCard({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-3.5 shadow-sm sm:p-4">
      <span
        className="material-symbols-outlined text-[22px] text-secondary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-on-surface">{value}</p>
        <p className="truncate text-[11px] text-secondary">{label}</p>
      </div>
    </div>
  )
}

function CategoriesPage() {
  const {
    status,
    error,
    categories,
    products,
    parents,
    childrenByParent,
    productCounts,
    reload,
  } = useCategories()

  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'create', category: null })
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [noticed, setNoticed] = useState(null)
  const [toast, setToast] = useState(null)

  const query = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    const matchedChildren = {}
    const visibleParents = query
      ? parents.filter((parent) => {
          const children = childrenByParent[parent.id] || []
          const parentMatch = parent.name.toLowerCase().includes(query)
          const childMatch = children.filter((child) => child.name.toLowerCase().includes(query))
          matchedChildren[parent.id] = childMatch
          return parentMatch || childMatch.length > 0
        })
      : parents
    if (!query) {
      parents.forEach((parent) => {
        matchedChildren[parent.id] = childrenByParent[parent.id] || []
      })
    }
    return { visibleParents, matchedChildren }
  }, [query, parents, childrenByParent])

  const stats = useMemo(() => {
    const subCount = categories.filter((category) => category.parentId !== null).length
    return {
      utama: categories.filter((category) => category.parentId === null).length,
      sub: subCount,
      totalProducts: String(products.length),
    }
  }, [categories, products])

  if (status === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-xl bg-surface-container-high/60" />
          ))}
        </div>
        <div className="h-64 w-full animate-pulse rounded-2xl bg-surface-container-high/60" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Categories</h1>
        <EmptyState
          icon="error"
          title="Gagal memuat category"
          description={error}
          action={
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    )
  }

  async function handleSave(payload) {
    if (modal.mode === 'edit') {
      return updateCategory(modal.category.id, payload)
    }
    return createCategory(payload)
  }

  async function handleConfirmDelete() {
    if (!deleteCandidate) {
      return
    }
    try {
      await deleteCategory(deleteCandidate.id)
      setToast({ type: 'success', message: `Category "${deleteCandidate.name}" dihapus.` })
      setDeleteCandidate(null)
    } catch (deleteError) {
      setDeleteCandidate(null)
      setNoticed(deleteError instanceof Error ? deleteError.message : 'Category tidak dapat dihapus.')
    }
  }

  function openDelete(category) {
    const used = (productCounts[category.name] || 0) > 0
    const hasChildren = (childrenByParent[category.id] || []).length > 0
    if (used || hasChildren) {
      const reason = used
        ? `Category "${category.name}" masih digunakan oleh ${productCounts[category.name]} product. Pindahkan product ke category lain terlebih dahulu.`
        : `Kategori "${category.name}" masih memiliki Sub Kategori. Hapus atau pindahkan Sub Kategori terlebih dahulu.`
      setNoticed(reason)
      return
    }
    setDeleteCandidate(category)
  }

  const customCount = categories.filter((category) => category.custom).length

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Kelola Kategori Utama &amp; Sub Kategori untuk katalog kamu (maksimal dua level).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ open: true, mode: 'create', category: null })}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            add
          </span>
          Tambah Kategori
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Kategori Utama" value={stats.utama} icon="account_tree" />
        <StatCard label="Sub Kategori" value={stats.sub} icon="category" />
        <StatCard label="Total Product" value={stats.totalProducts} icon="inventory_2" />
      </div>

      {customCount === 0 ? (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-container/40 px-4 py-3">
          <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">
            lightbulb
          </span>
          <p className="text-sm leading-relaxed text-on-surface">
            Belum ada Kategori Utama custom. Buat kategori mu sendiri, misalnya{' '}
            <span className="font-semibold">Gadget Gaming</span> dengan Sub Kategori{' '}
            <span className="font-semibold">Handler</span>.
          </p>
        </div>
      ) : null}

      <div className="mb-4 flex items-center gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-3">
        <span className="material-symbols-outlined text-[20px] text-secondary" aria-hidden="true">
          search
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari category..."
          aria-label="Cari category"
          className="min-w-0 flex-1 bg-transparent text-sm text-on-surface placeholder:text-outline outline-none"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="flex h-6 w-6 items-center justify-center rounded-md text-secondary transition-colors hover:bg-surface-container"
            aria-label="Hapus pencarian"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              close
            </span>
          </button>
        ) : null}
      </div>

      {query && filtered.visibleParents.length === 0 ? (
        <EmptyState
          icon="search_off"
          title="Tidak ada category ditemukan"
          description={`Tidak ada category yang cocok dengan "${search.trim()}".`}
          action={
            <button
              type="button"
              onClick={() => setSearch('')}
              className="inline-flex items-center justify-center rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Reset Pencarian
            </button>
          }
        />
      ) : (
        <CategoryTree
          parents={filtered.visibleParents}
          childrenByParent={filtered.matchedChildren}
          productCounts={productCounts}
          onEdit={(category) => setModal({ open: true, mode: 'edit', category })}
          onDelete={openDelete}
        />
      )}

      <CategoryFormModal
        open={modal.open}
        mode={modal.mode}
        category={modal.category}
        parents={parents}
        onClose={() => setModal({ open: false, mode: 'create', category: null })}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Hapus Kategori?"
        message={deleteCandidate ? `"${deleteCandidate.name}" akan dihapus secara permanen. Tindakan ini tidak bisa dibatalkan.` : ''}
        confirmLabel="Hapus"
        danger
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteCandidate(null)}
      />

      <AlertDialog
        open={Boolean(noticed)}
        icon="lock"
        title="Kategori Tidak Dapat Dihapus"
        description={noticed || ''}
        actionLabel="Mengerti"
        onClose={() => setNoticed(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default CategoriesPage