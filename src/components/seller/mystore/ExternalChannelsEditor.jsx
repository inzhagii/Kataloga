import { useState } from 'react'

function nextChannelId() {
  return `channel-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function isValidUrl(value) {
  if (!value.trim()) {
    return false
  }
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Generic external sales channels (e.g. Shopee/Tokopedia marketplace links).
 * Channels are free-form name + URL, configurable per store, with no
 * fixed platform list or storefront icons (locked requirement).
 *
 * @param {{
 *   channels: { id: string, name: string, url: string }[],
 *   onChange: (value: { id: string, name: string, url: string }[]) => void,
 *   onError: (message: string) => void,
 * }} props
 */
function ExternalChannelsEditor({ channels, onChange, onError }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ name: '', url: '' })

  function addChannel() {
    const name = draft.name.trim()
    const url = draft.url.trim()
    if (!name || !url) {
      onError('Nama dan URL channel wajib diisi.')
      return
    }
    if (!isValidUrl(url)) {
      onError('URL channel tidak valid. Gunakan URL lengkap (https://...).')
      return
    }
    onChange([...channels, { id: nextChannelId(), name, url }])
    setDraft({ name: '', url: '' })
    setAdding(false)
  }

  function updateChannel(id, field, value) {
    onChange(channels.map((channel) => (channel.id === id ? { ...channel, [field]: value } : channel)))
  }

  function removeChannel(id) {
    onChange(channels.filter((channel) => channel.id !== id))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="block text-xs font-bold uppercase tracking-wider text-on-surface">
          External Sales Channel{' '}
          <span className="font-normal lowercase text-secondary">(opsional)</span>
        </span>
        {adding ? (
          <button
            type="button"
            onClick={() => {
              setAdding(false)
              setDraft({ name: '', url: '' })
            }}
            className="text-xs font-semibold text-secondary transition-colors hover:text-on-surface"
          >
            Batal
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              add
            </span>
            Tambah Channel
          </button>
        )}
      </div>

      <p className="mb-3 text-[11px] leading-relaxed text-secondary">
        Tautan marketplace atau channel penjualan lain yang kamu pakai. Customer akan memilih
        channel ini saat menekan tombol Marketplace.
      </p>

      {channels.length === 0 && !adding ? (
        <p className="rounded-lg bg-surface-container-low px-3 py-2.5 text-xs text-on-surface-variant">
          Belum ada channel. Tambahkan tautan ke marketplace atau halaman penjualan kamu.
        </p>
      ) : null}

      <ul className="space-y-3">
        {channels.map((channel) => (
          <li key={channel.id} className="flex items-start gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                value={channel.name}
                onChange={(event) => updateChannel(channel.id, 'name', event.target.value)}
                placeholder="Nama channel (contoh: Shopee)"
                aria-label="Nama channel"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="url"
                value={channel.url}
                onChange={(event) => updateChannel(channel.id, 'url', event.target.value)}
                placeholder="https://..."
                aria-label="URL channel"
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={() => removeChannel(channel.id)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-error-container hover:text-error"
              aria-label={`Hapus channel ${channel.name}`}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                delete
              </span>
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-primary/30 bg-primary-container/30 p-3 sm:grid-cols-2">
          <input
            type="text"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Nama channel"
            aria-label="Nama channel baru"
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="url"
            value={draft.url}
            onChange={(event) => setDraft((current) => ({ ...current, url: event.target.value }))}
            placeholder="https://..."
            aria-label="URL channel baru"
            className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={addChannel}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary transition-all hover:brightness-110 sm:col-span-2"
          >
            Simpan Channel
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default ExternalChannelsEditor