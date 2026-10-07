/**
 * Generic user-circle avatar for customers.
 * Customers do not use uploaded profile photos on V1, so this visual stays
 * the same everywhere (page list, mobile cards, detail modal).
 * @param {{ className?: string, iconClassName?: string }} props
 */
function CustomerAvatar({
  className = 'h-9 w-9',
  iconClassName = 'h-4 w-4',
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-high text-on-surface-variant ${className}`}
    >
      <svg
        className={iconClassName}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
      </svg>
    </span>
  )
}

export default CustomerAvatar