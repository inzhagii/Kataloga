import { checkStoreIdAvailable, createStore } from '../../../services/storeService'

/**
 * Store creation service access for the Create Store flow (part of the auth
 * onboarding). Keeps the store service out of the page component.
 */
export function useCreateStore() {
  return { createStore, checkStoreIdAvailable }
}
