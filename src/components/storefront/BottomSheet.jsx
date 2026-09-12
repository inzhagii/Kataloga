import { useEffect, useRef } from 'react'

/**
 * Reusable mobile bottom sheet with backdrop, Escape-to-close and basic focus
 * management. Used for filter, sort and marketplace channel selection.
 */
function BottomSheet({ open, onClose, title, icon, children }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const previousActive = document.activeElement
    closeButtonRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousActive && typeof previousActive.focus === 'function') {
        previousActive.focus()
      }
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/50 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-surface-container-lowest p-5 pb-6 shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-outline-variant/50 sm:hidden" />

        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="material-symbols-outlined text-[22px] text-primary" aria-hidden="true">
                {icon}
              </span>
            ) : null}
            <h3 className="text-base font-semibold text-on-surface">{title}</h3>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

export default BottomSheet