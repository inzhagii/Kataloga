import StoreActions from './StoreActions'

function storeLocationLabel(store) {
  if (store.city && store.province) {
    return `${store.city}, ${store.province}`
  }
  if (store.city) {
    return store.city
  }
  return '-'
}

/**
 * Public store profile header: logo (+ verification badge), name, description,
 * city/operating hours and the store actions (WhatsApp / Marketplace / Share).
 * Ordering matches the mobile hierarchy; the same markup slides into a
 * balanced desktop layout.
 */
function StoreHeader({ store, onWhatsApp, onSelectChannel, onShareStore }) {
  return (
    <section className="mb-6 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm sm:mb-8 sm:p-6 md:p-8">
      <div className="flex w-full flex-col items-center text-center">
        <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={`Logo ${store.name}`}
              className="flex h-24 w-24 rounded-full object-cover shadow-md sm:h-28 sm:w-28"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary-container text-3xl font-bold text-on-primary shadow-md sm:h-28 sm:w-28 sm:text-4xl">
              {(store.name ?? 'K').trim().charAt(0).toUpperCase()}
            </div>
          )}
          {store.verified ? (
            <div
              className="absolute -bottom-0.5 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm sm:bottom-0 sm:right-0"
              title="Toko Terverifikasi"
            >
              <span
                className="material-symbols-outlined text-[21px] text-primary"
                style={{ fontVariationSettings: '"FILL" 1' }}
                aria-label="Toko Terverifikasi"
              >
                verified
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-on-surface sm:text-2xl md:text-[26px]">
            {store.name}
          </h1>
          {store.verified ? (
            <span
              className="material-symbols-outlined text-[22px] text-primary"
              style={{ fontVariationSettings: '"FILL" 1' }}
              role="img"
              aria-label="Toko Terverifikasi"
              title="Toko Terverifikasi"
            >
              verified
            </span>
          ) : null}
        </div>

        {store.description ? (
          <p className="mt-2 w-full max-w-2xl text-xs leading-relaxed text-on-surface-variant sm:text-sm md:text-base">
            {store.description}
          </p>
        ) : null}

        <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-secondary sm:text-xs md:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-primary" aria-hidden="true">
              location_on
            </span>
            <span className="leading-relaxed">{storeLocationLabel(store)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined shrink-0 text-[18px] text-secondary" aria-hidden="true">
              schedule
            </span>
            <span className="leading-relaxed">{store.operatingHours ?? '-'}</span>
          </span>
        </div>

        <StoreActions
          store={store}
          onWhatsApp={onWhatsApp}
          onSelectChannel={onSelectChannel}
          onShareStore={onShareStore}
        />
      </div>
    </section>
  )
}

export default StoreHeader