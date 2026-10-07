import { describe, expect, it } from 'vitest'
import { AUTH_GATE, resolveAuthGate } from '../authGate'

describe('resolveAuthGate', () => {
  it('holds before the auth session has loaded, regardless of user', () => {
    expect(resolveAuthGate({ authLoaded: false, user: null })).toBe(AUTH_GATE.HOLD)
    expect(resolveAuthGate({ authLoaded: false, user: { id: 1 } })).toBe(AUTH_GATE.HOLD)
  })

  it('returns guest once loaded without a user', () => {
    expect(resolveAuthGate({ authLoaded: true, user: null })).toBe(AUTH_GATE.GUEST)
  })

  it('returns authenticated once loaded with a user', () => {
    expect(resolveAuthGate({ authLoaded: true, user: { id: 1 } })).toBe(
      AUTH_GATE.AUTHENTICATED,
    )
  })
})
