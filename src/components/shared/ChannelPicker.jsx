import { useState } from 'react'
import BottomSheet from '../storefront/BottomSheet'
import { CUSTOM_CHANNEL_NAME_REQUIRED } from '../../utils/channels'

/**
 * Shared channel selector for the seller forms (My Store external sales
 * channels and Product external links). Always rendered as a modal on desktop /
 * bottom sheet on mobile — never a dropdown (docs/PRODUCT.md §16).
 *
 * The sheet lists the store-available channel definitions; already-selected
 * channels are disabled so one store/product configuration never references the
 * same channel twice. When `onAddCustom` is provided the seller can create a
 * store-scoped custom channel directly from the sheet.
 *
 * `ChannelPickerList` is exported separately so tests can render the sheet body
 * (the BottomSheet only renders its children while open, which static SSR
 * markup cannot drive).
 *
 * @param {{
 *   triggerLabel: string,
 *   triggerIcon?: string,
 *   sheetTitle: string,
 *   sheetIcon?: string,
 *   definitions: import('../../data/models.js').ChannelDefinition[],
 *   selectedChannelIds?: string[],
 *   onSelect: (definition: import('../../data/models.js').ChannelDefinition) => void,
 *   onAddCustom?: (name: string) => import('../../data/models.js').CustomChannelDefinition,
 * }} props
 */
function ChannelPicker({
  triggerLabel,
  triggerIcon = 'add',
  sheetTitle,
  sheetIcon = 'link',
  definitions = [],
  selectedChannelIds = [],
  onSelect,
  onAddCustom,
}) {
  const [open, setOpen] = useState(false)

  function pick(definition) {
    setOpen(false)
    onSelect(definition)
  }

  function addCustom(name) {
    const definition = onAddCustom(name)
    pick(definition)
    return definition
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary/80"
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          {triggerIcon}
        </span>
        {triggerLabel}
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={sheetTitle} icon={sheetIcon}>
        <ChannelPickerList
          definitions={definitions}
          selectedChannelIds={selectedChannelIds}
          onSelect={pick}
          onAddCustom={onAddCustom ? addCustom : undefined}
        />
      </BottomSheet>
    </>
  )
}

/**
 * Channel picker sheet body. Fully presentational so it can be rendered and
 * tested without opening a modal.
 *
 * @param {{
 *   definitions: import('../../data/models.js').ChannelDefinition[],
 *   selectedChannelIds?: string[],
 *   onSelect: (definition: import('../../data/models.js').ChannelDefinition) => void,
 *   onAddCustom?: (name: string) => import('../../data/models.js').CustomChannelDefinition,
 * }} props
 */
export function ChannelPickerList({
  definitions,
  selectedChannelIds = [],
  onSelect,
  onAddCustom,
}) {
  const [customExpanded, setCustomExpanded] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customError, setCustomError] = useState('')
  const selected = new Set(selectedChannelIds)

  function handleCustomSubmit(event) {
    event.preventDefault()
    const name = customName.trim()
    if (!name) {
      setCustomError(CUSTOM_CHANNEL_NAME_REQUIRED)
      return
    }
    try {
      onAddCustom(name)
      setCustomName('')
      setCustomError('')
      setCustomExpanded(false)
    } catch (caughtError) {
      setCustomError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Gagal menambahkan channel custom. Silakan coba lagi.',
      )
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {definitions.map((definition) => {
        const isSelected = selected.has(definition.id)
        return (
          <button
            key={definition.id}
            type="button"
            disabled={isSelected}
            onClick={() => onSelect(definition)}
            className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
              isSelected
                ? 'cursor-not-allowed opacity-50'
                : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant"
                aria-hidden="true"
              >
                {definition.logo}
              </span>
              <span className="truncate font-medium">{definition.name}</span>
            </span>
            <span className="shrink-0 text-right">
              {isSelected ? (
                <span className="rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  Sudah ditambahkan
                </span>
              ) : (
                <span
                  className="material-symbols-outlined text-[18px] text-on-surface-variant"
                  aria-hidden="true"
                >
                  add
                </span>
              )}
            </span>
          </button>
        )
      })}

      {onAddCustom ? (
        <div className="mt-2 border-t border-outline-variant/60 pt-2">
          {customExpanded ? (
            <form onSubmit={handleCustomSubmit} noValidate className="flex flex-col gap-2">
              <input
                type="text"
                value={customName}
                onChange={(event) => {
                  setCustomName(event.target.value)
                  setCustomError('')
                }}
                placeholder="Nama channel custom"
                aria-label="Nama channel custom"
                className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                  customError ? 'border-error bg-error-container/30' : 'border-outline-variant'
                }`}
              />
              {customError ? (
                <p className="flex items-center gap-1 text-xs font-medium text-error">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    error
                  </span>
                  {customError}
                </p>
              ) : null}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCustomExpanded(false)
                    setCustomName('')
                    setCustomError('')
                  }}
                  className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                >
                  Simpan
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setCustomExpanded(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-on-surface transition-colors hover:bg-surface-container"
            >
              <span
                className="material-symbols-outlined shrink-0 text-[18px] text-primary"
                aria-hidden="true"
              >
                add_link
              </span>
              <span className="font-medium">Buat Channel Custom</span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default ChannelPicker