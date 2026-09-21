import { useRef, useState } from 'react'
import { CONDITION, PRODUCT_STATUS } from '../../constants/enums'

/**
 * Product image gallery.
 *
 * Mobile (< lg): swipe-only scroll-snap carousel, no thumbnail navigation.
 * Desktop (lg+): main image with thumbnail navigation. Condition is shown as
 * a floating pill on the main image; a clear "Sold Out" overlay (neutral gray,
 * not red) is added while the product is SOLD_OUT (still within its store Auto
 * Archive window).
 */
function ProductGallery({ product, storeName }) {
  const images = product.images?.length > 0 ? product.images : []
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef(null)
  const conditionLabel = product.condition === CONDITION.SECOND ? 'SECOND' : 'NEW'
  const isSoldOut = product.status === PRODUCT_STATUS.SOLD_OUT

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-surface-container-low shadow-sm">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50" aria-hidden="true">
          image
        </span>
      </div>
    )
  }

  function handleScroll(event) {
    const el = event.currentTarget
    const width = el.clientWidth
    if (width > 0) {
      const next = Math.round(el.scrollLeft / width)
      const bounded = Math.min(Math.max(next, 0), images.length - 1)
      if (bounded !== activeIndex) {
        setActiveIndex(bounded)
      }
    }
  }

  function goToSlide(index) {
    const bounded = Math.min(Math.max(index, 0), images.length - 1)
    setActiveIndex(bounded)
    const el = scrollRef.current
    if (el && el.clientWidth > 0) {
      el.scrollTo({ left: bounded * el.clientWidth, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
        <div
          ref={scrollRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth scrollbar-hide lg:snap-none lg:overflow-hidden"
          role="group"
          aria-label="Galeri foto produk"
          onScroll={handleScroll}
        >
          {images.map((image, index) => (
            <div
              key={`${index}-${image}`}
              className="relative h-full w-full shrink-0 snap-center"
              aria-hidden={index !== activeIndex}
            >
              <img
                src={image}
                alt={`Foto ${product.name} — ${storeName ?? 'Toko Kataloga'}`}
                className="h-full w-full object-cover transition-opacity duration-200"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute left-3 top-3 sm:left-4 sm:top-4">
          <span className="inline-flex rounded-lg bg-surface-container-lowest/95 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm sm:px-3 sm:text-[11px]">
            {conditionLabel}
          </span>
        </div>

        {images.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 lg:hidden">
            {images.map((image, index) => (
              <span
                key={`dot-${index}-${image}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-4 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        ) : null}

        {isSoldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/45" aria-hidden="true">
            <span className="inline-flex items-center gap-2 rounded-xl bg-neutral-950/90 px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg ring-2 ring-white/30 sm:text-lg">
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                block
              </span>
              Sold Out
            </span>
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="hidden grid-cols-4 gap-2.5 sm:gap-3 lg:grid">
          {images.map((image, index) => (
            <button
              key={`thumb-${index}-${image}`}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Foto produk ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
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