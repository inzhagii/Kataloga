import { useEffect, useRef, useState } from 'react'
import { CONDITION_OPTIONS } from '../../constants/storefront'
import BottomSheet from './BottomSheet'

/**
 * Staged filter UI: Category + Condition (New/Second) with an explicit
 * "Terapkan Filter" step. Desktop opens a compact popover, mobile opens a
 * bottom sheet — both share the same content and business behavior.
 */
function FilterControl({ categories = [], appliedCategory = 'all', appliedCondition = 'all', onApply }) {
  const [pendingCategory, setPendingCategory] = useState(appliedCategory)
  const [pendingCondition, setPendingCondition] = useState(appliedCondition)
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }
    function handleMouseDown(event) {
      if (anchorRef.current && !anchorRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  function openSheet() {
    setPendingCategory(appliedCategory)
    setPendingCondition(appliedCondition)
    setOpen(true)
  }

  function applyFilters() {
    onApply(pendingCategory, pendingCondition)
    setOpen(false)
  }

  function resetFilters() {
    setPendingCategory('all')
    setPendingCondition('all')
  }

  const categoryOptions = ['all', ...categories]

  function pillClasses(active) {
    return active
      ? 'inline-flex items-center justify-center gap-1.5 rounded-xl border border-primary bg-primary px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors shadow-sm'
      : 'inline-flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container text-on-surface-variant px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors hover:text-on-surface'
  }

  const filterContent = (
    <div className="flex flex-col gap-5">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Kategori</span>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
          <button
            type="button"
            className={pillClasses(pendingCategory === 'all')}
            onClick={() => setPendingCategory('all')}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              apps
            </span>
            <span>Semua</span>
          </button>
          {categoryOptions
            .filter((item) => item !== 'all')
            .map((item) => (
              <button
                key={item}
                type="button"
                className={pillClasses(pendingCategory === item)}
                onClick={() => setPendingCategory(item)}
              >
                {item}
              </button>
            ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">Kondisi</span>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Filter kondisi">
          {CONDITION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={pillClasses(pendingCondition === option.value)}
              onClick={() => setPendingCondition(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs font-medium text-on-surface-variant underline underline-offset-2 transition-colors hover:text-primary"
        >
          Reset Filter
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700"
        >
          Terapkan Filter
        </button>
      </div>
    </div>
  )

  // Desktop popover
  const desktopTrigger = (
    <div className="relative hidden md:block" ref={anchorRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-2 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
          tune
        </span>
        <span>Filter</span>
        {(appliedCategory !== 'all' || appliedCondition !== 'all') ? (
          <span className="ml-0.5 h-2 w-2 rounded-full bg-primary" aria-label="Filter aktif" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-[340px] rounded-2xl bg-surface-container-lowest p-4 shadow-xl">
          {filterContent}
        </div>
      ) : null}
    </div>
  )

  // Mobile trigger + bottom sheet
  const mobileTrigger = (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-2.5 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container md:hidden"
      >
        <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
          tune
        </span>
        <span>Filter</span>
      </button>

      <div className="md:hidden">
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Filter Produk"
          icon="tune"
        >
          {filterContent}
        </BottomSheet>
      </div>
    </>
  )

  return (
    <>
      {desktopTrigger}
      {mobileTrigger}
    </>
  )
}

export default FilterControl