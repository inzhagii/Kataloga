import { useMemo, useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import Toast from '../../components/shared/Toast'
import StoreIdentitySection from '../../components/seller/mystore/StoreIdentitySection'
import StoreLinkSection from '../../components/seller/mystore/StoreLinkSection'
import StoreInfoSection from '../../components/seller/mystore/StoreInfoSection'
import StoreContactSection from '../../components/seller/mystore/StoreContactSection'
import AnnouncementSection from '../../components/seller/mystore/AnnouncementSection'
import { useMyStore } from '../../hooks/useMyStore'
import { useRegionData } from '../../hooks/useRegionData'
import { canChangeStoreId, checkStoreIdAvailable, updateStore } from '../../services/storeService'
import { recordStoreUpdated } from '../../services/activityService'
import { normalizePhone } from '../../services/authService'
import { normalizeStoreId, validateStoreId } from '../../utils/storeId'
import { validateStoreInformation } from '../../utils/storeValidation'

function SectionToggleButton({ open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? 'Tutup bagian' : 'Buka bagian'}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-container hover:text-on-surface lg:hidden"
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-transform ${open ? 'rotate-90' : ''}`}
        aria-hidden="true"
      >
        chevron_right
      </span>
    </button>
  )
}

function StoreTitleBar({ saving, onSave }) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="hidden h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50 lg:inline-flex"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
        save
      </span>
      {saving ? 'Menyimpan...' : 'Simpan'}
    </button>
  )
}

function dateLabel(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Editor loaded with a concrete store. Keyed by store.storeId from the page so
 * a successful save (including a Store ID change) remounts with fresh values.
 */
function MyStoreEditor({ store, onSaved }) {
  const [form, setForm] = useState({
    storeId: store.storeId || '',
    name: store.name || '',
    description: store.description || '',
    province: store.province || '',
    city: store.city || '',
    fullAddress: store.fullAddress || '',
    operatingHours: store.operatingHours || '',
    whatsapp: store.whatsapp || '',
    logoUrl: store.logoUrl || '',
  })
  const [channels, setChannels] = useState(
    (store.channels || []).map((channel, index) => ({
      id: `channel-${index}`,
      name: channel.name,
      url: channel.url,
    })),
  )
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    Boolean(store.announcement?.isEnabled),
  )
  const [announcementTitle, setAnnouncementTitle] = useState(
    store.announcement?.title ?? '',
  )
  const [announcementMessage, setAnnouncementMessage] = useState(
    store.announcement?.message ?? '',
  )
  const [errors, setErrors] = useState({})
  const [logoError, setLogoError] = useState('')
  const [channelError, setChannelError] = useState('')
  const [linkToast, setLinkToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [openSections, setOpenSections] = useState(() => new Set(['identity']))

  const cooldown = useMemo(() => {
    const { allowed, nextChangeDate } = canChangeStoreId(store)
    return {
      locked: !allowed,
      nextChangeLabel: nextChangeDate ? dateLabel(nextChangeDate) : '',
    }
  }, [store])

  const availability = 'idle'

  const regions = useRegionData(form.province)

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) {
        return current
      }
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function toggleSection(name) {
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  function validate() {
    return validateStoreInformation(form).valid
  }

  async function handleSave() {
    if (!validate()) {
      return
    }
    const nextStoreId = normalizeStoreId(form.storeId)
    const storeIdChanged = nextStoreId !== normalizeStoreId(store.storeId || '')
    if (storeIdChanged && !cooldown.locked) {
      try {
        const { available } = await checkStoreIdAvailable(nextStoreId)
        if (!available) {
          setErrors((current) => ({
            ...current,
            storeId: 'Store ID sudah digunakan. Silakan pilih Store ID lain.',
          }))
          return
        }
      } catch (availabilityError) {
        setErrors((current) => ({
          ...current,
          storeId:
            availabilityError instanceof Error
              ? availabilityError.message
              : 'Tidak dapat memeriksa ketersediaan Store ID. Silakan coba lagi.',
        }))
        return
      }
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim() || store.name,
        description: form.description.trim(),
        province: form.province.trim(),
        city: form.city.trim(),
        fullAddress: form.fullAddress.trim(),
        operatingHours: form.operatingHours.trim(),
        whatsapp: form.whatsapp.trim() ? normalizePhone(form.whatsapp.trim()) : '',
        channels: channels
          .map((channel) => ({ name: channel.name.trim(), url: channel.url.trim() }))
          .filter((channel) => Boolean(channel.name) && Boolean(channel.url)),
        announcement: {
          title: announcementTitle.trim(),
          message: announcementMessage.trim(),
          isEnabled: announcementEnabled,
        },
        logoUrl: form.logoUrl || undefined,
      }
      if (!cooldown.locked) {
        payload.storeId = normalizeStoreId(form.storeId)
      }
      await updateStore(store.storeId, payload)
      await recordStoreUpdated()
      onSaved()
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Gagal menyimpan informasi toko.'
      if (message.toLowerCase().includes('store id')) {
        setErrors((current) => ({ ...current, storeId: message }))
      } else {
        setChannelError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleProps = (name) => ({
    open: openSections.has(name),
    onToggle: () => toggleSection(name),
  })

  return (
    <div>
      <div className="mb-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">My Store</h1>
          <p className="mt-1 text-sm text-secondary">
            Informasi yang muncul di halaman toko publik kamu.
          </p>
        </div>
        <StoreTitleBar saving={saving} onSave={handleSave} />
      </div>

      <div className="space-y-6">
        <section>
          <StoreIdentitySection
            form={form}
            savedStoreId={store.storeId}
            errors={errors}
            availability={availability}
            cooldown={cooldown}
            onStoreIdChange={(value) => setField('storeId', value)}
            onStoreIdBlur={() => setErrors((current) => {
              const next = { ...current }
              if (form.storeId.trim()) {
                const validation = validateStoreId(form.storeId)
                if (validation.valid) {
                  delete next.storeId
                } else {
                  next.storeId = validation.message
                }
              }
              return next
            })}
            onLogoChange={(dataUrl) => {
              setLogoError('')
              setForm((current) => ({ ...current, logoUrl: dataUrl }))
            }}
            onLogoRemove={() => setForm((current) => ({ ...current, logoUrl: '' }))}
            onLogoError={setLogoError}
          >
            <SectionToggleButton {...toggleProps('identity')} />
          </StoreIdentitySection>
        </section>

        <section>
          <StoreLinkSection
            store={store}
            storeId={form.storeId}
            onNotify={(message) => setLinkToast(message)}
          >
            <SectionToggleButton {...toggleProps('link')} />
          </StoreLinkSection>
        </section>

        <section>
          <StoreInfoSection
            store={store}
            form={form}
            errors={errors}
            setField={setField}
            provinces={regions.provinces}
            cities={regions.cities}
            provincesStatus={regions.provincesStatus}
            citiesStatus={regions.citiesStatus}
            regionsError={regions.error}
          >
            <SectionToggleButton {...toggleProps('info')} />
          </StoreInfoSection>
        </section>

        <section>
          <StoreContactSection
            form={form}
            errors={errors}
            setField={setField}
            channels={channels}
            onChannelsChange={(value) => {
              setChannels(value)
              setChannelError('')
            }}
            onChannelError={setChannelError}
          >
            <SectionToggleButton {...toggleProps('contact')} />
          </StoreContactSection>
        </section>

        <section>
          <AnnouncementSection
            title={announcementTitle}
            message={announcementMessage}
            enabled={announcementEnabled}
            onToggle={setAnnouncementEnabled}
            onTitleChange={setAnnouncementTitle}
            onMessageChange={setAnnouncementMessage}
          >
            <SectionToggleButton {...toggleProps('announcement')} />
          </AnnouncementSection>
        </section>

        {channelError ? (
          <p className="flex items-center gap-1.5 rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm font-medium text-error" role="alert">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              error
            </span>
            {channelError}
          </p>
        ) : null}
        {logoError ? (
          <p className="flex items-center gap-1.5 rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm font-medium text-error" role="alert">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              error
            </span>
            {logoError}
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-outline-variant/60 bg-surface-container-lowest px-4 py-3 lg:hidden">
        <RsSavingButton saving={saving} onSave={handleSave} />
      </div>

      <Toast toast={linkToast} onClose={() => setLinkToast(null)} />
    </div>
  )
}

function RsSavingButton({ saving, onSave }) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
        save
      </span>
      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
    </button>
  )
}

function MyStorePage() {
  const { status, store, error, reload } = useMyStore()
  const [toast, setToast] = useState(null)

  if (status === 'loading') {
    return (
      <div className="space-y-5" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-surface-container-high/60" />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-surface-container-high/60" />
      </div>
    )
  }

  if (status === 'error' || !store) {
    return (
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">My Store</h1>
        <EmptyState
          icon="error"
          title="Gagal memuat informasi toko"
          description={error || 'Store tidak ditemukan.'}
          action={
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <MyStoreEditor
        key={store.storeId}
        store={store}
        onSaved={() => {
          setToast({ type: 'success', message: 'Informasi toko berhasil disimpan.' })
          reload()
        }}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default MyStorePage