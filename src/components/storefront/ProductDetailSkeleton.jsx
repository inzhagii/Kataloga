/**
 * Loading skeleton for the Product Detail while store + product load.
 */
function ProductDetailSkeleton() {
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

      <main className="mx-auto max-w-[1140px] px-4 pb-16 pt-16 md:px-6">
        <div className="pt-5 sm:pt-7">
          <div className="mb-5 h-4 w-28 animate-pulse rounded-md bg-surface-container" />

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="mb-3 aspect-square w-full animate-pulse rounded-2xl bg-surface-container" />

            <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6 lg:p-7">
              <div className="mb-3 h-5 w-32 animate-pulse rounded-full bg-surface-container" />
              <div className="h-7 w-3/4 animate-pulse rounded-md bg-surface-container" />
              <div className="mt-5 h-24 w-full animate-pulse rounded-xl bg-surface-container" />
              <div className="mt-4 h-6 w-40 animate-pulse rounded-full bg-surface-container" />
              <div className="mt-5 h-12 w-full animate-pulse rounded-lg bg-surface-container" />
              <div className="mt-2.5 h-12 w-full animate-pulse rounded-lg bg-surface-container" />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 items-start gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-2">
            <div className="h-56 animate-pulse rounded-2xl bg-surface-container" />
            <div className="h-56 animate-pulse rounded-2xl bg-surface-container" />
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductDetailSkeleton