import ChannelPicker from '../../shared/ChannelPicker'
import { CMS_CHANNELS } from '../../../data/mock/channels'
import { resolveChannelRefsForDisplay } from '../../../utils/channels'

const FIELD_CLASS =
  'w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

const FIELD_ERROR_CLASS = 'border-error bg-error-container/30'

/**
 * External Sales Channel editor (My Store).
 *
 * Channels are persisted as { channelId, url } references over the shared
 * channel master (CMS channels + the store's own custom channels). The seller
 * picks a channel from a modal/bottom-sheet selector (never a dropdown), then
 * only types the URL — the channel name/logo come from its definition. A store
 * configuration never references the same channel twice (the selector disables
 * already-added channels).
 *
 * An added channel stays editable with an empty URL; My Store save blocks on it
 * (inline red error per channel, "URL external wajib diisi.") instead of
 * silently dropping the row.
 *
 * @param {{
 *   channels: { channelId: string, url: string }[],
 *   definitions: import('../../../data/models.js').ChannelDefinition[],
 *   errors: Record<string, string>,
 *   onChange: (channels: { channelId: string, url: string }[]) => void,
 *   onCustomChannelCreate: (name: string) => import('../../../data/models.js').CustomChannelDefinition,
 * }} props
 */
function ExternalChannelsEditor({
  channels,
  definitions = CMS_CHANNELS,
  errors = {},
  onChange,
  onCustomChannelCreate,
}) {
  const list = channels ?? []
  const resolved = resolveChannelRefsForDisplay(list, definitions)
  const selectedChannelIds = list.map((channel) => channel.channelId).filter(Boolean)

  function addChannel(definition) {
    if (list.some((channel) => channel.channelId === definition.id)) {
      return
    }
    onChange([...list, { channelId: definition.id, url: '' }])
  }

  function updateChannel(index, url) {
    onChange(list.map((channel, channelIndex) => (channelIndex === index ? { ...channel, url } : channel)))
  }

  function removeChannel(index) {
    onChange(list.filter((_, channelIndex) => channelIndex !== index))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="block text-xs font-bold uppercase tracking-wider text-on-surface">
          External Sales Channel{' '}
          <span className="font-normal lowercase text-secondary">(opsional)</span>
        </span>
        <ChannelPicker
          triggerLabel="+ Tambah External Channel"
          sheetTitle="Tambah External Channel"
          sheetIcon="link"
          definitions={definitions}
          selectedChannelIds={selectedChannelIds}
          onSelect={addChannel}
          onAddCustom={onCustomChannelCreate}
        />
      </div>

      <p className="mb-3 text-[11px] leading-relaxed text-secondary">
        Channel penjualan luar yang kamu pakai — pilih dari daftar lalu isi URL. Nama dan ikon
        mengikuti channel tersebut. Customer memilih channel ini saat menekan tombol Marketplace.
      </p>

      {list.length === 0 ? (
        <p className="rounded-lg bg-surface-container-low px-3 py-2.5 text-xs text-on-surface-variant">
          Belum ada channel. Gunakan "+ Tambah External Channel" untuk memilih dari daftar.
        </p>
      ) : null}

      <ul className="space-y-3">
        {resolved.map((channel, index) => {
          const channelError = errors[`channel-${index}`]
          return (
            <li
              key={channel.channelId}
              className="flex items-start gap-2.5 rounded-lg border border-outline-variant/40 bg-surface p-3"
            >
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[200px_1fr]">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant"
                    aria-hidden="true"
                  >
                    {channel.logo}
                  </span>
                  <span className="truncate text-sm font-semibold text-on-surface">
                    {channel.name}
                  </span>
                </div>
                <div>
                  <input
                    type="url"
                    value={channel.url}
                    onChange={(event) => updateChannel(index, event.target.value)}
                    placeholder="https://..."
                    aria-label={`URL channel ${channel.name}`}
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
              </div>
              <button
                type="button"
                onClick={() => removeChannel(index)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-error-container hover:text-error"
                aria-label={`Hapus channel ${channel.name}`}
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  delete
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ExternalChannelsEditor