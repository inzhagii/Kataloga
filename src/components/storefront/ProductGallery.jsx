import { useState } from 'react'
import { CONDITION } from '../../constants/enums'

/**
 * Product image gallery: main image (1-5 photos) with thumbnail navigation
 * when more than one image exists. Condition is shown as a floating pill on
 * the main image. No availability state (only PUBLISHED products are public).
 * No swipe/zoom/auto-slide.
 */
function ProductGallery({ product, storeName }) {
  const images = product.images?.length > 0 ? product.images : []
  const [activeIndex, setActiveIndex] = useState(0)
  const conditionLabel = product.condition === CONDITION.SECOND ? 'SECOND' : 'NEW'

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-surface-container-low shadow-sm">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50" aria-hidden="true">
          image
        </span>
      </div>
    )
  }

  const activeImage = images[activeIndex] ?? images[0]

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
        <img
          src={activeImage}
          alt={`Foto ${product.name} — ${storeName ?? 'Toko Kataloga'}`}
          className="h-full w-full object-cover transition-opacity duration-200"
        />

        <div className="absolute left-3 top-3 sm:left-4 sm:top-4">
          <span className="inline-flex rounded-lg bg-surface-container-lowest/95 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm sm:px-3 sm:text-[11px]">
            {conditionLabel}
          </span>
        </div>
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {images.map((image, index) => (
            <button
              key={`${index}-${image}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Foto produk ${index + 1}`}
              className={`relative aspect-square overflow-hidden rounded-xl bg-surface-container-low p-1 transition-all ${
                index === activeIndex
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={image} alt="" loading="lazy" className="h-full w-full rounded-lg object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default ProductGallery