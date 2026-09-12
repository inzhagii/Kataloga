/**
 * Loading skeleton for the Store Landing while store + catalog load.
 */
function StoreLandingSkeleton() {
  return (
    <div className="min-h-svh bg-surface">
      <div className="sticky top-0 z-50 h-16 w-full border-b border-outline-variant/30 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-surface-container" />
            <div className="h-4 w-32 animate-pulse rounded-md bg-surface-container" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-container" />
            <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-container" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-4 py-8 md:px-6">
        <div className="mb-6 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-24 w-24 animate-pulse rounded-full bg-surface-container" />
            <div className="h-6 w-56 animate-pulse rounded-md bg-surface-container" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-surface-container" />
            <div className="h-4 w-48 animate-pulse rounded-md bg-surface-container" />
            <div className="h-11 w-full max-w-[560px] animate-pulse rounded-lg bg-surface-container" />
          </div>
        </div>

        <div className="mb-6 h-16 w-full animate-pulse rounded-2xl bg-surface-container" />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-3 shadow-sm sm:p-4"
            >
              <div className="mb-3 aspect-square animate-pulse rounded-xl bg-surface-container" />
              <div className="mb-2 h-3 w-2/3 animate-pulse rounded-md bg-surface-container" />
              <div className="mb-2 h-4 w-3/4 animate-pulse rounded-md bg-surface-container" />
              <div className="h-5 w-1/2 animate-pulse rounded-md bg-surface-container" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StoreLandingSkeleton