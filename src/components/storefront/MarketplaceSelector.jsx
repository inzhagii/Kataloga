import DestinationPicker from './DestinationPicker'
import { listStoreChannelDefinitions, resolveChannelRefsForDisplay } from '../../utils/channels'
import { CMS_CHANNELS } from '../../data/mock/channels'

/**
 * Marketplace selector: shows the seller-configured external channels (only
 * the ones actually configured; unused master channels never appear). Channel
 * selection triggers the authentication check in the page before any
 * navigation happens. Uses the shared DestinationPicker, i.e. modal on desktop
 * and bottom sheet on mobile (never a dropdown).
 *
 * Store `channels` are references (`{channelId, url}`); name/logo are resolved
 * here from the shared channel master (docs/PRODUCT.md #9, §16) so the picker
 * renders the correct channel identity without duplicating it in the store
 * record. Plain `{name, url}` entries are still accepted for backward
 * compatibility.
 *
 * @param {{ store: import('../../data/models.js').Store, onSelectChannel: (channel: import('../../data/models.js').ExternalChannel) => void, compact?: boolean }} props
 */
function MarketplaceSelector({ store, onSelectChannel, compact = false }) {
  const definitions = listStoreChannelDefinitions(store, CMS_CHANNELS)

  return (
    <DestinationPicker
      destinations={resolveChannelRefsForDisplay(store.channels ?? [], definitions)}
      onPick={onSelectChannel}
      triggerLabel="Marketplace"
      triggerIcon="storefront"
      sheetTitle="Pilih Saluran"
      sheetIcon="storefront"
      compact={compact}
    />
  )
}

export default MarketplaceSelector