/**
 * Quick-apply category chips ("Semua" + each store category). Selecting a
 * chip applies it immediately. The row scrolls horizontally on mobile and
 * wraps on larger screens.
 */

const CATEGORY_ICONS = {
  Laptop: 'laptop_mac',
  Smartphone: 'smartphone',
  'Gadget Gaming': 'sports_esports',
  Aksesoris: 'styler',
  PC: 'desktop_windows',
  Monitor: 'tv',
  Fashion: 'checkroom',
  Pakaian: 'checkroom',
}

function CategoryChips({ categories, active, onSelect }) {
  const options = [{ name: 'Semua', value: 'all' }, ...categories.map((name) => ({ name, value: name }))]

  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      role="group"
      aria-label="Filter kategori"
    >
      {options.map((option) => {
        const isActive = active === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={isActive}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-4 py-2 text-xs shadow-sm transition-colors md:shrink ${
              isActive
                ? 'border-primary bg-primary font-semibold text-on-primary'
                : 'border-outline-variant/30 bg-surface-container-lowest font-medium text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {option.value !== 'all' ? (
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {CATEGORY_ICONS[option.name] ?? 'category'}
              </span>
            ) : null}
            <span className="whitespace-nowrap">{option.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryChips