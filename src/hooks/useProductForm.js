import { useEffect, useMemo, useReducer } from 'react'
import {
  createProduct,
  updateProduct,
} from '../services/productService'
import { ensureBrand } from '../services/brandService'
import {
  recordProductPublished,
  recordProductEdited,
} from '../services/activityService'
import { PRODUCT_STATUS, CONDITION } from '../constants/enums'
import { validateDraftBasics, validateProductForPublish } from '../utils/productValidation'
import { formatPrice, formatPriceInput, parsePriceInput } from '../utils/price'

/**
 * Build the product payload sent to the product service, cleaning up empty
 * rows so only completed details/links are persisted.
 * @param {object} form
 * @returns {import('../data/models.js').Product}
 */
function toProductPayload(form) {
  return {
    name: form.name.trim(),
    images: form.images,
    mainImage: form.images[0] || '',
    category: form.category,
    brand: form.brand.trim(),
    condition: form.condition,
    priceValue: form.priceValue,
    price: formatPrice(form.priceValue),
    details: (form.details || [])
      .filter((detail) => detail.label.trim() && detail.value.trim())
      .map((detail) => ({ label: detail.label.trim(), value: detail.value.trim() })),
    description: form.description,
    externalLinks: (form.externalLinks || [])
      .filter((link) => link.name.trim() && link.url.trim())
      .map((link) => ({ name: link.name.trim(), url: link.url.trim() })),
    cta: normalizeCta(form.cta),
    featured: Boolean(form.featured),
  }
}

/**
 * Normalize the CTA before persisting. Every product always carries exactly
 * one selected CTA option (default BUY/"Beli"). A blank/unset selection, or a
 * CUSTOM selection without a label, resolves to the default BUY option rather
 * than removing the CTA — products never have "no CTA".
 * @param {import('../data/models.js').ProductCTA|undefined} cta
 * @returns {import('../data/models.js').ProductCTA}
 */
function normalizeCta(cta) {
  const type = cta?.type
  if (type === 'BARGAIN') {
    return { type: 'BARGAIN', label: 'Tawar' }
  }
  if (type === 'CUSTOM') {
    const label = (cta.label ?? '').trim()
    return label ? { type: 'CUSTOM', label } : { type: 'BUY', label: 'Beli' }
  }
  return { type: 'BUY', label: 'Beli' }
}

/**
 * Form state for a single product. Handles field updates, client-side
 * validation for Publish and Save Draft, optional per-field errors, and the
 * async service calls. Shared by Add Product (mode 'create') and
 * Edit Product (mode 'edit' with an existing product).
 *
 * @param {{ mode: 'create'|'edit', initialProduct?: import('../data/models.js').Product|null }} props
 */
