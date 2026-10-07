import {
  archiveProduct,
  getSellerProduct,
  listArchivedProducts,
  listSellerProducts,
  markSoldOut,
  publishProduct,
  reactivateProduct,
  restoreProduct,
  toggleFeatured,
} from '../../../services/productService'
import { listBrands } from '../../../services/brandService'
import { listCategories } from '../../../services/categoryService'
import { getMyStore, updateStore } from '../../../services/storeService'
import {
  recordProductArchived,
  recordProductPublished,
  recordProductReactivated,
  recordProductRestored,
  recordProductSoldOut,
  recordStoreUpdated,
} from '../../../services/activityService'

/**
 * Service access for the Products feature (list / form / archived pages and
 * related components). Returns the (stable) service functions so pages and
 * components depend on a hook instead of the service layer directly.
 */
export function useProductServices() {
  return {
    listSellerProducts,
    listArchivedProducts,
    getSellerProduct,
    archiveProduct,
    markSoldOut,
    publishProduct,
    reactivateProduct,
    restoreProduct,
    toggleFeatured,
    listBrands,
    listCategories,
    getMyStore,
    updateStore,
    recordProductPublished,
    recordProductArchived,
    recordProductSoldOut,
    recordProductReactivated,
    recordProductRestored,
    recordStoreUpdated,
  }
}
