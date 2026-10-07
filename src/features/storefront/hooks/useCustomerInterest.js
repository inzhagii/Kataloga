import { recordInterest } from '../../../services/customerInterestService'

/**
 * Customer Interest service access for storefront pages. Returns the (stable)
 * service function so pages depend on a hook instead of the service layer
 * directly. The record-before-open ordering stays owned by the caller.
 */
export function useCustomerInterest() {
  return { recordInterest }
}
