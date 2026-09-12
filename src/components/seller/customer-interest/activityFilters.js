import { INTEREST_TYPE } from '../../../constants/enums'

/**
 * Activity filter options for the Customer Interest page.
 * Kept in a separate module so the component file only exports the component
 * (fast-refresh rule).
 */
export const ACTIVITY_FILTERS = [
  { value: 'ALL', label: 'Semua Aktivitas' },
  { value: INTEREST_TYPE.WHATSAPP_CLICK, label: 'WhatsApp Click' },
  { value: INTEREST_TYPE.MARKETPLACE_CLICK, label: 'Marketplace Click' },
]