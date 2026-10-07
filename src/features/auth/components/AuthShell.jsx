import { Link } from 'react-router-dom'

/**
 * Shared shell for the /login and /register pages.
 * Mirrors the approved authentication layout: centered brand header,
 * white form card, back link, and a muted legal footer.
 */
function AuthShell({ title, subtitle, backHref, children }) {
  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-8 sm:px-6">
      <main className="w-full max-w-[420px]">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="mb-6 inline-block text-2xl font-bold tracking-tight text-primary-brand transition-colors hover:text-blue-700"
            aria-label="Kataloga Beranda"
          >
            Kataloga
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-on-surface">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{subtitle}</p> : null}
        </div>

        <section className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          {children}
        </section>

        {backHref ? (
          <div className="mt-5 text-center">
            <Link
              to={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-primary-brand"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                arrow_back
              </span>
              Kembali ke Toko
            </Link>
          </div>
        ) : null}

        <footer className="mt-6 text-center text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>© {year} Kataloga</span>
            <span>•</span>
            <span>Privasi</span>
            <span>•</span>
            <span>Syarat &amp; Ketentuan</span>
            <span>•</span>
            <span>Pusat Bantuan</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default AuthShell