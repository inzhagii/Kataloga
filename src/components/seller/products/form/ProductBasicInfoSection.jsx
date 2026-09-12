import SectionCard from './SectionCard'

const INPUT_CLASS =
  'w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline transition-all outline-none focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20'

/**
 * Build optgroups for the 2-level category hierarchy. Only leaf categories
 * are selectable (a product has exactly one category in V1).
 * @param {import('../../../../data/models.js').Category[]} categories
 * @returns {{ label: string, options: { value: string, label: string }[] }[]}
 */
function buildCategoryOptions(categories) {
  const parents = categories.filter((category) => category.parentId === null)
  const leafIds = new Set(
    categories
      .filter((category) => !categories.some((other) => other.parentId === category.id))
      .map((category) => category.id),
  )

  const groups = parents
    .map((parent) => {
      const children = categories.filter(
        (category) => category.parentId === parent.id && leafIds.has(category.id),
      )
      if (children.length === 0) {
        return null
      }
      return {
        label: parent.name,
        options: children.map((child) => ({ value: child.name, label: child.name })),
      }
    })
    .filter(Boolean)

  const unmatched = categories.filter(
    (category) => category.parentId === null && leafIds.has(category.id),
  )
  if (unmatched.length > 0) {
    groups.unshift({
      label: 'General',
      options: unmatched.map((category) => ({ value: category.name, label: category.name })),
    })
  }

  return groups
}

/**
 * Basic Information: product name, category (2-level) and optional brand.
 * @param {{
 *   form: object,
 *   errors: Record<string, string>,
 *   categories: import('../../../../data/models.js').Category[],
 *   setField: (field: string, value: unknown) => void,
 * }} props
 */
function ProductBasicInfoSection({ form, errors, categories, setField }) {
  const groups = buildCategoryOptions(categories)

  return (
    <SectionCard
      icon="info"
      title="Informasi Dasar"
      subtitle="Identifikasi produk dan taksonomi katalog."
    >
      <div className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="product-name"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
          >
            Nama Produk <span className="text-error">*</span>
          </label>
          <input
            id="product-name"
            type="text"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Misal: Laptop Asus VivoBook 14"
            className={INPUT_CLASS}
            data-error={Boolean(errors.name)}
          />
          {errors.name ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">
                error
              </span>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="product-category"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Kategori <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                id="product-category"
                value={form.category}
                onChange={(event) => setField('category', event.target.value)}
                className={`${INPUT_CLASS} appearance-none pr-10 font-medium ${form.category ? '' : 'text-outline'}`}
                data-error={Boolean(errors.category)}
              >
                <option value="">Pilih kategori</option>
                {groups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span
                className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-outline"
                aria-hidden="true"
              >
                unfold_more
              </span>
            </div>
            {errors.category ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-error">
                <span className="material-symbols-outlined text-sm" aria-hidden="true">
                  error
                </span>
                {errors.category}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="product-brand"
              className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface"
            >
              Brand <span className="font-normal lowercase text-secondary">(opsional)</span>
            </label>
            <input
              id="product-brand"
              type="text"
              value={form.brand}
              onChange={(event) => setField('brand', event.target.value)}
              placeholder="Misal: Asus, Apple, Logitech"
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

export default ProductBasicInfoSection