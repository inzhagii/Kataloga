import SectionCard from './SectionCard'
import ChannelPicker from '../../../shared/ChannelPicker'
import { CMS_CHANNELS } from '../../../../data/mock/channels'
import { resolveChannelRefsForDisplay } from '../../../../utils/channels'

const FIELD_CLASS =
  'w-full rounded-lg border bg-surface px-3 py-2 text-xs text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20'

const FIELD_ERROR_CLASS = 'border-error bg-error-container/30'

/**
 * External Product Links: rows of { channelId, url } references resolved
 * through the shared channel master (CMS channels plus the store's custom
 * channels). The seller picks a channel from a modal/bottom-sheet selector —
 * never a dropdown — then only types the URL for that channel. The same channel
 * cannot be added twice within one product.
 *
 * A selected link stays editable with an empty URL; Publish blocks on it
 * (inline red error per channel, "URL external wajib diisi.") instead of
 * silently dropping the row.
 *
 * @param {{
 *   form: object,
 *   errors: Record<string, string>,
 *   channelDefinitions: import('../../../data/models.js').ChannelDefinition[],
 *   addExternalLink: (channelId: string) => void,
 *   updateExternalLink: (index: number, patch: object) => void,
 *   removeExternalLink: (index: number) => void,
 * }} props
 */
function ProductExternalLinksSection({
  form,
  errors = {},
  channelDefinitions = CMS_CHANNELS,
  addExternalLink,
  updateExternalLink,
  removeExternalLink,
}) {
  const links = form.externalLinks || []
  const resolved = resolveChannelRefsForDisplay(links, channelDefinitions)
  const selectedChannelIds = links.map((link) => link.channelId).filter(Boolean)

  return (
    <SectionCard
      icon="link"
      title="External Product Links"
      subtitle="Tautan tempat customer dapat melihat atau membeli produk ini."
      actions={
        <ChannelPicker
          triggerLabel="+ Tambah Link"
          sheetTitle="Tambah Link External"
          sheetIcon="link"
          definitions={channelDefinitions}
          selectedChannelIds={selectedChannelIds}
          onSelect={(definition) => addExternalLink(definition.id)}
        />
      }
    >
      <div className="flex flex-col gap-3">
        {links.length === 0 ? (
          <p className="text-sm text-secondary">
            Tidak ada link. Gunakan "+ Tambah Link" untuk memilih channel external dari daftar.
          </p>
        ) : (
          resolved.map((link, index) => {
            const channelError = errors[`channel-${index}`]
            return (
              <div
                key={link.channelId}
                className="flex flex-col gap-3 rounded-lg border border-outline-variant/40 bg-surface p-3 sm:flex-row sm:items-stretch"
              >
                <div className="flex items-center gap-2 sm:w-48">
                  <span
                    className="material-symbols-outlined text-[18px] text-on-surface-variant"
                    aria-hidden="true"
                  >
                    {link.logo}
                  </span>
                  <span className="truncate text-sm font-semibold text-on-surface">{link.name}</span>
                </div>
                <div className="flex-1">
                  <input
                    type="url"
                    value={link.url}
                    onChange={(event) =>
                      updateExternalLink(index, { url: event.target.value })
                    }
                    placeholder="https://..."
                    aria-label={`URL link ${index + 1} (${link.name})`}
                    aria-invalid={Boolean(channelError)}
                    className={`${FIELD_CLASS} ${channelError ? FIELD_ERROR_CLASS : 'border-outline-variant'}`}
                  />
                  {channelError ? (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
                      <span className="material-symbols-outlined text-sm" aria-hidden="true">
                        error
                      </span>
                      {channelError}
                    </p>
                  ) : null}
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
            )
          })
        )}
      </div>
    </SectionCard>
  )
}

export default ProductExternalLinksSection