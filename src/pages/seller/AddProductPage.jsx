import ProductForm from '../../components/seller/products/ProductForm'

/**
 * Add Product: creates a new product using the shared ProductForm
 * (mode 'create'). Requires no data fetch; drafts can be saved incomplete,
 * publish validates all required fields.
 */
function AddProductPage() {
  return <ProductForm mode="create" />
}

export default AddProductPage