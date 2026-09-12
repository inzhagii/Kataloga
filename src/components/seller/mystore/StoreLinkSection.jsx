import { useState } from 'react'
import SectionCard from '../products/form/SectionCard'
import { buildStoreUrl, normalizeStoreId, validateStoreId } from '../../../utils/storeId'

const INPUT_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

/**
 * Resolve the Store ID used for the public link from the live form value:
 * a valid typed Store ID wins; empty or invalid input falls back to the
 * saved Store ID. Reuses the existing Store ID validation/normalization
 * helpers (src/utils/storeId.js).
 * @param {string} typed - Live Store ID input value.
 * @param {string} saved - Saved store.storeId fallback.
 * @returns {string}
 */
function resolveLiveStoreId(typed, saved) {
  const value = String(typed ?? '').trim()
  if (!value) {
    return saved
  }
  const { valid } = validateStoreId(value)
  if (!valid) {
    return saved
  }
  return normalizeStoreId(value)
}

/**
 * Store link section: shows the derived public storefront URL
 * ({origin}/{storeId}). The link updates live with the typed Store ID and is
 * never persisted. Salin copies the exact URL; Bagikan uses the native share
 * sheet when available and gracefully falls back to copying otherwise.
 *
 * @param {{
 *   store: import('../../../data/models.js').Store,
 *   storeId: string,
 *   onNotify: (message: { type: 'success'|'error', message: string }) => void,
 *   children: React.ReactNode,
 * }} props
 */
function StoreLinkSection({ store, storeId, onNotify, children }) {
  const [copied, setCopied] = useState(false)

  const url = buildStoreUrl(resolveLiveStoreId(storeId, store.storeId))

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onNotify({ type: 'success', message: 'Link toko berhasil disalin.' })
    } catch {
      onNotify({ type: 'error', message: 'Gagal menyalin link. Salin URL secara manual.' })
    }
  }

  function handleShare() {
    const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share)
    if (!canNativeShare) {
      void handleCopy()
      return
    }
    void navigator.share({ title: store.name, text: store.name, url }).catch(() => {})
  }

  return (
    <SectionCard
      icon="link"
      title="Link Toko"
      subtitle="Bagikan alamat toko kamu di storefront."
      actions={children}
    >
      <div className="mt-1.5 flex flex-col gap-6">
        <div>
          <label
            htmlFor="store-link-url"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Alamat Toko
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <input
                id="store-link-url"
                type="text"
                readOnly
                value={url}
                onFocus={(event) => event.target.select()}
                className={`${INPUT_CLASS} pr-10 font-medium`}
              />
              <span
                className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-outline"
                aria-hidden="true"
              >
                link
              </span>
            </div>
            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline-variant px-3.5 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low sm:flex-none"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 sm:flex-none"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  share
                </span>
                Bagikan
              </button>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-secondary">
          Link mengikuti Store ID kamu dan diperbarui otomatis.
        </p>
      </div>
    </SectionCard>
  )
}

export default StoreLinkSection