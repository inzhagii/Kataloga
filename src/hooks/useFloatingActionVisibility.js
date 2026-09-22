import { useEffect, useState } from 'react'

/**
 * Pure visibility rule for the Store Landing floating action bar:
 * header visible -> hidden; header out + footer out -> visible; footer visible
 * -> hidden. (docs/PRODUCT.md #8). Exported for direct testing.
 * @param {boolean} headerVisible
 * @param {boolean} footerVisible
 * @returns {boolean}
 */
export function computeFloatingActionVisibility(headerVisible, footerVisible) {
  return !headerVisible && !footerVisible
}

/**
 * Decide when the Store Landing floating action bar should show, based on the
 * visibility of the store header and footer elements (docs/PRODUCT.md #8):
 *
 * - Header visible -> hidden.
 * - Header out of viewport -> visible.
 * - Footer enters viewport -> hidden.
 * - Footer leaves viewport again -> visible again.
 *
 * Uses IntersectionObserver (preferred) and falls back to `false` (hidden)
 * when the API is unavailable. No continuous scroll listener.
 *
 * @param {import('react').RefObject<HTMLElement|null>} headerRef
 * @param {import('react').RefObject<HTMLElement|null>} footerRef
 * @returns {boolean} Whether the floating bar should be shown.
 */
export function useFloatingActionVisibility(headerRef, footerRef) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function') {
      return undefined
    }
    const headerEl = headerRef.current
    const footerEl = footerRef.current
    if (!headerEl || !footerEl) {
      setShow(false)
      return undefined
    }

    let headerVisible = true
    let footerVisible = false

    function update() {
      setShow(!headerVisible && !footerVisible)
    }

    const headerObserver = new IntersectionObserver(([entry]) => {
      headerVisible = entry.isIntersecting
      update()
    })
    const footerObserver = new IntersectionObserver(([entry]) => {
      footerVisible = entry.isIntersecting
      update()
    })

    headerObserver.observe(headerEl)
    footerObserver.observe(footerEl)
    update()
    return () => {
      headerObserver.disconnect()
      footerObserver.disconnect()
    }
  }, [headerRef, footerRef])

  return show
}