import { useState } from 'react'
import ChangePasswordSection from '../../components/seller/account/ChangePasswordSection'
import ProfileForm from '../../components/seller/account/ProfileForm'
import RecoveryEmailSection from '../../components/seller/account/RecoveryEmailSection'
import SellerStoreCard from '../../components/seller/account/SellerStoreCard'
import Toast from '../../components/shared/Toast'
import { useAuth } from '../../hooks/useAuth'

function AccountPage() {
  const { user } = useAuth()
  const [avatarError, setAvatarError] = useState('')
  const [toast, setToast] = useState(null)

  if (!user) {
    return null
  }

  return (
    <div>
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-secondary">Profil akun, keamanan, dan ringkasan toko kamu.</p>
      </div>

      <div className="flex flex-col gap-5">
        <ProfileForm
          user={user}
          onAvatarError={setAvatarError}
          onSaved={() => {
            setToast({ type: 'success', message: 'Profil berhasil diperbarui.' })
            setAvatarError('')
          }}
        />
        <ChangePasswordSection
          user={user}
          onSaved={() => setToast({ type: 'success', message: 'Password berhasil diubah.' })}
        />
        <RecoveryEmailSection user={user} />
        {user.hasStore ? <SellerStoreCard /> : null}
      </div>

      {avatarError ? (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 rounded-xl border border-error/20 bg-error-container px-4 py-3 text-sm font-medium text-error" role="alert">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              error
            </span>
            {avatarError}
          </p>
        </div>
      ) : null}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default AccountPage
