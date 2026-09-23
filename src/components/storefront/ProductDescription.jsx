import { useState } from 'react'

const CLAMP_THRESHOLD = 280

/**
 * "Deskripsi Produk" card. Long descriptions are clamped with an expand /
 * collapse toggle so the initial page stays compact.
 */
function ProductDescription({ description }) {
  const [expanded, setExpanded] = useState(false)
  const text = (description ?? '').trim()

  if (!text) {
    return null
  }

  const isLong = text.length > CLAMP_THRESHOLD

  return (
    <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 border-b border-surface-container pb-3">
        <span className="material-symbols-outlined text-[21px] text-primary" aria-hidden="true">
          subject
        </span>
        <h2 className="text-lg font-bold text-on-surface">Deskripsi Produk</h2>
      </div>

      <p
        className={`whitespace-pre-line text-sm leading-relaxed text-on-surface-variant ${
          isLong && !expanded ? 'line-clamp-4' : ''
        }`}
      >
        {text}
      </p>

      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-blue-700"
        >
          {expanded ? 'Tutup' : 'Lihat selengkapnya'}
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
            {expanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      ) : null}
    </section>
  )
}

export default ProductDescription