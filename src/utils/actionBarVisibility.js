/**
 * Store Landing floating action bar visibility rules (docs/PRODUCT.md §8,
 * docs/UI_RULES.md §13).
 *
 * The bar is shown while the Store Information header has scrolled out of the
 * viewport, but is hidden again as soon as the footer is visible:
 *
 * - Header visible            -> floating bar hidden.
 * - Header out of viewport    -> floating bar visible.
 * - Footer entering viewport  -> floating bar hidden.
 * - Footer out of viewport    -> floating bar visible again.
 *
 * Visibility is driven by IntersectionObserver (never a continuous scroll
 * listener). The pure rule and the observer wiring are separated so the
 * behavior can be unit-tested without a DOM/IntersectionObserver.
 */

/**
 * Pure visibility rule for the floating action bar.
 * @param {{ headerIntersecting: boolean, footerIntersecting: boolean }} state
 * @returns {boolean}
 */
export function computeActionBarVisible({ headerIntersecting, footerIntersecting }) {
  return !headerIntersecting && !footerIntersecting
}

/**
 * Default observer factory. Returns null when IntersectionObserver is not
 * available (e.g. SSR/tests) so callers can no-op safely.
 * @param {IntersectionObserverCallback} callback
 * @returns {IntersectionObserver|null}
 */
function defaultObserverFactory(callback) {
  if (typeof IntersectionObserver === 'undefined') {
    return null
  }
  return new IntersectionObserver(callback, { threshold: 0 })
}

/**
 * Observe the header and footer elements and report whether the floating
 * action bar should be visible. Returns a disconnect function (a no-op when the
 * observer cannot be created or either element is missing).
 *
 * Exactly one observer is created and it observes exactly the two targets, so
 * there are no duplicate observers/listeners. The returned disconnect must be
 * called on cleanup to release them.
 *
 * @param {{
 *   header: Element|null,
 *   footer: Element|null,
 *   onVisible: (visible: boolean) => void,
 *   observerFactory?: (callback: IntersectionObserverCallback) => IntersectionObserver|null,
 * }} options
 * @returns {() => void}
 */
export function observeActionBarVisibility({
  header,
  footer,
  onVisible,
  observerFactory = defaultObserverFactory,
}) {
  if (!header || !footer) {
    return () => {}
  }
  // Persisted across callbacks: an IntersectionObserver callback may report
  // only the entries that changed, so state must not be rebuilt per callback.
  const state = { headerIntersecting: true, footerIntersecting: false }
  const observer = observerFactory((entries) => {
    for (const entry of entries) {
      if (entry.target === header) {
        state.headerIntersecting = entry.isIntersecting
      } else if (entry.target === footer) {
        state.footerIntersecting = entry.isIntersecting
      }
    }
    onVisible(computeActionBarVisible(state))
  })
  if (!observer) {
    return () => {}
  }
  observer.observe(header)
  observer.observe(footer)
  return () => observer.disconnect()
}
