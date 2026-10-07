import { useEffect, useState } from 'react'
import { observeActionBarVisibility } from '../../../utils/actionBarVisibility'

/**
 * Reveal the Store Landing floating action bar once the Store Information
 * header leaves the viewport, hiding it again while the footer is visible.
 * The bar starts hidden (header is expected to be in view on first paint) and
 * is toggled by a single IntersectionObserver wired to the header + footer.
 *
 * @param {{
 *   headerRef: import('react').RefObject<Element>,
 *   footerRef: import('react').RefObject<Element>,
 *   enabled?: boolean,
 *   observerFactory?: (callback: IntersectionObserverCallback) => IntersectionObserver|null,
 * }} options
 * @returns {boolean}
 */
export function useFloatingActionBar({ headerRef, footerRef, enabled = true, observerFactory }) {
  const [observed, setObserved] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }
    return observeActionBarVisibility({
      header: headerRef.current,
      footer: footerRef.current,
      onVisible: setObserved,
      observerFactory,
    })
  }, [enabled, headerRef, footerRef, observerFactory])

  // Fold the enabled flag into the result instead of resetting state inside the
  // effect (avoids a synchronous setState-in-effect).
  return enabled && observed
}

export default useFloatingActionBar
