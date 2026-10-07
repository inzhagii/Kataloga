import { useEffect, useRef } from 'react'

/**
 * Reusable single-action dialog for explanations/notices (e.g. a blocked
 * category delete). Complement to ConfirmDialog for actions without an
 * affirmative follow-up.
 *
 * @param {{
 *   open: boolean,
 *   title: string,
 *   description: string,
 *   icon?: string,
 *   actionLabel?: string,
 *   onClose: () => void,
 * }} props
 */
function AlertDialog({
  open,
  title,
  description,
  icon = 'info',
  actionLabel = 'Mengerti',
  onClose,
}) {
  const closeRef = useRef(null)

  useEffect(() => {
    if (open && closeRef.current) {
      closeRef.current.focus()
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-error-container">
          <span className="material-symbols-outlined text-[22px] text-error" aria-hidden="true">
            {icon}
          </span>
        </div>
        <h2 className="mt-4 text-base font-bold text-on-surface">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-secondary">{description}</p>
        <div className="mt-6 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertDialog