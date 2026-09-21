import { useState } from 'react'
import EmptyState from '../../shared/EmptyState'
import ConfirmDialog from '../../shared/ConfirmDialog'
import AlertDialog from '../../shared/AlertDialog'
import Toast from '../../shared/Toast'
import BrandCard from './BrandCard'
import BrandFormModal from './BrandFormModal'
import { useBrands } from '../../../hooks/useBrands'
import { createBrand, updateBrand, deleteBrand } from '../../../services/brandService'

/**
 * Brand Management section (inside /seller/categories). Lists the store's
 * brands as a card grid (desktop 4 columns, mobile 2), supports create/edit,
 * blocks deleting a brand that is still used by products, and exposes
 * "Lihat Product" which applies the brand filter on /seller/products.
 */
function BrandManagementSection() {
  const { status, error, brands, productCounts, reload } = useBrands()

  const [modal, setModal] = useState({ open: false, mode: 'create', brand: null })
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [noticed, setNoticed] = useState(null)
  const [toast, setToast] = useState(null)

  function closeModal() {
    setModal({ open: false, mode: 'create', brand: null })
  }

  async function handleSave(payload) {
    const saved =
      modal.mode === 'edit'
        ? await updateBrand(modal.brand.id, payload)
        : await createBrand(payload)
    reload()
    return saved
  }

  function openDelete(brand) {
    const count = productCounts[brand.name] || 0
    if (count > 0) {
      setNoticed(`Brand tidak dapat dihapus karena masih digunakan oleh ${count} produk.`)
      return
    }
    setDeleteCandidate(brand)
  }

  async function handleConfirmDelete() {
    if (!deleteCandidate) {
      return
    }
    try {
      await deleteBrand(deleteCandidate.id)
      setToast({ type: 'success', message: `Brand "${deleteCandidate.name}" dihapus.` })
      setDeleteCandidate(null)
      reload()
    } catch (deleteError) {
      setDeleteCandidate(null)
      setNoticed(
        deleteError instanceof Error
          ? deleteError.message
          : 'Brand tidak dapat dihapus karena masih digunakan oleh produk.',
      )
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <h2 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
          Brand Management
        </h2>
        <button
          type="button"
          onClick={() => setModal({ open: true, mode: 'create', brand: null })}
          className="hidden shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 sm:inline-flex"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            add
          </span>
          Buat Brand
        </button>
      </div>

      <button
        type="button"
        onClick={() => setModal({ open: true, mode: 'create', brand: null })}
        className="mb-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 sm:hidden"
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          add
        </span>
        Buat Brand
      </button>

      {status === 'loading' ? (
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          aria-busy="true"
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-surface-container-high/60"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <EmptyState
          icon="error"
          title="Gagal memuat brand"
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
      ) : null}

      {status === 'ready' && brands.length === 0 ? (
        <EmptyState
          icon="sell"
          title="Belum ada brand."
          description="Brand membantu customer mengenali produk. Buat brand pertamamu untuk mulai mengelompokkan produk."
          action={
            <button
              type="button"
              onClick={() => setModal({ open: true, mode: 'create', brand: null })}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                add
              </span>
              Buat Brand
            </button>
          }
        />
      ) : null}

      {status === 'ready' && brands.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              count={productCounts[brand.name] || 0}
              onEdit={(item) => setModal({ open: true, mode: 'edit', brand: item })}
              onDelete={openDelete}
            />
          ))}
        </div>
      ) : null}

      <BrandFormModal
        open={modal.open}
        mode={modal.mode}
        brand={modal.brand}
        onClose={closeModal}
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={Boolean(deleteCandidate)}
        title="Hapus brand?"
        description="Brand ini belum digunakan oleh produk dan dapat dihapus."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        tone="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />

      <AlertDialog
        open={Boolean(noticed)}
        icon="lock"
        title="Brand Tidak Dapat Dihapus"
        description={noticed || ''}
        actionLabel="Mengerti"
        onClose={() => setNoticed(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default BrandManagementSection
