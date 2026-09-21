/**
 * Reusable authentication alert banner.
 * Used by the login/register/verification/recovery pages so error and
 * informational feedback share one accessible presentation.
 */
function AuthAlert({ tone = 'error', children }) {
  if (!children) {
    return null
  }

  const tones = {
    error: {
      wrapper: 'border-red-200 bg-red-50',
      icon: 'error',
      iconClass: 'text-red-600',
      text: 'text-red-800',
    },
    info: {
      wrapper: 'border-blue-200 bg-blue-50',
      icon: 'info',
      iconClass: 'text-blue-600',
      text: 'text-blue-800',
    },
    success: {
      wrapper: 'border-green-200 bg-green-50',
      icon: 'check_circle',
      iconClass: 'text-green-600',
      text: 'text-green-800',
    },
  }

  const theme = tones[tone] ?? tones.error

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-xl border p-3.5 ${theme.wrapper}`}
      role="alert"
      aria-live="polite"
    >
      <span
        className={`material-symbols-outlined mt-0.5 shrink-0 text-[18px] ${theme.iconClass}`}
        aria-hidden="true"
      >
        {theme.icon}
      </span>
      <p className={`text-xs font-medium leading-relaxed ${theme.text}`}>{children}</p>
    </div>
  )
}

export default AuthAlert
