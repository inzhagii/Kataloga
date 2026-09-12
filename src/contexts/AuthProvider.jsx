import { useEffect, useState } from 'react'
import * as authService from '../services/authService'
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
    authService.getCurrentUser().then((value) => {
      if (active) {
        applyUser(value ?? null)
        setAuthLoaded(true)
      }
    })
    return () => {
      active = false
    }
  }, [])

  async function login(payload) {
    const loggedIn = await authService.login(payload)
    applyUser(loggedIn)
    return loggedIn
  }

  async function register(payload) {
    const registered = await authService.register(payload)
    applyUser(registered)
    return registered
  }

  function logout() {
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
      value={{ user, authLoaded, login, register, logout, attachStore, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}