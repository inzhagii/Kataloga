import SectionCard from '../products/form/SectionCard'
import ExternalChannelsEditor from './ExternalChannelsEditor'

/**
 * Store contact: WhatsApp number and generic external sales channels.
 *
 * @param {{
 *   form: { whatsapp: string },
 *   errors: Record<string, string>,
 *   setField: (field: string, value: string) => void,
 *   channels: { id: string, name: string, url: string }[],
 *   onChannelsChange: (value: { id: string, name: string, url: string }[]) => void,
 *   onChannelError: (message: string) => void,
 *   children: React.ReactNode,
 * }} props
 */
function StoreContactSection({
  form,
  errors,
  setField,
  channels,
  onChannelsChange,
  onChannelError,
  children,
}) {
  return (
    <SectionCard
      icon="contact_phone"
      title="Kontak &amp; Channel"
      subtitle="Cara customer menghubungi kamu dari storefront."
      actions={children}
    >
      <div className="flex flex-col gap-6">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="store-whatsapp"
              className="block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Nomor WhatsApp{' '}
              <span className="font-normal lowercase text-secondary">(opsional)</span>
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
            <p className="mt-1.5 text-[11px] text-secondary">
              Format internasional: 6281234567890.
            </p>
          )}
        </div>

        <ExternalChannelsEditor
          channels={channels}
          onChange={onChannelsChange}
          onError={onChannelError}
        />
      </div>
    </SectionCard>
  )
}

export default StoreContactSection