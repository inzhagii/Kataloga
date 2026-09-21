import { useState } from 'react'
import {
  WEEKDAYS,
  composeOperatingHours,
  parseOperatingHours,
} from '../../../utils/operatingHours'
import { INPUT_CLASS, SELECT_CLASS } from './formClasses'

/**
 * Structured operating hours editor. The store persists a single wire string
 * (e.g. "Senin - Sabtu, 09:00 - 18:00"); this editor composes it from four
 * controls (Hari Mulai / Hari Selesai / Jam Buka / Jam Tutup) and syncs the
 * composed string back through `onChange`. The wire-string contract and
 * validation are unchanged.
 * @param {{
 *   value: string,
 *   error?: string,
 *   onChange: (value: string) => void,
 * }} props
 */
function OperatingHoursEditor({ value, error, onChange }) {
  const [hours, setHours] = useState(() => parseOperatingHours(value))

  function update(field, fieldValue) {
    const next = { ...hours, [field]: fieldValue }
    setHours(next)
    onChange(composeOperatingHours(next))
  }

  return (
    <div className="grid grid-cols-2 gap-4" data-error={Boolean(error)}>
      <div>
        <label
          htmlFor="store-hours-start-day"
          className="mb-1.5 block text-xs font-semibold text-on-surface"
        >
          Hari Mulai
        </label>
        <div className="relative">
          <select
            id="store-hours-start-day"
            value={hours.startDay}
            onChange={(event) => update('startDay', event.target.value)}
            className={SELECT_CLASS}
          >
            {WEEKDAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-outline"
            aria-hidden="true"
          >
            unfold_more
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="store-hours-end-day"
          className="mb-1.5 block text-xs font-semibold text-on-surface"
        >
          Hari Selesai
        </label>
        <div className="relative">
          <select
            id="store-hours-end-day"
            value={hours.endDay}
            onChange={(event) => update('endDay', event.target.value)}
            className={SELECT_CLASS}
          >
            {WEEKDAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-outline"
            aria-hidden="true"
          >
            unfold_more
          </span>
        </div>
      </div>

      <div>
        <label
          htmlFor="store-hours-open"
          className="mb-1.5 block text-xs font-semibold text-on-surface"
        >
          Jam Buka
        </label>
        <input
          id="store-hours-open"
          type="time"
          value={hours.openTime}
          onChange={(event) => update('openTime', event.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="store-hours-close"
          className="mb-1.5 block text-xs font-semibold text-on-surface"
        >
          Jam Tutup
        </label>
        <input
          id="store-hours-close"
          type="time"
          value={hours.closeTime}
          onChange={(event) => update('closeTime', event.target.value)}
          className={INPUT_CLASS}
        />
      </div>

      {error ? (
        <p className="col-span-2 flex items-center gap-1 text-xs font-medium text-error">
          <span className="material-symbols-outlined text-sm" aria-hidden="true">
            error
          </span>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default OperatingHoursEditor