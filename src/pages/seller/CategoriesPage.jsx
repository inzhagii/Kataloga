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
    <div className="flex min-w-0 items-center rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 py-3 shadow-sm sm:justify-between sm:gap-3 sm:py-4 sm:pl-5 sm:pr-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span
          className="material-symbols-outlined shrink-0 text-[18px] text-secondary sm:text-[22px]"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="hidden truncate text-xs text-secondary sm:block">{label}</span>
      </div>
      <span className="min-w-0 flex-1 text-center text-xl font-extrabold leading-tight tracking-tight text-on-surface sm:flex-none sm:text-right sm:text-2xl">
        {value}
      </span>
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
  const [collapsed, setCollapsed] = useState(() => new Set())
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

  const allCollapsed =
    filtered.visibleParents.length > 0 &&
    filtered.visibleParents.every((parent) => collapsed.has(parent.id))

  function toggleParent(parentId) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(parentId)) {
        next.delete(parentId)
      } else {
        next.add(parentId)
      }
      return next
    })
  }

  function toggleAllParents() {
    setCollapsed(() =>
      allCollapsed ? new Set() : new Set(filtered.visibleParents.map((parent) => parent.id)),
    )
  }

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
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((item) => (
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
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Categories
          </h1>
        </div>
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

  const customRootCount = categories.filter(
    (category) => category.custom && category.parentId === null,
  ).length

  return (
    <div>
      <div className="mb-5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
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
            className="hidden shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 sm:inline-flex"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              add
            </span>
            Tambah Kategori
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3">
        <StatCard label="Kategori Utama" value={stats.utama} icon="account_tree" />
        <StatCard label="Sub Kategori" value={stats.sub} icon="category" />
        <StatCard label="Total Produk" value={stats.totalProducts} icon="inventory_2" />
      </div>

      <button
        type="button"
        onClick={() => setModal({ open: true, mode: 'create', category: null })}
        className="mb-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 sm:hidden"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          add
        </span>
        Tambah Kategori
      </button>

      {customRootCount === 0 ? (
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

      <div className="mb-4 flex w-full items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3.5 py-3 sm:px-4">
          <span className="material-symbols-outlined shrink-0 text-[20px] text-secondary" aria-hidden="true">
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
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-secondary transition-colors hover:bg-surface-container"
              aria-label="Hapus pencarian"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                close
              </span>
            </button>
          ) : null}
        </div>

        {filtered.visibleParents.length > 0 ? (
          <button
            type="button"
            onClick={toggleAllParents}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-3 text-[11px] font-semibold whitespace-nowrap text-primary transition-colors hover:bg-surface-container sm:px-4 sm:text-xs"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {allCollapsed ? 'unfold_more' : 'unfold_less'}
            </span>
            {allCollapsed ? 'Expand Semua' : 'Collapse Semua'}
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
          collapsed={collapsed}
          onToggle={toggleParent}
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