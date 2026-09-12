/**
 * Shared heading block for seller dashboard sections.
 * @param {{ eyebrow: string, description: string }} props
 */
function DashboardSectionHeading({ eyebrow, description }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-secondary">{eyebrow}</h2>
      <p className="mt-0.5 text-sm font-semibold text-on-surface">{description}</p>
    </div>
  )
}

export default DashboardSectionHeading