import SectionCard from '../products/form/SectionCard'

/**
 * Announcement banner: single announcement shown on the storefront. Toggled
 * off keeps local text (no data loss) and saves an empty array so the
 * storefront hides the banner.
 *
 * @param {{
 *   enabled: boolean,
 *   text: string,
 *   onToggle: (value: boolean) => void,
 *   onTextChange: (value: string) => void,
 *   children: React.ReactNode,
 * }} props
 */
function AnnouncementSection({ enabled, text, onToggle, onTextChange, children }) {
  return (
    <SectionCard
      icon="campaign"
      title="Pengumuman"
      subtitle="Satu pengumuman untuk customer di halaman toko."
      actions={children}
    >
      <div className="flex flex-col gap-4">
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
          <div>
            <label
              htmlFor="store-announcement"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Isi Pengumuman
            </label>
            <textarea
              id="store-announcement"
              value={text}
              onChange={(event) => onTextChange(event.target.value)}
              placeholder="Contoh: Gratis ongkir untuk pembelian hari ini hingga pukul 17.00 WIB."
              rows={3}
              maxLength={200}
              className="w-full resize-y rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-1 text-right text-[11px] text-secondary">{text.length}/200</p>
          </div>
        ) : null}
      </div>
    </SectionCard>
  )
}

export default AnnouncementSection