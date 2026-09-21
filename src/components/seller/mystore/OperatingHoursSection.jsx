import SectionCard from '../products/form/SectionCard'
import OperatingHoursEditor from './OperatingHoursEditor'

/**
 * Jam Operasional section: a structured editor (Hari Mulai / Hari Selesai /
 * Jam Buka / Jam Tutup) that persists a single wire string. Kept visually
 * separate from Informasi Toko and Alamat Lengkap.
 * @param {{
 *   form: { operatingHours: string },
 *   errors: Record<string, string>,
 *   setField: (field: string, value: string) => void,
 *   children: React.ReactNode,
 * }} props
 */
function OperatingHoursSection({ form, errors, setField, children }) {
  return (
    <SectionCard
      icon="schedule"
      title="Jam Operasional"
      subtitle="Jam buka dan tutup toko kamu."
      actions={children}
    >
      <div className="mt-1.5">
        <OperatingHoursEditor
          value={form.operatingHours}
          error={errors.operatingHours}
          onChange={(composed) => setField('operatingHours', composed)}
        />
      </div>
    </SectionCard>
  )
}

export default OperatingHoursSection