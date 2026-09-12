import { Link, Outlet } from 'react-router-dom'

const footerProductLinks = ['Fitur', 'Harga', 'Produk Baru']
const footerHelpLinks = ['Kontak', 'Panduan', 'FAQ']

function PublicLayout() {
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-svh flex-col bg-white">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold tracking-tight text-primary-brand">
            KATALOGA
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-primary-brand md:block"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="inline-flex h-10 items-center gap-1 rounded-lg bg-primary-brand px-5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Buat Toko
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20">
        <Outlet />
      </main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between px-6 py-24 md:flex-row">
          <div className="mb-8 max-w-xs md:mb-0">
            <div className="mb-4 text-xl font-bold tracking-tight text-primary-brand">
              KATALOGA
            </div>
            <p className="mb-6 text-sm text-gray-600">
              Solusi Digital Entrepreneur Indonesia. Kelola toko online Anda dengan mudah, efisien,
              dan profesional.
            </p>
            <div className="text-sm text-gray-500">© {year} Kataloga.</div>
          </div>
          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-text-charcoal">Produk</span>
              {footerProductLinks.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-sm text-gray-600 transition-colors hover:text-primary-brand"
                >
                  {label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-text-charcoal">Bantuan</span>
              {footerHelpLinks.map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-sm text-gray-600 transition-colors hover:text-primary-brand"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout