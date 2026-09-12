import { useEffect } from 'react'

/**
 * Close a popover/menu when the user interacts outside of the referenced
 * element. Delegates to a registered handler.
 */
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) {
      return undefined
    }

    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [ref, handler, active])
}