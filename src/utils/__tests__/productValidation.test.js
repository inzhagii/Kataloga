import { describe, expect, it } from 'vitest'
import { validateDraftBasics, validateProductForPublish } from '../productValidation'

function validProduct(overrides = {}) {
  return {
    name: 'Laptop Asus VivoBook',
    images: ['/img/asus.jpg'],
    category: 'Laptop',
    details: [{ label: 'RAM', value: '8 GB' }],
    description: 'Laptop ringan untuk kerja.',
    condition: 'NEW',
    price: 'Rp 7.499.000',
    priceValue: 7499000,
    ...overrides,
  }
}

describe('validateProductForPublish', () => {
  it('passes a fully valid product', () => {
    const result = validateProductForPublish(validProduct())
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('requires a product name', () => {
    const result = validateProductForPublish(validProduct({ name: '   ' }))
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBeTruthy()
  })

  it('requires at least one photo', () => {
    expect(validateProductForPublish(validProduct({ images: [] })).errors.photos).toBeTruthy()
    expect(validateProductForPublish(validProduct({ images: undefined })).errors.photos).toBeTruthy()
  })

  it('requires a category', () => {
    expect(validateProductForPublish(validProduct({ category: '' })).errors.category).toBeTruthy()
  })

  it('requires at least one complete product detail', () => {
    expect(validateProductForPublish(validProduct({ details: [] })).errors.details).toBeTruthy()
    expect(
      validateProductForPublish(validProduct({ details: [{ label: 'RAM', value: '' }] })).errors.details,
    ).toBeTruthy()
  })

  it('does not require every recommended attribute', () => {
    const result = validateProductForPublish(
      validProduct({ details: [{ label: 'RAM', value: '8 GB' }] }),
    )
    expect(result.valid).toBe(true)
  })

  it('requires a description', () => {
    expect(validateProductForPublish(validProduct({ description: '  ' })).errors.description).toBeTruthy()
  })

  it('requires a condition', () => {
    expect(validateProductForPublish(validProduct({ condition: '' })).errors.condition).toBeTruthy()
  })

  it('requires a price greater than zero', () => {
    expect(validateProductForPublish(validProduct({ priceValue: 0 })).errors.price).toBeTruthy()
    expect(validateProductForPublish(validProduct({ priceValue: -5 })).errors.price).toBeTruthy()
  })

  it('does not require brand, external links or featured', () => {
    const result = validateProductForPublish(validProduct({}))
    expect(result.valid).toBe(true)
  })
})

describe('validateDraftBasics', () => {
  it('passes a draft with only a name', () => {
    const result = validateDraftBasics({ name: 'Draft product' })
    expect(result.valid).toBe(true)
  })

  it('requires a name to save a draft', () => {
    const result = validateDraftBasics({ name: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.name).toBeTruthy()
  })
})