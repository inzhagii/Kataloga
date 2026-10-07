import { useState } from 'react'

/**
 * Reusable labeled form field used by the authentication pages.
 * Supports an optional-suffix label, inline error, hint text, and a
 * password visibility toggle (when type is "password").
 */
function TextField({
  id,
  label,
  optional = false,
  type = 'text',
  value,
  onChange,
  onBlur,
  error = null,
  invalid = false,
  hint = null,
  placeholder = '',
  autoComplete,
  inputMode,
  size = 'md',
}) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && visible ? 'text' : type
  const hasError = Boolean(error) || invalid

  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined

  const baseClass = `${size === 'md' ? 'h-11' : 'h-10'} w-full rounded-xl border px-3.5 text-sm text-on-surface placeholder:text-slate-400 bg-white transition duration-150 focus:outline-none focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10`
  const errorClass = hasError ? ' border-red-400 bg-red-50/20' : ' border-slate-200'
  const inputClass = `${baseClass}${errorClass}${isPassword ? ' pr-11' : ''}`

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
        {optional ? <span className="ml-1 text-[11px] font-normal text-slate-400">(opsional)</span> : null}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-describedby={describedBy}
          aria-invalid={hasError}
          className={inputClass}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-brand/20"
            aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
            aria-pressed={visible}
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              {visible ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[11px] text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export default TextField