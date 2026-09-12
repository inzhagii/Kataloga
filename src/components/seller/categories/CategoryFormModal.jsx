import { useState } from 'react'

/**
 * Add/Edit custom category. Bottom-sheet on mobile, centered dialog on
 * desktop. Only Level-1 parents can be selected as a parent, keeping the
 * hierarchy at two levels; editing a Level-1 parent renames only.
 *
 * @param {{
 *   open: boolean,
 *   mode: 'create'|'edit',
 *   category?: import('../../../data/models.js').Category | null,
 *   parents: import('../../../data/models.js').Category[],
 *   onClose: () => void,
 *   onSubmit: (payload: { name: string, parentId: number|null }) => Promise<unknown>,
 * }} props
 */
function CategoryFormModal({ open, mode, category, parents, onClose, onSubmit }) {
  if (!open) {
    return null
  }

  const isEdit = mode === 'edit'
  const isParent = isEdit && Boolean(category && category.parentId === null)
  const resetKey = isEdit && category ? `edit-${category.id}` : 'create'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Category' : 'Tambah Category'}
    >
      <div className="flex max-h-[88vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-surface-container-lowest shadow-2xl md:max-w-md md:rounded-2xl">
        <CategoryFormInner
          key={resetKey}
          isEdit={isEdit}
          isParent={isParent}
          category={category}
          parents={parents}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}

/**
 * Inner form component keyed so state resets naturally on remount.
 */
function CategoryFormInner({ isEdit, isParent, category, parents, onClose, onSubmit }) {
  const [name, setName] = useState(isEdit && category ? category.name : '')
  const [parentValue, setParentValue] = useState(
    isEdit && category && category.parentId !== null ? String(category.parentId) : 'none',
  )
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Nama category wajib diisi.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        name: trimmed,
        parentId: parentValue === 'none' ? null : Number(parentValue),
      })
      setError('')
      setSubmitting(false)
      onClose()
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Tidak dapat menyimpan category.',
      )
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-outline-variant/60 px-5 py-4">
        <h2 className="text-base font-bold text-on-surface">
          {isEdit ? 'Edit Category' : 'Tambah Category'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
          aria-label="Tutup"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-5">
        <div>
          <label
            htmlFor="category-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nama Category <span className="text-error">*</span>
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
            placeholder="Contoh: Keyboard Mekanikal"
            autoFocus
            className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
          />
          {error ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                error
              </span>
              {error}
            </p>
          ) : null}
        </div>

        {isParent ? (
          <p className="rounded-lg bg-surface-container-low px-3 py-2.5 text-xs leading-relaxed text-secondary">
            Category ini berada di Level 1 (parent). Nama bisa diubah, tetapi tetap menjadi parent
            category.
          </p>
        ) : (
          <div>
            <label
              htmlFor="category-parent"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Parent Category
            </label>
            <select
              id="category-parent"
              value={parentValue}
              onChange={(event) => setParentValue(event.target.value)}
              className="w-full appearance-none rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
            >
              <option value="none">Tanpa parent (Level 1)</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                  {parent.custom ? ' (Custom)' : ' (Default)'}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-secondary">
              Maksimal dua level: Category &rarr; Subcategory.
            </p>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? (isEdit ? 'Menyimpan...' : 'Membuat...') : isEdit ? 'Simpan' : 'Buat Category'}
          </button>
        </div>
      </form>
    </>
  )
}

export default CategoryFormModal