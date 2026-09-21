import { useState } from 'react'

/**
 * Single store announcement (max one — no carousel). Reads the announcement
 * object { title, message, isEnabled }: when isEnabled is false the banner is
 * hidden but the data stays on the store. Long text is clamped to two lines
 * with an expand/collapse toggle.
 */
function AnnouncementBanner({ announcement }) {
  const [expanded, setExpanded] = useState(false)

  const data =
    announcement && typeof announcement === 'object' && announcement.isEnabled
      ? announcement
      : null
  const title = (data?.title ?? '').trim()
  const message = (data?.message ?? '').trim()

  if (!title && !message) {
    return null
  }

  return (
    <section
      className="mb-6 flex items-start gap-3 rounded-2xl border border-outline-variant/20 bg-primary/10 p-4 shadow-sm sm:mb-10 sm:p-5"
      aria-label="Pengumuman"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary">
        <span
          className="material-symbols-outlined text-[22px]"
          aria-hidden="true"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          campaign
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-on-primary">
          Pengumuman
        </span>
        {title ? (
          <h2 className="mt-1.5 text-sm font-bold text-on-surface sm:text-base">{title}</h2>
        ) : null}
        {message ? (
          <>
            <p
              className={`mt-1.5 whitespace-pre-line text-xs leading-relaxed text-on-surface sm:text-sm ${
                expanded ? '' : 'line-clamp-2'
              }`}
            >
              {message}
            </p>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-blue-700 sm:text-xs"
              aria-expanded={expanded}
            >
              {expanded ? 'Tutup' : 'Baca selengkapnya'}
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                {expanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </>
        ) : null}
      </div>
    </section>
  )
}

export default AnnouncementBanner