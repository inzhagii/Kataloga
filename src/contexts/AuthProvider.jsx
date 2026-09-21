import { useEffect, useState } from 'react'
import * as authService from '../services/authService'
import { setUnauthorizedHandler } from '../services/apiClient'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoaded, setAuthLoaded] = useState(false)

  /**
   * Single setter for the authenticated account: keeps React context and the
   * mock auth session (used by the store services to resolve the owned store)
   * in sync.
   * @param {import('../data/models.js').User | null} value
   */
  function applyUser(value) {
    authService.setActiveUser(value)
    setUser(value)
  }

  useEffect(() => {
    let active = true
    authService
      .getCurrentUser()
      .then((value) => {
        if (active) {
          applyUser(value ?? null)
        }
      })
      .catch(() => {
        // An expired/invalid session resolves to guest instead of hanging the
        // app on an unresolved auth state.
        if (active) {
          applyUser(null)
        }
      })
      .finally(() => {
        if (active) {
          setAuthLoaded(true)
        }
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    // A 401 from any API call means the session is gone: clear local auth state
    // so RequireAuth redirects to /login instead of showing stale data.
    setUnauthorizedHandler(() => applyUser(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  async function login(payload) {
    const loggedIn = await authService.login(payload)
    applyUser(loggedIn)
    return loggedIn
  }

  /**
   * Register an account. Email signups require OTP verification first, so the
   * user is only authenticated once `requiresVerification` is false.
   * @param {{ emailOrPhone: string, password: string, repassword: string, name?: string }} payload
   */
  async function register(payload) {
    const result = await authService.register(payload)
    if (!result.requiresVerification) {
      applyUser(result.user)
    }
    return result
  }

  /**
   * Verify an email-registration code and sign the account in.
   * @param {{ identifier: string, code: string }} payload
   */
  async function verifyEmail({ identifier, code }) {
    const verified = await authService.verifyRegistration({ identifier, code })
    applyUser(verified)
    return verified
  }

  /**
   * Resend the email-registration code (cooldown is enforced by the service).
   * @param {string} identifier
   */
  function resendVerification(identifier) {
    return authService.resendRegistrationOtp({ identifier })
  }

  /**
   * Verify a recovery email and reflect the updated account in context.
   * @param {{ email: string, code: string }} payload
   */
  async function verifyRecoveryEmail({ email, code }) {
    const updated = await authService.verifyRecoveryEmail({ email, code })
    applyUser(updated)
    return updated
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      // Local logout must succeed even if the server session close fails.
    }
    applyUser(null)
  }

  /**
   * Mark the authenticated account as the owner of a newly created store.
   * @param {string} storeId
   */
  function attachStore(storeId) {
    setUser((current) => {
      const next = current ? { ...current, hasStore: true, storeId } : current
      authService.setActiveUser(next)
      return next
    })
  }

  /**
   * Update the authenticated account's profile and sync it into context.
   * @param {Partial<import('../data/models.js').User>} patch
   */
  async function updateUser(patch) {
    if (!user) {
      return undefined
    }
    const updated = await authService.updateCurrentUser(user.id, patch)
    applyUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoaded,
        login,
        register,
        verifyEmail,
        resendVerification,
        verifyRecoveryEmail,
        logout,
        attachStore,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
