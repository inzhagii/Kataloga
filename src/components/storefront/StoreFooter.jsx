import { Link } from 'react-router-dom'

/**
 * Storefront footer following the approved store landing reference: brand
 * block with tagline, a short Platform link list and a copyright bottom bar.
 * Only links with real destination pages are included.
 */
function StoreFooter() {
  return (
    <footer className="border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto max-w-[1140px] px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-primary-container text-base font-bold text-on-primary shadow-sm">
                K
              </span>
              <span className="text-lg font-bold tracking-tight text-on-surface">Kataloga</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Buat katalog toko lebih rapi dan jualan jadi lebih mudah.
            </p>
          </div>

          <nav aria-label="Platform">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-on-surface">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link to="/" className="text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline">
                  Tentang Kataloga
                </Link>
              </li>
              <li>
                <Link to="/" className="text-sm text-on-surface-variant transition-colors hover:text-primary hover:underline">
                  Buat Toko
                </Link>
              </li>
            </ul>
          </nav>
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