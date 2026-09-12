import { useState } from 'react'
import EmptyState from '../../components/shared/EmptyState'
import ProfileForm from '../../components/seller/account/ProfileForm'
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

  if (!user.hasStore) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Account</h1>
        <EmptyState
          icon="storefront"
          title="Kamu belum membuat toko"
          description="Buat toko terlebih dahulu untuk mengelola informasi dan katalog kamu."
          action={
            <a
              href="/create-store"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                add
              </span>
              Buat Toko
            </a>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Account</h1>
          <p className="mt-1 text-sm text-secondary">Profil akun dan ringkasan toko kamu.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileForm
            user={user}
            onAvatarError={setAvatarError}
            onSaved={() => {
              setToast({ type: 'success', message: 'Profil berhasil diperbarui.' })
              setAvatarError('')
            }}
          />
        </div>
        <div className="lg:col-span-1">
          <SellerStoreCard />
        </div>
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