import DestinationPicker from './DestinationPicker'

/**
 * Marketplace selector: shows the seller-configured external channels.
 * Channel selection triggers the authentication check in the page before any
 * navigation happens. Uses the shared DestinationPicker, i.e. modal on desktop
 * and bottom sheet on mobile (never a dropdown). Channels are plain {name,url};
 * preset icons are frontend-owned.
 * @param {{ store: import('../../data/models.js').Store, onSelectChannel: (channel: import('../../data/models.js').ExternalChannel) => void, compact?: boolean }} props
 */
function MarketplaceSelector({ store, onSelectChannel, compact = false }) {
  return (
    <DestinationPicker
      destinations={store.channels ?? []}
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