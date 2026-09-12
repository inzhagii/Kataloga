import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_STATUS } from '../../../constants/enums'
import { useClickOutside } from '../../../hooks/useClickOutside'

/**
 * Per-row action dropdown. Actions depend on product status:
 * - Published: view, edit, featured toggle, archive, mark Sold Out.
 * - Draft: view, edit, publish, featured toggle, archive.
 * - Sold Out: view, edit, reactivate to Published.
 * - Archived: view, edit, restore to draft.
 *
 * @param {{
 *   product: import('../../../data/models.js').Product,
 *   onPublish: (product: import('../../../data/models.js').Product) => void,
 *   onToggleFeatured: (product: import('../../../data/models.js').Product) => void,
 *   onArchive: (product: import('../../../data/models.js').Product) => void,
 *   onMarkSoldOut: (product: import('../../../data/models.js').Product) => void,
 *   onReactivate: (product: import('../../../data/models.js').Product) => void,
 *   onRestore: (product: import('../../../data/models.js').Product) => void,
 * }} props
 */
function ProductRowMenu({
  product,
  onPublish,
  onToggleFeatured,
  onArchive,
  onMarkSoldOut,
  onReactivate,
  onRestore,
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useClickOutside(menuRef, () => setOpen(false), open)

  const itemClass =
    'flex w-full items-center gap-2.5 px-4 py-2 text-left text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-low'

  function close() {
    setOpen(false)
  }

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-container-low hover:text-on-surface"
        aria-label={`Aksi untuk ${product.name}`}
        aria-expanded={open}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          more_vert
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-1 w-52 rounded-xl border border-outline-variant/60 bg-surface-container-lowest py-1 shadow-xl">
          <a
            href={`/${product.storeId}/products/${product.id}`}
            target="_blank"
            rel="noreferrer"
            className={itemClass}
            onClick={close}
          >
            <span className="material-symbols-outlined text-[17px] text-outline" aria-hidden="true">
              visibility
            </span>
            Lihat Produk
          </a>
          <Link to={`/seller/products/${product.id}/edit`} className={itemClass} onClick={close}>
            <span className="material-symbols-outlined text-[17px] text-outline" aria-hidden="true">
              edit
            </span>
            Edit Produk
          </Link>

          {product.status === PRODUCT_STATUS.DRAFT ? (
            <button
              type="button"
              className={`${itemClass} text-blue-600`}
              onClick={() => {
                close()
                onPublish(product)
              }}
            >
              <span className="material-symbols-outlined text-[17px] text-primary" aria-hidden="true">
                publish
              </span>
              Publish
            </button>
          ) : null}

          {product.status === PRODUCT_STATUS.DRAFT || product.status === PRODUCT_STATUS.PUBLISHED ? (
            <>
              <button
                type="button"
                className={itemClass}
                onClick={() => {
                  close()
                  onToggleFeatured(product)
                }}
              >
                <span className="material-symbols-outlined text-[17px] text-outline" aria-hidden="true">
                  grade
                </span>
                {product.featured ? 'Hapus dari Featured' : 'Jadikan Featured'}
              </button>
              <button
                type="button"
                className={`${itemClass} text-rose-600`}
                onClick={() => {
                  close()
                  onArchive(product)
                }}
              >
                <span className="material-symbols-outlined text-[17px] text-rose-500" aria-hidden="true">
                  archive
                </span>
                Arsipkan
              </button>
            </>
          ) : null}

          {product.status === PRODUCT_STATUS.PUBLISHED ? (
            <button
              type="button"
              className={itemClass}
              onClick={() => {
                close()
                onMarkSoldOut(product)
              }}
            >
              <span className="material-symbols-outlined text-[17px] text-outline" aria-hidden="true">
                block
              </span>
              Sold Out
            </button>
          ) : null}

          {product.status === PRODUCT_STATUS.SOLD_OUT ? (
            <button
              type="button"
              className={`${itemClass} text-blue-600`}
              onClick={() => {
                close()
                onReactivate(product)
              }}
            >
              <span className="material-symbols-outlined text-[17px] text-primary" aria-hidden="true">
                refresh
              </span>
              Aktifkan Kembali
            </button>
          ) : null}

          {product.status === PRODUCT_STATUS.ARCHIVED ? (
            <button
              type="button"
              className={`${itemClass} text-blue-600`}
              onClick={() => {
                close()
                onRestore(product)
              }}
            >
              <span className="material-symbols-outlined text-[17px] text-primary" aria-hidden="true">
                restore
              </span>
              Restore ke Draft
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export default ProductRowMenu