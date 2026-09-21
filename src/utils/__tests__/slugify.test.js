import { describe, expect, it } from 'vitest'
import { slugify } from '../slugify'

describe('slugify', () => {
  it('lowercases the input', () => {
    expect(slugify('LAPTOP ASUS ROG')).toBe('laptop-asus-rog')
  })

  it('replaces non-alphanumeric runs with a single hyphen', () => {
    expect(slugify('Laptop Asus  ROG')).toBe('laptop-asus-rog')
    expect(slugify('iPhone 15 Pro!')).toBe('iphone-15-pro')
    expect(slugify('Halo-World_2026')).toBe('halo-world-2026')
    expect(slugify('Kopi Luwak - Sachet')).toBe('kopi-luwak-sachet')
  })

  it('trims leading and trailing hyphens', () => {
    expect(slugify('--Hello--World--')).toBe('hello-world')
  })

  it('returns an empty string when nothing usable remains', () => {
    expect(slugify('!!!')).toBe('')
    expect(slugify('')).toBe('')
    expect(slugify(null)).toBe('')
    expect(slugify(undefined)).toBe('')
  })
})