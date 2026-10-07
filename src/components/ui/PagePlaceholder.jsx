/**
 * Temporary placeholder used by pages that are implemented in later phases.
 */
function PagePlaceholder({ title, description }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
      {description ? (
        <p className="max-w-md text-sm text-on-surface-variant">{description}</p>
      ) : null}
    </div>
  )
}

export default PagePlaceholder