import { useState } from 'react'
import { CTA_TYPE } from '../../../constants/enums'

const INPUT_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

/**
 * Add a CUSTOM CTA option for the store. Bottom-sheet on mobile, centered
 * dialog on desktop (nothing is ever a dropdown for CTA options). Only a
 * label is captured — after submit the store holds { type: 'CUSTOM', label }.
 * Duplicate labels (case-insensitive) are rejected so a store never ends up
 * with two CUSTOM options spelled identically.
 *
 * @param {{
 *   open: boolean,
 *   existingLabels: string[],
 *   onClose: () => void,
 *   onAdd: (label: string) => void,
 * }} props
 */
function CtaOptionModal({ open, existingLabels, onClose, onAdd }) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Opsi CTA"
    >
      <div className="flex max-h-[88vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-surface-container-lowest shadow-2xl md:max-w-md md:rounded-2xl">
        <CtaOptionForm
          key={`cta-options-${existingLabels.length}`}
          existingLabels={existingLabels}
          onClose={onClose}
          onAdd={onAdd}
        />
      </div>
    </div>
  )
}

/**
 * Inner form keyed so the label/error state resets on every open.
 */
function CtaOptionForm({ existingLabels, onClose, onAdd }) {
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) {
      setError('Label opsi CTA wajib diisi.')
      return
    }
    if (existingLabels.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setError('Label opsi CTA sudah digunakan pada store ini.')
      return
    }
    onAdd(trimmed)
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-outline-variant/60 px-5 py-4">
        <h2 className="text-base font-bold text-on-surface">Tambah Opsi CTA</h2>
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
            htmlFor="cta-option-label"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Label Opsi CTA <span className="text-error">*</span>
          </label>
          <input
            id="cta-option-label"
            type="text"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value)
              setError('')
            }}
            placeholder="Contoh: Tanya Harga"
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
          <p className="mt-2 text-[11px] text-secondary">
            {CTA_TYPE.CUSTOM} — label ini tampil sebagai tombol CTA pada Product Detail.
          </p>
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
          >
            Simpan
          </button>
        </div>
      </form>
    </>
  )
}

export default CtaOptionModal