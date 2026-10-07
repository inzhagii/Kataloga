import { useEffect, useMemo, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import EmptyState from '../../../components/ui/EmptyState'
import Toast from '../../../components/ui/Toast'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import StoreLinkSection from '../components/StoreLinkSection'
import StoreInfoSection from '../components/StoreInfoSection'
import AddressSection from '../components/AddressSection'
import OperatingHoursSection from '../components/OperatingHoursSection'
import StoreContactSection from '../components/StoreContactSection'
import StoreCtaOptionsSection from '../components/StoreCtaOptionsSection'
import AnnouncementSection from '../components/AnnouncementSection'
import { withDefaultCtaOptions } from '../../../constants/cta'
import { CMS_CHANNELS } from '../../../data/mock/channels'
import { buildCustomChannelDefinition, ownerStoreIdForChannels } from '../../../utils/channels'
import { useMyStore } from '../hooks/useMyStore'
import { useRegionData } from '../hooks/useRegionData'
import { normalizePhone } from '../../../services/authService'
import { normalizeStoreId, validateStoreId } from '../../../utils/storeId'
import { validateStoreInformation, validateStoreChannels } from '../validation/storeValidation'

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
function MyStoreEditor({
  store,
  onSaved,
  canChangeStoreId,
  checkStoreIdAvailable,
  updateStore,
  recordStoreUpdated,
}) {
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
  const [channels, setChannels] = useState(() =>
    (store.channels || []).map((channel) => ({
      channelId: channel.channelId,
      url: channel.url ?? '',
    })),
  )
  const [customChannels, setCustomChannels] = useState(() => store.customChannels || [])
  const channelDefinitions = useMemo(
    () => [...CMS_CHANNELS, ...customChannels],
    [customChannels],
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
  const [ctaOptions, setCtaOptions] = useState(() => withDefaultCtaOptions(store.ctaOptions))
  const [errors, setErrors] = useState({})
  const [logoError, setLogoError] = useState('')
  const [channelError, setChannelError] = useState('')
  const [linkToast, setLinkToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  const blocker = useBlocker(() => dirty)

  useEffect(() => {
    if (!dirty) {
      return undefined
    }
    function handleBeforeUnload(event) {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [dirty])

  const cooldown = useMemo(() => {
    const { allowed, nextChangeDate } = canChangeStoreId(store)
    return {
      locked: !allowed,
      nextChangeLabel: nextChangeDate ? dateLabel(nextChangeDate) : '',
    }
  }, [store, canChangeStoreId])

  // The Store identity stamped onto this store's custom channel definitions.
  // A valid typed Store ID wins (mirrors StoreLinkSection's live link), else the
  // saved Store ID is used, so a successful rename propagates without leaving a
  // stale previous Store ID on the definitions.
  const resolvedStoreId = useMemo(() => {
    if (cooldown.locked) {
      return store.storeId
    }
    const value = String(form.storeId ?? '').trim()
    if (!value) {
      return store.storeId
    }
    return validateStoreId(value).valid ? normalizeStoreId(value) : store.storeId
  }, [cooldown.locked, store.storeId, form.storeId])

  const regions = useRegionData(form.province)

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setDirty(true)
    setErrors((current) => {
      if (!current[field]) {
        return current
      }
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function validate() {
    const result = validateStoreInformation(form)
    if (channels.length > 0) {
      Object.assign(result.errors, validateStoreChannels(channels).errors)
    }
    result.valid = Object.keys(result.errors).length === 0
    return result
  }

  function handleCustomChannelCreate(name) {
    const definition = buildCustomChannelDefinition({
      storeId: resolvedStoreId,
      name,
      existingChannelIds: customChannels.map((item) => item.id),
      existingNames: customChannels.map((item) => item.name),
    })
    setCustomChannels((current) => [...current, definition])
    setDirty(true)
    return definition
  }

  async function handleSave() {
    const result = validate()
    if (!result.valid) {
      setErrors(result.errors)
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
        channels: channels.map((channel) => ({
          channelId: channel.channelId,
          url: String(channel.url ?? '').trim(),
        })),
        customChannels: ownerStoreIdForChannels(customChannels, resolvedStoreId).map(
          (definition) => ({
            ...definition,
            name: definition.name.trim(),
          }),
        ),
        announcement: {
          title: announcementTitle.trim(),
          message: announcementMessage.trim(),
          isEnabled: announcementEnabled,
        },
        ctaOptions: withDefaultCtaOptions(ctaOptions),
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
          <StoreLinkSection
            store={store}
            storeId={form.storeId}
            error={errors.storeId}
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
            onNotify={(message) => setLinkToast(message)}
          />
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
            onLogoChange={(dataUrl) => {
              setLogoError('')
              setDirty(true)
              setForm((current) => ({ ...current, logoUrl: dataUrl }))
            }}
            onLogoRemove={() => {
              setDirty(true)
              setForm((current) => ({ ...current, logoUrl: '' }))
            }}
            onLogoError={setLogoError}
          />
        </section>

        <section>
          <OperatingHoursSection form={form} errors={errors} setField={setField} />
        </section>

        <section>
          <AddressSection form={form} setField={setField} />
        </section>

        <section>
          <StoreContactSection
            form={form}
            errors={errors}
            setField={setField}
            channels={channels}
            definitions={channelDefinitions}
            onChannelsChange={(value) => {
              setChannels(value)
              setChannelError('')
              setErrors((current) => {
                const next = { ...current }
                Object.keys(next).forEach((key) => {
                  if (key.startsWith('channel-')) {
                    delete next[key]
                  }
                })
                return next
              })
              setDirty(true)
            }}
            onCustomChannelCreate={handleCustomChannelCreate}
          />
        </section>

        <section>
          <StoreCtaOptionsSection
            options={ctaOptions}
            onOptionsChange={(value) => {
              setCtaOptions(value)
              setDirty(true)
            }}
          />
        </section>

        <section>
          <AnnouncementSection
            title={announcementTitle}
            message={announcementMessage}
            enabled={announcementEnabled}
            onToggle={(value) => {
              setAnnouncementEnabled(value)
              setDirty(true)
            }}
            onTitleChange={(value) => {
              setAnnouncementTitle(value)
              setDirty(true)
            }}
            onMessageChange={(value) => {
              setAnnouncementMessage(value)
              setDirty(true)
            }}
          />
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

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Meninggalkan halaman?"
        description="Perubahan belum disimpan. Yakin ingin meninggalkan halaman?"
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onConfirm={() => blocker.proceed()}
        onCancel={() => blocker.reset()}
      />

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
  const {
    status,
    store,
    error,
    reload,
    canChangeStoreId,
    checkStoreIdAvailable,
    updateStore,
    recordStoreUpdated,
  } = useMyStore()
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
        canChangeStoreId={canChangeStoreId}
        checkStoreIdAvailable={checkStoreIdAvailable}
        updateStore={updateStore}
        recordStoreUpdated={recordStoreUpdated}
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