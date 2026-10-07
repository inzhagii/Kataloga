import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { INTEREST_CONTEXT } from '../../../constants/enums'
import { recordInterest } from '../../../services/customerInterestService'
import { isWhatsAppChannel } from '../../../utils/customerInterest'
import { consumePendingAction, setPendingAction } from '../../../utils/pendingAction'
import { AUTH_GATE, resolveAuthGate } from '../../../utils/authGate'

const RECORD_ERROR_MESSAGE =
  'Gagal menyimpan minat ke server. Silakan coba lagi.'

/**
 * Shared storefront contact-action flow (WhatsApp + Marketplace) for a store,
 * used by Store Landing and Product Listing footers.
 *
 * Ordering is strict (docs/PRODUCT.md §31): the destination is opened ONLY
 * after `recordInterest` succeeds. On failure nothing opens and the error is
 * surfaced through `actionError` for the page to show with its existing toast.
 *
 * Guest handling: while the auth bootstrap is still loading (`authLoaded`
 * false) the action is held (no premature guest decision). Once loaded, a
 * guest is routed through Login with the intent stored so it auto-continues on
 * return.
 *
 * @param {{
 *   store: import('../../../data/models.js').Store | null,
 *   storeId: string,
 *   returnPath: string,
 * }} options
 */
export function useStorefrontContactActions({ store, storeId, returnPath }) {
  const navigate = useNavigate()
  const { user, authLoaded } = useAuth()
  const [actionError, setActionError] = useState('')

  function buildWhatsAppUrl() {
    return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(
      `Halo ${store.name}, saya tertarik dengan katalog produk Anda.`,
    )}`
  }

  function openDestination({ channel, externalUrl }) {
    if (isWhatsAppChannel(channel)) {
      window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer')
    } else if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  function identityPayload(channel, externalUrl = null) {
    return {
      storeId,
      customerName: user?.name ?? null,
      customerId: user?.id ?? null,
      customerEmail: user?.email ?? null,
      customerPhone: user?.phone ?? null,
      productId: null,
      productName: null,
      context: INTEREST_CONTEXT.STORE,
      channel,
      externalUrl,
    }
  }

  /**
   * Record the interest first; open the destination only on success.
   * @param {{ channel: string, externalUrl?: string|null }} action
   */
  async function recordAndOpen(action) {
    try {
      await recordInterest(
        identityPayload(action.channel, action.externalUrl ?? null),
      )
    } catch (error) {
      setActionError(
        error instanceof Error && error.message ? error.message : RECORD_ERROR_MESSAGE,
      )
      return
    }
    // State updates happen only after the await, so the auto-continue effect
    // never triggers a synchronous setState.
    setActionError('')
    openDestination(action)
  }

  function handleWhatsApp() {
    const gate = resolveAuthGate({ authLoaded, user })
    if (gate === AUTH_GATE.HOLD) {
      return
    }
    if (gate === AUTH_GATE.GUEST) {
      setPendingAction(returnPath, { type: 'whatsapp' })
      navigate(`/login?returnUrl=${encodeURIComponent(returnPath)}`)
      return
    }
    recordAndOpen({ channel: 'WhatsApp' })
  }

  function handleSelectChannel(channel) {
    const gate = resolveAuthGate({ authLoaded, user })
    if (gate === AUTH_GATE.HOLD) {
      return
    }
    if (gate === AUTH_GATE.GUEST) {
      setPendingAction(returnPath, {
        type: 'marketplace',
        channel: channel.name,
        externalUrl: channel.url,
      })
      navigate(`/login?returnUrl=${encodeURIComponent(returnPath)}`)
      return
    }
    recordAndOpen({ channel: channel.name, externalUrl: channel.url })
  }

  // Auto-continue a guest intent exactly once after login/register.
  useEffect(() => {
    if (!store || !authLoaded || !user) {
      return
    }
    const action = consumePendingAction(returnPath)
    if (!action) {
      return
    }
    // Defer to a microtask so the effect body performs no synchronous
    // setState; the state update happens after the awaited record call.
    Promise.resolve().then(() => {
      if (action.type === 'whatsapp') {
        recordAndOpen({ channel: 'WhatsApp' })
      } else if (action.type === 'marketplace') {
        recordAndOpen({ channel: action.channel, externalUrl: action.externalUrl })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, authLoaded, user, returnPath])

  return {
    handleWhatsApp,
    handleSelectChannel,
    actionError,
    dismissActionError: () => setActionError(''),
  }
}

export default useStorefrontContactActions
