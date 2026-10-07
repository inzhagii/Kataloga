/**
 * Card wrapper for a ProductForm section with icon header.
 */
function SectionCard({ icon, title, subtitle, actions, children }) {
  return (
    <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-outline-variant/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              {icon}
            </span>
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">{title}</h2>
            {subtitle ? <p className="text-xs text-secondary">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export default SectionCard