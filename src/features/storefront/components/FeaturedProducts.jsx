import { useEffect, useMemo, useRef, useState } from 'react'
import ProductCard from './ProductCard'

/**
 * Horizontally scrollable "Produk Unggulan" track. Desktop shows chevron
 * arrows that scroll the track; mobile relies on snap-swipe (arrows hidden).
 * No auto-slide or rotation.
 */
function FeaturedProducts({ products, storeId, storeName, onShare }) {
  const trackRef = useRef(null)
  const [canScrollStart, setCanScrollStart] = useState(false)
  const [canScrollEnd, setCanScrollEnd] = useState(false)
  const featured = useMemo(() => products.filter((product) => product.featured), [products])

  useEffect(() => {
    updateScrollState()
  }, [featured.length])

  if (featured.length === 0) {
    return null
  }

  function updateScrollState() {
    const track = trackRef.current
    if (!track) {
      return
    }
    setCanScrollStart(track.scrollLeft > 0)
    setCanScrollEnd(Math.ceil(track.scrollLeft + track.clientWidth) < track.scrollWidth - 1)
  }

  function scrollTrack(direction) {
    trackRef.current?.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }

  return (
    <section className="mb-10 sm:mb-12" aria-labelledby="featured-heading">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-on-surface md:text-2xl">Produk Unggulan</h2>
          <p className="mt-0.5 text-xs text-on-surface-variant md:text-sm">
            Pilihan terbaik dari toko ini
          </p>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollTrack(-1)}
            disabled={!canScrollStart}
            aria-label="Geser kiri"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={() => scrollTrack(1)}
            disabled={!canScrollEnd}
            aria-label="Geser kanan"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              chevron_right
            </span>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 scrollbar-hide md:mx-0 md:gap-5 md:px-0 md:pb-4"
        role="list"
        aria-label="Produk Unggulan"
      >
        {featured.map((product) => (
          <div key={product.id} className="w-[55%] shrink-0 snap-start sm:w-[40%] md:w-[240px]">
            <ProductCard
              product={product}
              storeId={storeId}
              storeName={storeName}
              onShare={onShare}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default FeaturedProducts