export function useProductForm({ mode, initialProduct = null }) {
  const defaultCta = initialProduct?.cta ?? { type: 'BUY', label: 'Beli' }

  const initialForm = useMemo(
    () => ({
      name: initialProduct?.name ?? '',
      images: initialProduct?.images ?? [],
      category: initialProduct?.category ?? '',
      brand: initialProduct?.brand ?? '',
      condition: initialProduct?.condition ?? CONDITION.NEW,
      priceValue: initialProduct?.priceValue ?? 0,
      priceInput: initialProduct ? formatPriceInput(initialProduct.priceValue) : '',
      details: initialProduct?.details ?? [],
      description: initialProduct?.description ?? '',
      externalLinks: initialProduct?.externalLinks ?? [],
      cta: defaultCta,
      featured: Boolean(initialProduct?.featured),
    }),
    // Only derive defaults once; page gates rendering until the product loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [state, setState] = useReducer(
    (current, next) => ({ ...current, ...next }),
    {
      form: initialForm,
      errors: {},
      formError: '',
      submitting: false,
    },
  )

  useEffect(() => {
    if (mode === 'edit' && initialProduct) {
      setState({
        form: {
          name: initialProduct.name ?? '',
          images: initialProduct.images ?? [],
          category: initialProduct.category ?? '',
          brand: initialProduct.brand ?? '',
          condition: initialProduct.condition ?? CONDITION.NEW,
          priceValue: initialProduct.priceValue ?? 0,
          priceInput: formatPriceInput(initialProduct.priceValue ?? 0),
          details: initialProduct.details ?? [],
          description: initialProduct.description ?? '',
          externalLinks: initialProduct.externalLinks ?? [],
          cta: initialProduct.cta ?? { type: 'BUY', label: 'Beli' },
          featured: Boolean(initialProduct.featured),
        },
        errors: {},
        formError: '',
      })
    }
  }, [mode, initialProduct])

  function setField(field, value) {
    setState({ form: { ...state.form, [field]: value } })
  }

  function setPrice(input) {
    setState({
      form: {
        ...state.form,
        priceInput: formatPriceInput(input),
        priceValue: parsePriceInput(input),
      },
    })
  }

  function addImage(url) {
    if (state.form.images.length >= 5) {
      return
    }
    setField('images', [...state.form.images, url])
  }

  function removeImage(index) {
    setField(
      'images',
      state.form.images.filter((_, itemIndex) => itemIndex !== index),
    )
  }

  function setPrimaryImage(index) {
    const images = [...state.form.images]
    const [target] = images.splice(index, 1)
    images.unshift(target)
    setField('images', images)
  }

  function addDetail(label = '') {
    setField('details', [...state.form.details, { label, value: '' }])
  }

  function updateDetail(index, patch) {
    setField(
      'details',
      state.form.details.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, ...patch } : detail,
      ),
    )
  }

  function removeDetail(index) {
    setField(
      'details',
      state.form.details.filter((_, detailIndex) => detailIndex !== index),
    )
  }

  function addExternalLink() {
    setField('externalLinks', [...state.form.externalLinks, { name: '', url: '' }])
  }

  function updateExternalLink(index, patch) {
    setField(
      'externalLinks',
      state.form.externalLinks.map((link, linkIndex) =>
        linkIndex === index ? { ...link, ...patch } : link,
      ),
    )
  }

  function removeExternalLink(index) {
    setField(
      'externalLinks',
      state.form.externalLinks.filter((_, linkIndex) => linkIndex !== index),
    )
  }

  async function saveDraft() {
    const payload = toProductPayload(state.form)
    const { errors, valid } = validateDraftBasics(payload)
    if (!valid) {
      setState({ errors, formError: 'Nama produk wajib diisi untuk menyimpan draft.' })
      return { ok: false, validationFailed: true }
    }
    setState({ submitting: true, errors: {}, formError: '' })
    try {
      // A brand typed directly in the form is persisted to the store's brand
      // list so Brand Management stays in sync (new brand from Add/Edit Product).
      if (payload.brand) {
        await ensureBrand(payload.brand)
      }
      if (mode === 'create') {
        const product = await createProduct({ ...payload, status: PRODUCT_STATUS.DRAFT })
        return {
          ok: true,
          product,
          feedback: { type: 'success', message: 'Draft produk disimpan.' },
        }
      }
      const product = await updateProduct(initialProduct.id, {
        ...payload,
        status: initialProduct.status,
      })
      await recordProductEdited(product.name, { productId: product.id })
      return {
        ok: true,
        product,
        feedback: { type: 'success', message: 'Perubahan produk disimpan.' },
      }
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Gagal menyimpan draft. Silakan coba lagi.',
      }
    } finally {
      setState({ submitting: false })
    }
  }

  async function publish() {
    if (mode === 'edit') {
      setState({
        formError: 'Edit Product hanya mendukung Simpan. Gunakan halaman Products untuk mengubah status.',
      })
      return { ok: false, validationFailed: true }
    }
    const payload = toProductPayload(state.form)
    const { errors, valid } = validateProductForPublish(payload)
    if (!valid) {
      setState({
        errors,
        formError: 'Periksa kembali field yang wajib diisi untuk mempublikasi produk.',
      })
      return { ok: false, validationFailed: true }
    }
    setState({ submitting: true, errors: {}, formError: '' })
    try {
      if (payload.brand) {
        await ensureBrand(payload.brand)
      }
      const product = await createProduct({ ...payload, status: PRODUCT_STATUS.PUBLISHED })
      await recordProductPublished(product.name, { productId: product.id })
      return {
        ok: true,
        product,
        feedback: { type: 'success', message: `${product.name} berhasil dipublikasi.` },
      }
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Gagal mempublikasi produk. Silakan coba lagi.',
      }
    } finally {
      setState({ submitting: false })
    }
  }

  return {
    form: state.form,
    errors: state.errors,
    formError: state.formError,
    submitting: state.submitting,
    setField,
    setPrice,
    addImage,
    removeImage,
    setPrimaryImage,
    addDetail,
    updateDetail,
    removeDetail,
    addExternalLink,
    updateExternalLink,
    removeExternalLink,
    saveDraft,
    publish,
  }
}