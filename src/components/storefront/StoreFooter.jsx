import { Link } from 'react-router-dom'
import WhatsAppIcon from '../ui/WhatsAppIcon'
import { buildMapsSearchUrl } from '../../utils/storeLocation'

/**
 * Shared styling for footer section headings (consistent in every block).
 */
const FOOTER_HEADING_CLASS = 'text-xs font-semibold uppercase tracking-wider text-on-surface'

/**
 * Compact customer-facing storefront footer (docs/PRODUCT.md #7 "Storefront
 * Footer"): Store Name + Description, WhatsApp contact, the store's configured
 * external channels (+arbitrary {name,url}), and the optional Full Address.
 * It does NOT render a Store Logo, "Tentang Kataloga", or any other marketing
 * block. The bottom row is a single centered line: `© 2026 Kataloga · Made
 * with Kataloga`, with "Made with Kataloga" linking back to the Kataloga
 * homepage.
 *
 * WhatsApp is presented as a normal footer contact item (recognizable icon +
 * "WhatsApp" text), never a filled green button. Clicking it still runs the
 * existing onWhatsApp handler so the Customer Interest + guest login rules
 * stay intact.
 *
 * `innerRef` exposes the footer element so the page can observe its visibility
 * (floating action bar).
 */
function StoreFooter({ store = {}, onWhatsApp, onSelectChannel, innerRef }) {
  const channels = store.channels ?? []
  const hasChannels = channels.length > 0
  const mapsUrl = store.fullAddress ? buildMapsSearchUrl(store.fullAddress) : null

  const itemClass =
    'inline-flex max-w-full items-center gap-2.5 text-sm text-on-surface-variant transition-colors hover:text-primary'
  const itemIconClass = 'shrink-0 text-[16px] text-secondary transition-colors group-hover:text-primary'

  return (
    <footer ref={innerRef} className="border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto max-w-[1140px] px-4 pb-10 pt-12 md:px-6 md:pt-14">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          <div className="min-w-0">
            <h3 className="text-lg font-bold tracking-tight text-on-surface">
              {store.name || 'Katalog'}
            </h3>
            {store.description ? (
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-surface-variant">
                {store.description}
              </p>
            ) : null}
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
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 transition-colors hover:text-primary hover:underline"
                >
                  {store.fullAddress}
                </a>
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-12 flex justify-center border-t border-outline-variant/30 pt-6 text-xs text-on-surface-variant">
          <p className="whitespace-nowrap">
            © 2026 Kataloga ·{' '}
            <Link to="/" className="transition-colors hover:text-primary">
              Made with Kataloga
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default StoreFooter