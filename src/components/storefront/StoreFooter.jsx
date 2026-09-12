import { Link } from 'react-router-dom'
import WhatsAppIcon from '../ui/WhatsAppIcon'

function storeInitial(store) {
  return (store?.name ?? 'K').trim().charAt(0).toUpperCase()
}

/**
 * Customer-facing storefront footer: store identity (logo + name), WhatsApp
 * contact, the store's configured external channels (+arbitrary {name,url}),
 * the optional full address, and a "Tentang Kataloga" block with only real
 * destinations. WhatsApp/marketplace actions reuse the page handlers so the
 * Customer Interest + guest login rules stay intact. Alamat only renders when
 * fullAddress exists and stays compact (not a card).
 */
function StoreFooter({ store = {}, onWhatsApp, onSelectChannel }) {
  const channels = store.channels ?? []
  const hasChannels = channels.length > 0

  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto max-w-[1140px] px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-on-primary shadow-sm">
                {storeInitial(store)}
              </span>
              <span className="truncate text-lg font-bold tracking-tight text-on-surface">
                {store.name || 'Katalog'}
              </span>
            </div>

            {onWhatsApp ? (
              <button
                type="button"
                onClick={onWhatsApp}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-whatsapp px-3.5 py-2 text-xs font-semibold text-on-whatsapp shadow-sm transition-colors hover:brightness-95 sm:text-sm"
              >
                <WhatsAppIcon size={16} />
                <span className="whitespace-nowrap">Hubungi via WhatsApp</span>
              </button>
            ) : null}
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
              Marketplace
            </h3>
            {hasChannels ? (
              <ul className="mt-3 space-y-2">
                {channels.map((channel) => (
                  <li key={channel.name}>
                    <button
                      type="button"
                      onClick={() => onSelectChannel && onSelectChannel(channel)}
                      className="inline-flex max-w-full items-center gap-2 text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline"
                    >
                      <span className="material-symbols-outlined shrink-0 text-[16px] text-secondary" aria-hidden="true">
                        open_in_new
                      </span>
                      <span className="truncate">{channel.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-on-surface-variant">Belum ada saluran marketplace.</p>
            )}
          </div>

          {store.fullAddress ? (
            <div className="min-w-0">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Alamat</h3>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-on-surface-variant">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-secondary" aria-hidden="true">
                  location_on
                </span>
                <span className="min-w-0">{store.fullAddress}</span>
              </p>
            </div>
          ) : null}

          <div className="min-w-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">
              Tentang Kataloga
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Buat katalog toko lebih rapi dan jualan jadi lebih mudah.
            </p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/" className="text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline">
                  Platform Kataloga
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline">
                  Buat Toko
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-outline-variant/30 pt-6 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Kataloga</p>
          <p>Made with Kataloga</p>
        </div>
      </div>
    </footer>
  )
}

export default StoreFooter