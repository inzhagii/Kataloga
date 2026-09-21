import SectionCard from '../products/form/SectionCard'

const TITLE_MAX = 60
const MESSAGE_MAX = 200

/**
 * Announcement: single announcement (title + message) shown on the
 * storefront. Toggled off keeps the local title/message (no data loss) and
 * saves isEnabled=false so the storefront hides the banner.
 *
 * @param {{
 *   title: string,
 *   message: string,
 *   enabled: boolean,
 *   onToggle: (value: boolean) => void,
 *   onTitleChange: (value: string) => void,
 *   onMessageChange: (value: string) => void,
 *   children: React.ReactNode,
 * }} props
 */
function AnnouncementSection({
  title,
  message,
  enabled,
  onToggle,
  onTitleChange,
  onMessageChange,
  children,
}) {
  return (
    <SectionCard
      icon="campaign"
      title="Pengumuman"
      subtitle="Satu pengumuman untuk customer di halaman toko."
      actions={children}
    >
      <div className="mt-1.5 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-on-surface">Tampilkan pengumuman</p>
            <p className="mt-0.5 text-xs text-secondary">
              Matikan untuk menyembunyikan pengumuman dari storefront.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Tampilkan pengumuman"
            onClick={() => onToggle(!enabled)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              enabled ? 'bg-primary' : 'bg-surface-container-high'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                enabled ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {enabled ? (
          <div className="flex flex-col gap-5">
            <div>
              <label
                htmlFor="store-announcement-title"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
              >
                Judul Pengumuman
              </label>
              <input
                id="store-announcement-title"
                type="text"
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Contoh: Promo Akhir Tahun"
                maxLength={TITLE_MAX}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-2 text-right text-[11px] text-secondary">
                {title.length}/{TITLE_MAX}
              </p>
            </div>
            <div>
              <label
                htmlFor="store-announcement-message"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
              >
                Isi Pengumuman
              </label>
              <textarea
                id="store-announcement-message"
                value={message}
                onChange={(event) => onMessageChange(event.target.value)}
                placeholder="Contoh: Gratis ongkir untuk pembelian hari ini hingga pukul 17.00 WIB."
                rows={3}
                maxLength={MESSAGE_MAX}
                className="w-full resize-y rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-2 text-right text-[11px] text-secondary">
                {message.length}/{MESSAGE_MAX}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}

export default AnnouncementSection