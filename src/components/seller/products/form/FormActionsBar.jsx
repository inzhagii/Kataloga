/**
 * Sticky bottom action bar for the product form.
 * Create mode: Cancel / Save Draft / Publish Product.
 * Edit mode (UI_RULES/UX-FLOW locked): only Cancel / Simpan. No status
 * buttons, no Save Draft; Simpan keeps the current product status.
 * @param {{
 *   mode: 'create'|'edit',
 *   submitting: boolean,
 *   onCancel: () => void,
 *   onSaveDraft: () => void,
 *   onPublish?: () => void,
 * }} props
 */
function FormActionsBar({ mode = 'create', submitting, onCancel, onSaveDraft, onPublish }) {
  const isEdit = mode === 'edit'

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-outline-variant/40 bg-surface-container-lowest/95 py-3.5 backdrop-blur-md lg:bottom-0 lg:left-sidebar-width">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <p className="hidden items-center gap-2 text-xs text-secondary sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
          {isEdit ? 'Perubahan disimpan ke katalog kamu.' : 'Draft tersimpan otomatis pada saat kamu menekan Save Draft.'}
        </p>
        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg border border-outline-variant px-4 py-2.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            Batal
          </button>

          {isEdit ? (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">
                check
              </span>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-blue-50 disabled:opacity-50"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-on-primary shadow-md shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base" aria-hidden="true">
                  cloud_upload
                </span>
                {submitting ? 'Menyimpan...' : 'Publish Product'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FormActionsBar