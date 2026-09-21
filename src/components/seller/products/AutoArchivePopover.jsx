import { useRef, useState } from 'react'
import { useClickOutside } from '../../../hooks/useClickOutside'

/**
 * Store-level Auto Archive setting (locked value set):
 * "Tidak ada" (default, off) / 1 / 7 / 30 / 90 / 180 / 365 hari / Never.
 * UI lives on the Archive page (/seller/products/archived), not My Store.
 * "Tidak ada" and "Never" both disable auto archive and never block manual
 * archiving — both persist as `autoArchiveDays: null`.
 *
 * The trigger label follows the stored value (e.g. "Auto Archive",
 * "Auto Archive 30 hari"). Simpan persists via the caller (updateStore);
 * Batal discards the draft and closes the popover. The scheduler that
 * archives SOLD_OUT products is backend-owned, so this only saves the setting.
 *
 * @param {{
 *   autoArchiveDays: number|null,
 *   onSave: (value: number|null) => Promise<void>|void,
 *   disabled?: boolean,
 * }} props
 */
function AutoArchivePopover({ autoArchiveDays, onSave, disabled = false }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => valueToKey(autoArchiveDays))
  const [saving, setSaving] = useState(false)
  const panelRef = useRef(null)
  useClickOutside(panelRef, () => setOpen(false), open)

  const triggerLabel = autoArchiveDays === null ? 'Auto Archive' : `Auto Archive ${autoArchiveDays} hari`

  function openPopover() {
    setDraft(valueToKey(autoArchiveDays))
    setOpen(true)
  }

  function close() {
    setOpen(false)
  }

  async function handleSave() {
    const selected = AUTO_ARCHIVE_OPTIONS.find((option) => option.value === draft)
    if (!selected) {
      return
    }
    setSaving(true)
    try {
      await onSave(selected.days)
      close()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={openPopover}
        disabled={disabled}
        aria-expanded={open}
        className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 text-xs font-semibold text-on-surface shadow-sm transition-colors hover:bg-surface-container disabled:opacity-60 sm:px-3.5 sm:text-sm"
      >
        <span className="material-symbols-outlined text-[18px] text-outline" aria-hidden="true">
          archive
        </span>
        <span className="truncate">{triggerLabel}</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Auto Archive
            </span>
          </div>
          <div>
            <label htmlFor="auto-archive-value" className="mb-1.5 block text-xs font-semibold text-on-surface">
              Jangka Waktu
            </label>
            <select
              id="auto-archive-value"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {AUTO_ARCHIVE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] leading-relaxed text-secondary">
              Produk SOLD_OUT yang melewati batas waktu akan otomatis menjadi ARCHIVED. Pengarsipan
              dikelola oleh sistem.
            </p>
            {draft === 'never' ? (
              <p className="mt-1.5 text-[11px] text-on-surface-variant">
                Never menonaktifkan auto archive, tetapi kamu tetap bisa mengarsipkan secara manual.
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="rounded-lg border border-outline-variant px-3.5 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const AUTO_ARCHIVE_OPTIONS = [
  { value: 'none', label: 'Tidak ada', days: null },
  { value: '1', label: '1 hari', days: 1 },
  { value: '7', label: '7 hari', days: 7 },
  { value: '30', label: '30 hari', days: 30 },
  { value: '90', label: '90 hari', days: 90 },
  { value: '180', label: '180 hari', days: 180 },
  { value: '365', label: '365 hari', days: 365 },
  { value: 'never', label: 'Never', days: null },
]

function valueToKey(autoArchiveDays) {
  if (autoArchiveDays === null || autoArchiveDays === undefined) {
    return 'none'
  }
  const match = AUTO_ARCHIVE_OPTIONS.find((option) => option.days === Number(autoArchiveDays))
  return match ? match.value : 'none'
}

export default AutoArchivePopover