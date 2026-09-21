import { useState } from 'react'

const INPUT_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

/**
 * Add/Edit brand. Bottom-sheet on mobile, centered dialog on desktop.
 * Create mode requires a non-empty name; duplicates within the same store are
 * rejected by the brand service and surfaced inline.
 *
 * @param {{
 *   open: boolean,
 *   mode: 'create'|'edit',
 *   brand?: import('../../../data/models.js').Brand | null,
 *   onClose: () => void,
 *   onSubmit: (payload: { name: string }) => Promise<object>,
 * }} props
 */
function BrandFormModal({ open, mode, brand, onClose, onSubmit }) {
  if (!open) {
    return null
  }

  const isEdit = mode === 'edit'
  const resetKey = isEdit && brand ? `edit-${brand.id}` : 'create'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit Brand' : 'Buat Brand'}
    >
      <div className="flex max-h-[88vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-surface-container-lowest shadow-2xl md:max-w-md md:rounded-2xl">
        <BrandFormInner
          key={resetKey}
          isEdit={isEdit}
          brand={brand}
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
function BrandFormInner({ isEdit, brand, onClose, onSubmit }) {
  const [name, setName] = useState(isEdit && brand ? brand.name : '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const heading = isEdit ? 'Edit Brand' : 'Buat Brand'
  const submitLabel = isEdit ? 'Simpan' : 'Buat Brand'

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Nama brand wajib diisi.')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({ name: trimmed })
      setError('')
      setSubmitting(false)
      onClose()
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Tidak dapat menyimpan brand.',
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

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 p-5">
        <div>
          <label
            htmlFor="brand-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nama Brand <span className="text-error">*</span>
          </label>
          <input
            id="brand-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
            placeholder="Contoh: Asus"
            autoFocus
            className={INPUT_CLASS}
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

export default BrandFormModal
