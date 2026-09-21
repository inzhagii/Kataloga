import { useEffect, useState } from 'react'

/**
 * Countdown helper for OTP cooldown/expiry UX.
 *
 * The backend remains the source of truth for actual cooldowns; this only
 * drives the "kirim ulang dalam Ns" affordance and never gates a server call
 * on client time alone (the server re-validates and can reject with a cooldown
 * error, which the pages surface).
 */
export function useCountdown() {
  const [expiresAt, setExpiresAt] = useState(null)
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!expiresAt) {
      return undefined
    }
    function tick() {
      setRemaining(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    }
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  /**
   * @param {string|number|Date|null} value ISO string, epoch ms or Date.
   */
  function start(value) {
    if (!value) {
      setExpiresAt(null)
      setRemaining(0)
      return
    }
    const ms = value instanceof Date ? value.getTime() : new Date(value).getTime()
    if (Number.isNaN(ms)) {
      setExpiresAt(null)
      setRemaining(0)
      return
    }
    setExpiresAt(ms)
    setRemaining(Math.max(0, Math.ceil((ms - Date.now()) / 1000)))
  }

  function reset() {
    setExpiresAt(null)
    setRemaining(0)
  }

  return { remaining, start, reset, active: Boolean(expiresAt) && remaining > 0 }
}

export default useCountdown
