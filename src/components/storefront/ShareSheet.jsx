import { useState } from 'react'
import BottomSheet from './BottomSheet'

/**
 * Share dialog (mobile bottom sheet / desktop centered dialog). Uses the
 * native share sheet when available, otherwise copy-to-clipboard with a
 * WhatsApp share fallback. Sharing is not Customer Interest.
 */
function ShareSheet({ open, onClose, title, description, url, whatsappText }) {
  const [copied, setCopied] = useState(false)
  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share)

  function handleClose() {
    setCopied(false)
    onClose()
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function handleNativeShare() {
    void navigator.share({ title, text: whatsappText, url }).catch(() => {})
  }

  function handleWhatsAppShare() {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={title} icon="share">
      <div className="flex flex-col gap-3">
        {description ? (
          <p className="text-xs leading-relaxed text-on-surface-variant">{description}</p>
        ) : null}

        <div className="flex items-center gap-2 rounded-xl bg-surface-container p-2 pl-3">
          <span className="min-w-0 flex-1 truncate text-xs text-on-surface-variant">{url}</span>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              copied
                ? 'bg-green-500/15 text-green-600'
                : 'bg-primary text-on-primary hover:bg-blue-700'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Tersalin!' : 'Salin'}</span>
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-3 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700 sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              chat
            </span>
            <span>Bagikan ke WhatsApp</span>
          </button>

          {canNativeShare ? (
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container sm:text-sm"
            >
              <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
                share
              </span>
              <span>Bagikan lainnya</span>
            </button>
          ) : null}
        </div>
      </div>
    </BottomSheet>
  )
}

export default ShareSheet