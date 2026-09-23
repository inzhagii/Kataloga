import SectionCard from '../products/form/SectionCard'
import ExternalChannelsEditor from './ExternalChannelsEditor'

/**
 * Store contact: WhatsApp number and external sales channels.
 *
 * Channels are { channelId, url } references resolved through the shared
 * channel master; the section only wires the editor, My Store save owns
 * validation/persistence. Per-channel URL errors arrive on `errors` keyed
 * `channel-<index>` so the editor can highlight the affected row.
 *
 * @param {{
 *   form: { whatsapp: string },
 *   errors: Record<string, string>,
 *   setField: (field: string, value: string) => void,
 *   channels: { channelId: string, url: string }[],
 *   definitions: import('../../../data/models.js').ChannelDefinition[],
 *   onChannelsChange: (value: { channelId: string, url: string }[]) => void,
 *   onCustomChannelCreate: (name: string) => import('../../../data/models.js').CustomChannelDefinition,
 *   children: React.ReactNode,
 * }} props
 */
function StoreContactSection({
  form,
  errors,
  setField,
  channels,
  definitions,
  onChannelsChange,
  onCustomChannelCreate,
  children,
}) {
  return (
    <SectionCard
      icon="contact_phone"
      title="Kontak &amp; Channel"
      subtitle="Cara customer menghubungi kamu dari storefront."
      actions={children}
    >
      <div className="mt-1.5 flex flex-col gap-6">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="store-whatsapp"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Nomor WhatsApp
            </label>
            <span
              className="material-symbols-outlined text-[18px] text-emerald-600"
              aria-hidden="true"
            >
              chat
            </span>
          </div>
          <input
            id="store-whatsapp"
            type="tel"
            inputMode="tel"
            value={form.whatsapp}
            onChange={(event) => setField('whatsapp', event.target.value)}
            placeholder="Contoh: 6281234567890"
            className={`w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 ${
              errors.whatsapp ? 'border-error bg-error-container/30' : ''
            }`}
          />
          {errors.whatsapp ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                error
              </span>
              {errors.whatsapp}
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-secondary">
              Format internasional: 6281234567890.
            </p>
          )}
        </div>

        <ExternalChannelsEditor
          channels={channels}
          definitions={definitions}
          errors={errors}
          onChange={onChannelsChange}
          onCustomChannelCreate={onCustomChannelCreate}
        />
      </div>
    </SectionCard>
  )
}

export default StoreContactSection