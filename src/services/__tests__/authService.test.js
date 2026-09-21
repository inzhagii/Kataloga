import { beforeEach, describe, expect, it } from 'vitest'
import {
  getActiveUser,
  getCurrentUser,
  isValidEmail,
  isValidIdentifier,
  isValidPhone,
  login,
  normalizePhone,
  register,
  setActiveUser,
  updateCurrentUser,
} from '../authService'
import { beforeEachScenario } from './setup'

beforeEach(() => {
  beforeEachScenario()
})

describe('normalizePhone', () => {
  it('converts a leading 0 to the 62 format', () => {
    expect(normalizePhone('081234567890')).toBe('6281234567890')
  })

  it('keeps an already-normalized number and strips formatting', () => {
    expect(normalizePhone('+62 812-3456-7890')).toBe('6281234567890')
  })
})

describe('validators', () => {
  it('recognizes valid emails and phones', () => {
    expect(isValidEmail('seller@kataloga.test')).toBe(true)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidPhone('081234567890')).toBe(true)
    expect(isValidPhone('1234')).toBe(false)
    expect(isValidIdentifier('seller@kataloga.test')).toBe(true)
    expect(isValidIdentifier('081234567890')).toBe(true)
    expect(isValidIdentifier('not-an-identifier')).toBe(false)
  })
})

describe('setActiveUser / getActiveUser', () => {
  it('mirrors the authenticated account for other mock services', () => {
    setActiveUser({ id: 9, name: 'Siapa', hasStore: false, storeId: null })
    expect(getActiveUser()).toEqual({ id: 9, name: 'Siapa', hasStore: false, storeId: null })
    setActiveUser(null)
    expect(getActiveUser()).toBeNull()
  })
})

describe('getCurrentUser', () => {
  it('resolves undefined when no session exists', async () => {
    await expect(getCurrentUser()).resolves.toBeUndefined()
  })
})

describe('login', () => {
  it('accepts an email', async () => {
    const user = await login({ emailOrPhone: 'seller@kataloga.test', password: 'rahasia' })
    expect(user.email).toBe('seller@kataloga.test')
  })

  it('accepts a phone, normalizing the identifier', async () => {
    const user = await login({ emailOrPhone: '081234567890', password: 'rahasia' })
    expect(user.name).toBe('Toko Komputer Jaya')
  })

  it('rejects an unknown identifier or empty password', async () => {
    await expect(login({ emailOrPhone: 'unknown@kataloga.test', password: 'x' })).rejects.toThrow()
    await expect(login({ emailOrPhone: 'seller@kataloga.test', password: '' })).rejects.toThrow()
  })
})

describe('register', () => {
  it('rejects when password and re-password differ', async () => {
    await expect(
      register({ emailOrPhone: 'new@kataloga.test', password: 'password1', repassword: 'password2' }),
    ).rejects.toThrow('tidak sama')
  })

  it('starts email verification and does not activate the account yet', async () => {
    const result = await register({
      emailOrPhone: 'new@kataloga.test',
      password: 'password1',
      repassword: 'password1',
    })
    expect(result.requiresVerification).toBe(true)
    expect(result.channel).toBe('email')
    expect(result.user.email).toBe('new@kataloga.test')
    expect(result.user.emailVerified).toBe(false)
    expect(result.user.hasStore).toBe(false)
    expect(result.user.name).toBe('-')
  })

  it('activates a phone account immediately, normalizing the number', async () => {
    const result = await register({
      emailOrPhone: '081298765444',
      password: 'password1',
      repassword: 'password1',
      name: 'Budi',
    })
    expect(result.requiresVerification).toBe(false)
    expect(result.channel).toBe('phone')
    expect(result.user.email).toBeNull()
    expect(result.user.phone).toBe('6281298765444')
    expect(result.user.name).toBe('Budi')
  })

  it('rejects a duplicate identifier', async () => {
    await expect(
      register({
        emailOrPhone: 'seller@kataloga.test',
        password: 'password1',
        repassword: 'password1',
      }),
    ).rejects.toThrow('sudah terdaftar')
  })
})

describe('updateCurrentUser', () => {
  it('updates non-identifier profile fields', async () => {
    const updated = await updateCurrentUser(1, { name: 'Nama Baru' })
    expect(updated.name).toBe('Nama Baru')
  })

  it('rejects invalid email or phone', async () => {
    await expect(updateCurrentUser(1, { email: 'bukan-email' })).rejects.toThrow('Format email')
    await expect(updateCurrentUser(1, { phone: '123' })).rejects.toThrow('Format nomor')
  })

  it('rejects an unknown account', async () => {
    await expect(updateCurrentUser(999, { name: 'X' })).rejects.toThrow('Akun tidak ditemukan')
  })
})