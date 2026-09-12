import SectionCard from './SectionCard'

const FIELD_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-xs text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20'

/**
 * External Product Links: generic { name, url } rows. Channel names are free
 * text (not a fixed marketplace list, no logos/icons).
 * @param {{
 *   form: object,
 *   addExternalLink: () => void,
 *   updateExternalLink: (index: number, patch: object) => void,
 *   removeExternalLink: (index: number) => void,
 * }} props
 */
function ProductExternalLinksSection({
  form,
  addExternalLink,
  updateExternalLink,
  removeExternalLink,
}) {
  const links = form.externalLinks || []

  return (
    <SectionCard
      icon="link"
      title="External Product Links"
      subtitle="Tautan tempat customer dapat melihat atau membeli produk ini."
      actions={
        <button
          type="button"
          onClick={addExternalLink}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add
          </span>
          + Tambah Link
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {links.length === 0 ? (
          <p className="text-sm text-secondary">
            Tidak ada link. Tambahkan channel eksternal (misal: Shopee, Tokopedia, Website).
          </p>
        ) : (
          links.map((link, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-outline-variant/40 bg-surface p-3 sm:flex-row sm:items-stretch"
            >
              <div className="w-full sm:w-48">
                <input
                  type="text"
                  value={link.name}
                  onChange={(event) => updateExternalLink(index, { name: event.target.value })}
                  placeholder="Nama channel (misal: Shopee)"
                  className={`${FIELD_CLASS} font-medium`}
                  aria-label={`Nama link ${index + 1}`}
                />
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={link.url}
                  onChange={(event) => updateExternalLink(index, { url: event.target.value })}
                  placeholder="https://..."
                  className={FIELD_CLASS}
                  aria-label={`URL link ${index + 1}`}
                />
              </div>
              <div className="flex justify-end sm:justify-start">
                <button
                  type="button"
                  onClick={() => removeExternalLink(index)}
                  className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-error-container hover:text-error"
                  aria-label={`Hapus link ${index + 1}`}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">
                    delete
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  )
}

export default ProductExternalLinksSection