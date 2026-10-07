/**
 * Reusable empty state for data-driven pages (empty catalog, empty search,
 * empty products, etc.). Kept generic so seller pages can reuse it later.
 */
function EmptyState({ icon = 'inventory', title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}
    >
      <span
        className="material-symbols-outlined mb-3 text-[40px] text-on-surface-variant/50"
        aria-hidden="true"
      >
        {icon}
      </span>
      <p className="text-base font-semibold text-on-surface">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export default EmptyState