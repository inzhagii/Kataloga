/**
 * Seller channel selector (modal/bottom-sheet, never a dropdown).
 * The closed ChannelPicker only renders a trigger; the sheet body is tested via
 * ChannelPickerList to keep assertions statically renderable.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ChannelPicker, { ChannelPickerList } from '../ChannelPicker'
import { CMS_CHANNELS, CUSTOM_CHANNEL_LOGO } from '../../../data/mock/channels'

describe('ChannelPicker', () => {
  it('renders a non-dropdown trigger button with a dialog affordance', () => {
    const html = renderToStaticMarkup(
      <ChannelPicker
        triggerLabel="+ Tambah External Channel"
        sheetTitle="Tambah External Channel"
        definitions={CMS_CHANNELS}
        onSelect={() => {}}
      />,
    )
    expect(html).toContain('+ Tambah External Channel')
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).not.toContain('<select')
  })
})

describe('ChannelPickerList', () => {
  it('lists the available channel definitions with name + logo', () => {
    const html = renderToStaticMarkup(
      <ChannelPickerList definitions={CMS_CHANNELS} selectedChannelIds={[]} onSelect={() => {}} />,
    )
    expect(html).toContain('Shopee')
    expect(html).toContain('shopping_bag')
    expect(html).toContain('Tokopedia')
    expect(html).toContain('Lazada')
  })

  it('disables channels already selected in the configuration', () => {
    const html = renderToStaticMarkup(
      <ChannelPickerList
        definitions={CMS_CHANNELS}
        selectedChannelIds={['SHOPEE']}
        onSelect={() => {}}
      />,
    )
    expect(html).toContain('disabled')
    expect(html).toContain('Sudah ditambahkan')
  })

  it('offers custom channel creation only when onAddCustom is provided', () => {
    const withCustom = renderToStaticMarkup(
      <ChannelPickerList
        definitions={CMS_CHANNELS}
        selectedChannelIds={[]}
        onSelect={() => {}}
        onAddCustom={() => ({
          id: 'CUSTOM:X',
          storeId: 's',
          name: 'X',
          logo: CUSTOM_CHANNEL_LOGO,
          custom: true,
        })}
      />,
    )
    expect(withCustom).toContain('Buat Channel Custom')

    const withoutCustom = renderToStaticMarkup(
      <ChannelPickerList definitions={CMS_CHANNELS} selectedChannelIds={[]} onSelect={() => {}} />,
    )
    expect(withoutCustom).not.toContain('Buat Channel Custom')
  })
})