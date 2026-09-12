import { useEffect, useState } from 'react'
import { getMyStore } from '../../../services/storeService'
import { buildStoreUrl } from '../../../utils/storeId'

/**
 * Read-only store summary in the Account page: name, logo, verification,
 * Store ID with a one-click copy, and a link to the full My Store editor.
 * Loaded independently so a profile save does not require passing store data
 * from the AccountPage.
 */
function SellerStoreCard() {
  const [store, setStore] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const result = await getMyStore()
      if (!active) {
        return
      }
      setStore(result || null)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (!store) {
    return null
  }

  async function handleCopy() {
    const url = buildStoreUrl(store.storeId)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <section className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-5 border-b border-outline-variant/30 pb-4">
        <h2 className="text-base font-bold text-on-surface">Ringkasan Toko</h2>
        <p className="text-xs text-secondary">Informasi publik dari toko kamu.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low">
          {store.logoUrl ? (
            <img src={store.logoUrl} alt="Logo toko" className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[28px] text-on-surface-variant/50" aria-hidden="true">
              storefront
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-bold text-on-surface">{store.name}</p>
            {store.verified ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Verified
              </span>
            ) : null}
          </div>
          <p className="text-xs text-secondary">{buildStoreUrl(store.storeId)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {copied ? 'check_circle' : 'content_copy'}
          </span>
          {copied ? 'URL disalin.' : 'Salin URL'}
        </button>
        <a
          href="/seller/my-store"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            edit
          </span>
          Kelola Toko
        </a>
      </div>
    </section>
  )
}

export default SellerStoreCard