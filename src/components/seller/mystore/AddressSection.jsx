import SectionCard from '../products/form/SectionCard'
import { TEXTAREA_CLASS } from './formClasses'

/**
 * Alamat Lengkap: a full-width address field, kept visually separate from
 * Informasi Toko. Optional; no lifecycle-specific validation.
 * @param {{
 *   form: { fullAddress: string },
 *   setField: (field: string, value: string) => void,
 *   children: React.ReactNode,
 * }} props
 */
function AddressSection({ form, setField, children }) {
  return (
    <SectionCard
      icon="location_on"
      title="Alamat Lengkap"
      subtitle="Alamat fisik toko kamu (opsional)."
      actions={children}
    >
      <div className="mt-1.5">
        <label
          htmlFor="store-full-address"
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
        >
          Alamat Lengkap{' '}
          <span className="font-normal lowercase text-secondary">(opsional)</span>
        </label>
        <textarea
          id="store-full-address"
          value={form.fullAddress}
          onChange={(event) => setField('fullAddress', event.target.value)}
          placeholder="Contoh: Jl. Raya Merdeka No. 10, Kec. Coblong"
          rows={2}
          className={TEXTAREA_CLASS}
        />
      </div>
    </SectionCard>
  )
}

export default AddressSection