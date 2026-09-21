import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEMO_OTP_CODE,
  changePassword,
  login,
  register,
  requestChangePasswordOtp,
  requestPasswordReset,
  resetPassword,
  resendRegistrationOtp,
  sendRecoveryEmailOtp,
  setActiveUser,
  verifyChangePasswordOtp,
  verifyRecoveryEmail,
  verifyRegistration,
} from '../authService'
import { AUTH_ERROR_CODE, isAuthError } from '../authErrors'
import { OTP_EXPIRY_MS } from '../../constants/auth'
import { beforeEachScenario } from './setup'

let now = Date.now()

beforeEach(() => {
  beforeEachScenario()
  now = Date.now()
  vi.spyOn(Date, 'now').mockImplementation(() => now)
})

afterEach(() => {
  vi.restoreAllMocks()
})

function codeOf(promise) {
  return promise.catch((error) => {
    if (isAuthError(error)) {
      return error.code
    }
    throw error
  })
}

describe('email registration verification', () => {
  const payload = {
    emailOrPhone: 'new@kataloga.test',
    password: 'password1',
    repassword: 'password1',
  }

  it('blocks login until the email code is verified', async () => {
    await register(payload)

    expect(await codeOf(login({ emailOrPhone: payload.emailOrPhone, password: 'password1' }))).toBe(
      AUTH_ERROR_CODE.EMAIL_UNVERIFIED,
    )

    const verified = await verifyRegistration({
      identifier: payload.emailOrPhone,
      code: DEMO_OTP_CODE,
    })
    expect(verified.emailVerified).toBe(true)

    const loggedIn = await login({ emailOrPhone: payload.emailOrPhone, password: 'password1' })
    expect(loggedIn.email).toBe('new@kataloga.test')
  })

  it('rejects a wrong code and an expired code', async () => {
    await register(payload)

    expect(
      await codeOf(
        verifyRegistration({ identifier: payload.emailOrPhone, code: '000000' }),
      ),
    ).toBe(AUTH_ERROR_CODE.OTP_INVALID)

    now += OTP_EXPIRY_MS + 1
    expect(
      await codeOf(
        verifyRegistration({ identifier: payload.emailOrPhone, code: DEMO_OTP_CODE }),
      ),
    ).toBe(AUTH_ERROR_CODE.OTP_EXPIRED)
  })

  it('enforces the resend cooldown and resets it after time passes', async () => {
    await register(payload)

    expect(await codeOf(resendRegistrationOtp({ identifier: payload.emailOrPhone }))).toBe(
      AUTH_ERROR_CODE.OTP_COOLDOWN,
    )

    now += 61 * 1000
    const resent = await resendRegistrationOtp({ identifier: payload.emailOrPhone })
    expect(resent.demoCode).toBe(DEMO_OTP_CODE)
  })

  it('blocks after the maximum attempts', async () => {
    await register(payload)

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await codeOf(verifyRegistration({ identifier: payload.emailOrPhone, code: '000000' }))
    }

    expect(
      await codeOf(
        verifyRegistration({ identifier: payload.emailOrPhone, code: DEMO_OTP_CODE }),
      ),
    ).toBe(AUTH_ERROR_CODE.OTP_ATTEMPTS_EXCEEDED)
  })
})

