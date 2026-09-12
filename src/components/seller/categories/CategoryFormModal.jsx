import { useState } from 'react'

/**
 * Add/Edit custom category. Bottom-sheet on mobile, centered dialog on
 * desktop.
 *
 * Create mode offers Kategori Utama (level-1, no parent) or Sub Kategori
 * (chooses an existing Kategori Utama). From the Sub Kategori flow, "+ Buat
 * Kategori Utama Baru" creates a new Kategori Utama first and then returns to
 * the Sub Kategori flow with it pre-selected, so the new category is
 * immediately usable as its parent. Only Kategori Utama can be a parent,
 * keeping the hierarchy at two levels. Editing a Kategori Utama renames only.
 *
 * @param {{
 *   open: boolean,
 *   mode: 'create'|'edit',
 *   category?: import('../../../data/models.js').Category | null,
 *   parents: import('../../../data/models.js').Category[],
 *   onClose: () => void,
 *   onSubmit: (payload: { name: string, parentId: number|null }) => Promise<object>,
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
      aria-label={isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
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
  const [createType, setCreateType] = useState('utama')
  const [parentFirst, setParentFirst] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const heading = isEdit
    ? 'Edit Kategori'
    : createType === 'sub'
      ? 'Tambah Sub Kategori'
      : parentFirst
        ? 'Buat Kategori Utama Baru'
        : 'Tambah Kategori'

  const submitLabel = isEdit
    ? 'Simpan'
    : createType === 'sub'
      ? 'Buat Sub Kategori'
      : 'Buat Kategori Utama'

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Nama Kategori wajib diisi.')
      return
    }
    if (!isEdit && createType === 'sub' && parentValue === 'none') {
      setError('Pilih Kategori Utama terlebih dahulu.')
      return
    }
    setSubmitting(true)
    try {
      const created = await onSubmit({
        name: trimmed,
        parentId: parentValue === 'none' ? null : Number(parentValue),
      })
      if (!isEdit && parentFirst) {
        setParentFirst(false)
        setCreateType('sub')
        setParentValue(String(created.id))
        setName('')
        setError('')
        setSubmitting(false)
        return
      }
      setError('')
      setSubmitting(false)
      onClose()
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Tidak dapat menyimpan Kategori.',
      )
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-outline-variant/60 px-5 py-4">
        <h2 className="text-base font-bold text-on-surface">{heading}</h2>
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

      {!isEdit ? (
        <div className="border-b border-outline-variant/40 px-5 pt-5">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface">
            Jenis Kategori
          </span>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-container-low p-1">
            <button
              type="button"
              aria-pressed={!parentFirst && createType === 'utama'}
              onClick={() => {
                setCreateType('utama')
                setParentFirst(false)
                setParentValue('none')
                setError('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                !parentFirst && createType === 'utama'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              Kategori Utama
            </button>
            <button
              type="button"
              aria-pressed={createType === 'sub'}
              onClick={() => {
                setCreateType('sub')
                setParentFirst(false)
                setError('')
              }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                createType === 'sub'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-secondary hover:bg-surface-container-low'
              }`}
            >
              Sub Kategori
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-5">
        <div>
          <label
            htmlFor="category-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nama Kategori <span className="text-error">*</span>
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
            Kategori ini adalah Kategori Utama. Nama bisa diubah, tetapi tetap menjadi Kategori
            Utama.
          </p>
        ) : (
          <div>
            <label
              htmlFor="category-parent"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Kategori Utama
            </label>
            <select
              id="category-parent"
              value={parentValue}
              onChange={(event) => setParentValue(event.target.value)}
              className="w-full appearance-none rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
            >
              <option value="none">
                {isEdit ? 'Jadikan Kategori Utama' : 'Pilih Kategori Utama'}
              </option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name}
                  {parent.custom ? ' (Custom)' : ' (Default)'}
                </option>
              ))}
            </select>
            {!isEdit && createType === 'sub' ? (
              <button
                type="button"
                onClick={() => {
                  setCreateType('utama')
                  setParentFirst(true)
                  setParentValue('none')
                  setError('')
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  add
                </span>
                Buat Kategori Utama Baru
              </button>
            ) : null}
            <p className="mt-1.5 text-[11px] text-secondary">
              Maksimal dua level: Kategori Utama &rarr; Sub Kategori.
            </p>
          </div>
        )}

        {!isEdit && createType === 'utama' ? (
          <p className="rounded-lg bg-surface-container-low px-3 py-2.5 text-xs leading-relaxed text-secondary">
            {parentFirst
              ? 'Kategori Utama baru disimpan tanpa parent. Setelah dibuat, kembali ke flow Sub Kategori untuk memilihnya sebagai Kategori Utama.'
              : 'Kategori Utama adalah level teratas dan tidak memiliki parent.'}
          </p>
        ) : null}

        {!isEdit && parentFirst ? (
          <button
            type="button"
            onClick={() => {
              setCreateType('sub')
              setParentFirst(false)
              setError('')
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              arrow_back
            </span>
            Kembali ke Sub Kategori
          </button>
        ) : null}

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
            {submitting ? 'Menyimpan...' : submitLabel}
          </button>
        </div>
      </form>
    </>
  )
}

export default CategoryFormModal