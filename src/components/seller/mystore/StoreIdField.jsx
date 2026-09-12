import { useState } from 'react'
import { checkStoreIdAvailable } from '../../../services/storeService'

/**
 * Store ID input: enforces the documented format, checks availability on
 * blur when the value is valid and changed, and visually locks the field for
 * the 30-day cooldown window (authoritative backend check happens on save).
 *
 * @param {{
 *   storeId: string,
 *   error: string,
 *   availability: 'idle'|'checking'|'available'|'taken',
 *   cooldown: { locked: boolean, nextChangeLabel: string },
 *   onChange: (value: string) => void,
 *   onBlur: () => void,
 * }} props
 */
function StoreIdField({ storeId, error, availability, cooldown, onChange, onBlur }) {
  const [checked, setChecked] = useState(null)
  const [availabilityOverride, setAvailabilityOverride] = useState(null)

  async function handleBlur() {
    const value = storeId.trim()
    if (!value || value === checked || cooldown.locked) {
      return
    }
    onBlur()
    const result = await checkStoreIdAvailable(value)
    setChecked(value)
    setAvailabilityOverride(result.available ? 'available' : 'taken')
  }

  const resolvedAvailability = availabilityOverride ?? availability

  return (
    <div>
      <label
        htmlFor="store-id"
        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
      >
        Store ID <span className="text-error">*</span>
        <span className="font-normal lowercase text-secondary">&nbsp;/&nbsp;{storeId ? `kataloga.id/${storeId.trim()}` : ''}</span>
      </label>
      {cooldown.locked ? (
        <div className="mb-3 rounded-lg bg-primary-container/50 px-3 py-2.5 text-xs leading-relaxed text-primary">
          <span className="material-symbols-outlined mr-1 align-middle text-[16px]" aria-hidden="true">
            lock
          </span>
          Store ID terakhir diubah dan baru dapat diubah lagi pada{' '}
          <span className="font-semibold">{cooldown.nextChangeLabel}</span>.
        </div>
      ) : null}
      <div className="relative">
        <input
          id="store-id"
          type="text"
          value={storeId}
          disabled={cooldown.locked}
          onChange={(event) => {
            setChecked(null)
            setAvailabilityOverride(null)
            onChange(event.target.value)
          }}
          onBlur={handleBlur}
          placeholder="contoh: toko-komputer-jaya"
          autoComplete="off"
          className={`w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 pr-10 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? 'border-error bg-error-container/30' : ''
          }`}
        />
        <span
          className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-outline"
          aria-hidden="true"
        >
          link
        </span>
      </div>
      <div className="mt-1.5 min-h-5">
        {error ? (
          <p className="flex items-center gap-1 text-xs font-medium text-error">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              error
            </span>
            {error}
          </p>
        ) : availability === 'checking' || resolvedAvailability === 'checking' ? (
          <p className="flex items-center gap-1 text-xs font-medium text-secondary">
            <span className="material-symbols-outlined animate-spin text-sm" aria-hidden="true">
              sync
            </span>
            Memeriksa ketersediaan...
          </p>
        ) : resolvedAvailability === 'available' ? (
          <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              check_circle
            </span>
            Store ID tersedia.
          </p>
        ) : resolvedAvailability === 'taken' ? (
          <p className="flex items-center gap-1 text-xs font-medium text-error">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              cancel
            </span>
            Store ID sudah digunakan.
          </p>
        ) : null}
      </div>
      <p className="mt-0.5 text-[11px] text-secondary">
        Huruf kecil, angka, dan tanda hubung (-). Dapat diubah sekali setiap 30 hari.
      </p>
    </div>
  )
}

export default StoreIdField