describe('change password', () => {
  const email = 'seller@kataloga.test'

  beforeEach(() => {
    setActiveUser({ id: 1, email, hasStore: true, storeId: 'toko-komputer-jaya' })
  })

  it('requires the OTP proof before changing the password', async () => {
    expect(
      await codeOf(
        changePassword({ currentPassword: 'x', newPassword: 'password2', confirmPassword: 'password2' }),
      ),
    ).toBe(AUTH_ERROR_CODE.OTP_NOT_VERIFIED)
  })

  it('changes the password after email OTP verification', async () => {
    await requestChangePasswordOtp({ email })
    await verifyChangePasswordOtp({ email, code: DEMO_OTP_CODE })

    const result = await changePassword({
      currentPassword: 'anything',
      newPassword: 'password2',
      confirmPassword: 'password2',
    })
    expect(result.ok).toBe(true)

    await expect(login({ emailOrPhone: email, password: 'old-password' })).rejects.toThrow()
    const loggedIn = await login({ emailOrPhone: email, password: 'password2' })
    expect(loggedIn.email).toBe(email)
  })

  it('rejects a mismatched confirmation and a wrong current password', async () => {
    await requestChangePasswordOtp({ email })
    await verifyChangePasswordOtp({ email, code: DEMO_OTP_CODE })
    expect(
      await codeOf(
        changePassword({ currentPassword: 'x', newPassword: 'password2', confirmPassword: 'other123' }),
      ),
    ).toBe(AUTH_ERROR_CODE.PASSWORD_MISMATCH)

    await requestChangePasswordOtp({ email })
    await verifyChangePasswordOtp({ email, code: DEMO_OTP_CODE })
    await changePassword({ currentPassword: 'anything', newPassword: 'password2', confirmPassword: 'password2' })

    await requestChangePasswordOtp({ email })
    await verifyChangePasswordOtp({ email, code: DEMO_OTP_CODE })
    expect(
      await codeOf(
        changePassword({ currentPassword: 'wrong', newPassword: 'password3', confirmPassword: 'password3' }),
      ),
    ).toBe(AUTH_ERROR_CODE.INVALID_CURRENT_PASSWORD)
  })

  it('rejects an email that does not belong to the account', async () => {
    expect(await codeOf(requestChangePasswordOtp({ email: 'other@kataloga.test' }))).toBe(
      AUTH_ERROR_CODE.EMAIL_MISMATCH,
    )
  })

  it('does not allow a change-password code to verify the registration flow', async () => {
    await requestChangePasswordOtp({ email })
    expect(
      await codeOf(verifyRegistration({ identifier: email, code: DEMO_OTP_CODE })),
    ).toBe(AUTH_ERROR_CODE.OTP_EXPIRED)
  })
})

describe('password recovery', () => {
  const email = 'seller@kataloga.test'

  it('resets the password when the identifier has a verified email', async () => {
    const requested = await requestPasswordReset({ identifier: email })
    expect(requested.requested).toBe(true)
    expect(requested.demoCode).toBe(DEMO_OTP_CODE)

    await resetPassword({
      identifier: email,
      code: DEMO_OTP_CODE,
      newPassword: 'password9',
      confirmPassword: 'password9',
    })

    const loggedIn = await login({ emailOrPhone: email, password: 'password9' })
    expect(loggedIn.email).toBe(email)
  })

  it('never reveals whether an identifier exists', async () => {
    const requested = await requestPasswordReset({ identifier: 'ghost@kataloga.test' })
    expect(requested.requested).toBe(true)
    expect(requested.demoCode).toBeNull()

    expect(
      await codeOf(
        resetPassword({
          identifier: 'ghost@kataloga.test',
          code: DEMO_OTP_CODE,
          newPassword: 'password9',
          confirmPassword: 'password9',
        }),
      ),
    ).toBe(AUTH_ERROR_CODE.OTP_EXPIRED)
  })
})

describe('recovery email', () => {
  it('verifies and stores a recovery email for a phone-only account', async () => {
    const result = await register({
      emailOrPhone: '081298765477',
      password: 'password1',
      repassword: 'password1',
      name: 'Phone Only',
    })
    setActiveUser(result.user)

    await sendRecoveryEmailOtp({ email: 'recover@kataloga.test' })
    const updated = await verifyRecoveryEmail({
      email: 'recover@kataloga.test',
      code: DEMO_OTP_CODE,
    })

    expect(updated.recoveryEmail).toBe('recover@kataloga.test')
    expect(updated.recoveryEmailVerified).toBe(true)
    expect(updated.email).toBeNull()
  })

  it('allows recovery via the verified recovery email', async () => {
    const result = await register({
      emailOrPhone: '081298765478',
      password: 'password1',
      repassword: 'password1',
    })
    setActiveUser(result.user)
    await sendRecoveryEmailOtp({ email: 'recover@kataloga.test' })
    await verifyRecoveryEmail({ email: 'recover@kataloga.test', code: DEMO_OTP_CODE })

    const requested = await requestPasswordReset({ identifier: '081298765478' })
    expect(requested.demoCode).toBe(DEMO_OTP_CODE)

    await resetPassword({
      identifier: '081298765478',
      code: DEMO_OTP_CODE,
      newPassword: 'password9',
      confirmPassword: 'password9',
    })
    const loggedIn = await login({ emailOrPhone: '081298765478', password: 'password9' })
    expect(loggedIn.phone).toBe('6281298765478')
    setActiveUser(null)
  })
})
