/**
 * Static rendering check for the Featured Product switch. The switch renders
 * as an icon/knob-only control, so it must expose an accessible name
 * (M12 a11y regression guard).
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ProductCatalogSettingsSection from '../ProductCatalogSettingsSection'

function render(featured) {
  return renderToStaticMarkup(
    <ProductCatalogSettingsSection
      form={{ featured }}
      setField={() => {}}
    />,
  )
}

describe('ProductCatalogSettingsSection featured switch', () => {
  it('exposes role=switch with an accessible name and checked state', () => {
    const off = render(false)
    expect(off).toContain('role="switch"')
    expect(off).toContain('aria-label="Featured Product"')
    expect(off).toContain('aria-checked="false"')

    expect(render(true)).toContain('aria-checked="true"')
  })
})
