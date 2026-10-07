/**
 * Catalog search input (controlled). Typing updates the parent query state
 * immediately so search / filter / sort stay in sync; a clear button resets
 * the query when present.
 */
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full">
      <span
        className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant"
        aria-hidden="true"
      >
        search
      </span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? 'Cari produk...'}
        aria-label="Cari produk di toko ini"
        className="w-full rounded-xl bg-surface-container-lowest py-3 pl-12 pr-11 text-sm text-on-surface shadow-sm placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            close
          </span>
        </button>
      ) : null}
    </div>
  )
}

export default SearchBar