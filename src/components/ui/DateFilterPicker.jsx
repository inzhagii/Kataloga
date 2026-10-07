import { fromNativeDateInput, toNativeDateInput } from '../../utils/datetime'

/**
 * Single-date filter control backed by a native <input type="date">.
 * Maps the native YYYY-MM-DD value into Kataloga's canonical filter format
 * (DD.MM.YYYY) and back, so callers only ever hold "DD.MM.YYYY" or ''.
 * Replaces manual text inputs used by Recent Activity and Customer Interest
 * filters (locked rule: date picker, not a free-text date field).
 *
 * @param {{
 *   id: string,
 *   value: string,
 *   onChange: (value: string) => void,
 *   'aria-label': string,
 *   size?: 'md'|'sm',
 *   className?: string,
 * }} props
 */
function DateFilterPicker({ id, value, onChange, size = 'md', className = '', ...rest }) {
  const nativeValue = toNativeDateInput(value)

  const sizeClass =
    size === 'sm'
      ? 'w-full rounded-lg border border-outline-variant bg-surface-container-low px-2 py-2 text-xs font-medium text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'
      : 'h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none'

  return (
    <div className={`relative ${className}`}>
      <input
        {...rest}
        id={id}
        type="date"
        value={nativeValue}
        onChange={(event) => onChange(fromNativeDateInput(event.target.value))}
        className={sizeClass}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Bersihkan tanggal"
          className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            close
          </span>
        </button>
      ) : null}
    </div>
  )
}

export default DateFilterPicker