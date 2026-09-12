import { useEffect, useRef } from 'react'

/**
 * Reusable confirmation dialog for high-impact actions (UI_RULES: confirmation).
 *
 * @param {{
 *   open: boolean,
 *   title: string,
 *   description: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   tone?: 'default'|'danger',
 *   isSubmitting?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  tone = 'default',
  isSubmitting = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    if (confirmRef.current) {
      confirmRef.current.focus()
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) {
    return null
  }

  const confirmClass =
    tone === 'danger'
      ? 'bg-error text-on-error hover:brightness-110'
      : 'bg-primary text-on-primary hover:brightness-110'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${
            tone === 'danger' ? 'bg-error-container' : 'bg-surface-container-low'
          }`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              tone === 'danger' ? 'text-error' : 'text-primary'
            }`}
            aria-hidden="true"
          >
            {tone === 'danger' ? 'warning' : 'help_outline'}
          </span>
        </div>
        <h2 className="mt-4 text-base font-bold text-on-surface">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-secondary">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all disabled:opacity-50 ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog