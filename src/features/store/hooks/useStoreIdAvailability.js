import { useState } from 'react'
import { checkStoreIdAvailable } from '../../../services/storeService'

/**
 * Availability check for the Store ID field. Owns only the availability result
 * (null | 'checking' | 'available' | 'taken') so the field can render its
 * inline status while the format/change guards stay in the component.
 */
export function useStoreIdAvailability() {
  const [availability, setAvailability] = useState(null)

  function reset() {
    setAvailability(null)
  }

  async function checkAvailability(normalized) {
    setAvailability('checking')
    try {
      const result = await checkStoreIdAvailable(normalized)
      setAvailability(result.available ? 'available' : 'taken')
    } catch {
      setAvailability(null)
    }
  }

  return { availability, reset, checkAvailability }
}
