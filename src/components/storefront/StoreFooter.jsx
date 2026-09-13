import { Link } from 'react-router-dom'
import WhatsAppIcon from '../ui/WhatsAppIcon'

/**
 * Shared styling for footer section headings (consistent in every block).
 */
const FOOTER_HEADING_CLASS = 'text-xs font-semibold uppercase tracking-wider text-on-surface'

function storeInitial(store) {
  return (store?.name ?? 'K').trim().charAt(0).toUpperCase()
}

/**
 * Customer-facing storefront footer: store identity (logo + name), WhatsApp
 * contact, the store's configured external channels (+arbitrary {name,url}),
 * the optional full address, and a "Tentang Kataloga" block with only real
 * destinations. Alamat only renders when fullAddress exists and stays compact
 * (not a card).
 *
 * WhatsApp is presented as a normal footer contact item (recognizable icon +
 * "WhatsApp" text) with the same restrained visual treatment as the other
 * contact/channel items — never a filled green button. Clicking it still runs
 * the existing onWhatsApp handler so the Customer Interest + guest login rules
 * stay intact. Marketplace clicks reuse the page handler the same way.
 *
 */
function StoreFooter({ store = {}, onWhatsApp, onSelectChannel }) {
  const channels = store.channels ?? []
  const hasChannels = channels.length > 0

  const itemClass =
    'inline-flex max-w-full items-center gap-2.5 text-sm text-on-surface-variant transition-colors hover:text-primary'
  const itemIconClass = 'shrink-0 text-[16px] text-secondary transition-colors group-hover:text-primary'

  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto max-w-[1140px] px-4 pb-10 pt-12 md:px-6 md:pt-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))] lg:gap-x-8">
          <div className="col-span-2 min-w-0 lg:col-span-1">
            <div className="flex items-center gap-3">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={`Logo ${store.name}`}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-sm"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-base font-bold text-on-primary shadow-sm">
                  {storeInitial(store)}
                </span>
              )}
              <span className="truncate text-lg font-bold tracking-tight text-on-surface">
                {store.name || 'Katalog'}
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className={FOOTER_HEADING_CLASS}>Kontak</h3>
            {onWhatsApp ? (
              <ul className="mt-4 space-y-3">
                <li>
                  <button type="button" onClick={onWhatsApp} className={`group ${itemClass}`}>
                    <WhatsAppIcon size={16} className={itemIconClass} />
                    <span className="truncate">WhatsApp</span>
                  </button>
                </li>
              </ul>
            ) : (
              <p className="mt-4 text-sm text-on-surface-variant">-</p>
            )}
          </div>

          <div className="min-w-0">
            <h3 className={FOOTER_HEADING_CLASS}>Marketplace</h3>
            {hasChannels ? (
              <ul className="mt-4 space-y-3">
                {channels.map((channel) => (
                  <li key={channel.name}>
                    <button
                      type="button"
                      onClick={() => onSelectChannel && onSelectChannel(channel)}
                      className={`group ${itemClass}`}
                    >
                      <span
                        className={`material-symbols-outlined ${itemIconClass}`}
                        aria-hidden="true"
                      >
                        open_in_new
                      </span>
                      <span className="truncate">{channel.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-on-surface-variant">Belum ada saluran marketplace.</p>
            )}
          </div>

          {store.fullAddress ? (
            <div className="min-w-0">
              <h3 className={FOOTER_HEADING_CLASS}>Alamat</h3>
              <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-on-surface-variant">
                <span
                  className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-secondary"
                  aria-hidden="true"
                >
                  location_on
                </span>
                <span className="min-w-0">{store.fullAddress}</span>
              </p>
            </div>
          ) : null}

          <div className="col-span-2 min-w-0 lg:col-span-1">
            <h3 className={FOOTER_HEADING_CLASS}>Tentang Kataloga</h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Buat katalog toko lebih rapi dan jualan jadi lebih mudah.
            </p>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline"
                >
                  Platform Kataloga
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline"
                >
                  Buat Toko
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-outline-variant/30 pt-6 text-xs text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Kataloga</p>
          <p>Made with Kataloga</p>
        </div>
      </div>
    </footer>
  )
}

export default StoreFooter