import { useState } from 'react'
import { Link } from 'react-router-dom'

function parentCount(parent, childrenByParent, productCounts) {
  const children = childrenByParent[parent.id] || []
  return children.reduce(
    (total, child) => total + (productCounts[child.name] || 0),
    0,
  )
}

function TypeBadge({ custom }) {
  return custom ? (
    <span className="rounded-md bg-primary-container px-2 py-0.5 text-[11px] font-semibold text-primary">
      Custom
    </span>
  ) : (
    <span className="rounded-md bg-surface-container-high px-2 py-0.5 text-[11px] font-semibold text-secondary">
      Default
    </span>
  )
}

function CountChip({ count }) {
  return (
    <span className="rounded-md bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
      {count} {count === 1 ? 'Product' : 'Products'}
    </span>
  )
}

/**
 * Link to the seller products list pre-filtered by this category.
 * /seller/products?category=... is the source of truth for the filter.
 * @param {{ category: import('../../../data/models.js').Category }} props
 */
function ViewProductsLink({ category }) {
  return (
    <Link
      to={`/seller/products?category=${encodeURIComponent(category.name)}`}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary-container"
      aria-label={`Lihat Product untuk ${category.name}`}
    >
      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
        visibility
      </span>
      Lihat Product
    </Link>
  )
}

function RowActions({ category, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        aria-label={`Tindakan untuk ${category.name}`}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          more_vert
        </span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
            aria-hidden="true"
          />
          <div className="absolute right-0 z-20 w-44 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onEdit(category)
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">
                edit
              </span>
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onDelete(category)
              }}
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error-container"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                delete
              </span>
              Hapus
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

function ParentRow({
  parent,
  collapsed,
  onToggle,
  children,
  totalCount,
  productCounts,
  onEdit,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest">
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low"
          aria-expanded={!collapsed}
        >
          <span
            className={`material-symbols-outlined text-[20px] text-secondary transition-transform ${
              collapsed ? '' : 'rotate-90'
            }`}
            aria-hidden="true"
          >
            chevron_right
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-on-surface">{parent.name}</span>
              <TypeBadge custom={parent.custom} />
            </span>
            {children.length > 0 ? (
              <span className="mt-0.5 block text-xs text-secondary">
                {children.length} Sub Kategori
              </span>
            ) : null}
          </span>
          <CountChip count={totalCount} />
        </button>
        <ViewProductsLink category={parent} />
      </div>

      {collapsed ? null : (
        <ul className="border-t border-outline-variant/60 bg-surface-container-low/50">
          {children.length === 0 ? (
            <li className="px-4 py-2 text-xs text-on-surface-variant">
              Tidak ada Sub Kategori. Sub Kategori bisa ditambahkan dari tombol tambah kategori.
            </li>
          ) : (
            children.map((child) => (
              <li key={child.id} className="flex items-center gap-3 px-4 py-3 pl-12">
                <span
                  className="material-symbols-outlined shrink-0 text-[16px] text-on-surface-variant/60"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-on-surface">{child.name}</span>
                    <TypeBadge custom={child.custom} />
                  </span>
                </span>
                <CountChip count={productCounts[child.name] || 0} />
                <ViewProductsLink category={child} />
                {child.custom ? (
                  <RowActions category={child} onEdit={onEdit} onDelete={onDelete} />
                ) : null}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}

/**
 * Two-level category hierarchy (Level-1 parents + subcategories) with
 * expand/collapse and stats, mirroring the approved Category Management
 * screen. Default categories are read-only; custom categories get edit/delete.
 *
 * Collapse state is owned by the page: the page supplies the `collapsed` set
 * and the toggle callback, and renders the "Collapse Semua" action next to
 * the search field.
 *
 * @param {{
 *   parents: import('../../../data/models.js').Category[],
 *   childrenByParent: Record<number, import('../../../data/models.js').Category[]>,
 *   productCounts: Record<string, number>,
 *   collapsed: Set<number>,
 *   onToggle: (parentId: number) => void,
 *   onEdit: (category: import('../../../data/models.js').Category) => void,
 *   onDelete: (category: import('../../../data/models.js').Category) => void,
 * }} props
 */
function CategoryTree({ parents, childrenByParent, productCounts, collapsed, onToggle, onEdit, onDelete }) {
  if (parents.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {parents.map((parent) => {
        const children = childrenByParent[parent.id] || []
        const totalCount = parentCount(parent, childrenByParent, productCounts)
        return (
          <ParentRow
            key={parent.id}
            parent={parent}
            collapsed={collapsed.has(parent.id)}
            onToggle={() => onToggle(parent.id)}
            children={children}
            totalCount={totalCount}
            productCounts={productCounts}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}

export default CategoryTree