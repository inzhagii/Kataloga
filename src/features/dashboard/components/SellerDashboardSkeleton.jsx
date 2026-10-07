/**
 * Loading skeleton for the seller Dashboard. Mirrors the ready layout:
 * welcome header, cover stat cards, interest/activity panels and quick actions.
 */
function SellerDashboardSkeleton() {
  return (
    <div className="flex min-h-full flex-col gap-6" aria-hidden="true">
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-container" />
        <div className="h-4 w-48 animate-pulse rounded-lg bg-surface-container" />
        <div className="h-11 w-44 animate-pulse rounded-xl bg-surface-container sm:ml-auto" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-32 animate-pulse rounded-xl bg-surface-container" />
        <div className="h-32 animate-pulse rounded-xl bg-surface-container" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-surface-container" />
        <div className="h-80 animate-pulse rounded-xl bg-surface-container" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-20 animate-pulse rounded-xl bg-surface-container" />
        <div className="h-20 animate-pulse rounded-xl bg-surface-container" />
        <div className="h-20 animate-pulse rounded-xl bg-surface-container" />
      </div>
    </div>
  )
}

export default SellerDashboardSkeleton