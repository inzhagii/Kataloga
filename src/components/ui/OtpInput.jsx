import { OTP_LENGTH } from '../../constants/auth'

/**
 * Accessible OTP input.
 *
 * Renders a single numeric field (mobile keyboards show the numeric pad and
 * `one-time-code` autofill works) styled with wide tracking to read like the
 * segmented code in the reference. The value is never logged and never placed
 * in the URL.
 */
function OtpInput({
  id = 'otp',
  label = 'Kode verifikasi',
  value,
  onChange,
  error = null,
  hint = null,
  disabled = false,
  autoFocus = false,
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined
  const inputClass = `h-12 w-full rounded-xl border bg-white px-3.5 text-center text-lg font-semibold tracking-[0.5em] text-on-surface placeholder:text-slate-300 placeholder:tracking-normal focus:outline-none focus:border-primary-brand focus:ring-4 focus:ring-primary-brand/10 ${
    error ? 'border-red-400 bg-red-50/20' : 'border-slate-200'
  }`

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={OTP_LENGTH}
        placeholder={'0'.repeat(OTP_LENGTH)}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={inputClass}
      />
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

export default OtpInput
