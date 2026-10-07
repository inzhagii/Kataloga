import { useEffect } from 'react'

const STYLES = {
  success: {
    icon: 'check_circle',
    iconClass: 'text-emerald-600',
    chip: 'bg-emerald-50 border-emerald-200',
  },
  error: {
    icon: 'error',
    iconClass: 'text-error',
    chip: 'bg-error-container border-error/20',
  },
  info: {
    icon: 'info',
    iconClass: 'text-primary',
    chip: 'bg-surface-container-low border-primary/20',
  },
}

/**
 * Success/error/info feedback toast (UI_RULES success feedback).
 * Auto-dismisses after a few seconds.
 *
 * @param {{
 *   toast: { type: 'success'|'error'|'info', message: string } | null,
 *   onClose: () => void,
 * }} props
 */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) {
      return undefined
    }
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) {
    return null
  }

  const style = STYLES[toast.type] || STYLES.info

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm lg:inset-x-auto lg:bottom-6 lg:right-6 lg:mx-0 lg:max-w-md"
    >
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg ${style.chip}`}
      >
        <span
          className={`material-symbols-outlined mt-0.5 text-[20px] ${style.iconClass}`}
          aria-hidden="true"
        >
          {style.icon}
        </span>
        <p className="min-w-0 flex-1 text-sm font-semibold text-on-surface">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-black/5 hover:text-on-surface"
          aria-label="Tutup notifikasi"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>
    </div>
  )
}

export default Toast