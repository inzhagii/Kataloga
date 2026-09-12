import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { SELLER_BOTTOM_NAV_ITEMS } from '../../constants/sellerNav'
import SellerMoreSheet from './SellerMoreSheet'

/**
 * Mobile-only reusable bottom navigation: three primary seller features plus
 * a More button that opens the More sheet for the remaining features.
 */
function SellerBottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      <nav
        aria-label="Navigasi seller"
        className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-stretch justify-around border-t border-outline-variant bg-surface-container-lowest px-2 shadow-lg lg:hidden"
      >
        {SELLER_BOTTOM_NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className="flex flex-1">
            {({ isActive }) => (
              <span
                className={`flex min-h-[48px] flex-1 flex-col items-center justify-center py-1.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-secondary hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                  {item.icon}
                </span>
                <span className={`mt-0.5 text-[11px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label === 'Customer Interest' ? 'Interest' : item.label}
                </span>
              </span>
            )}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex min-h-[48px] flex-1 flex-col items-center justify-center py-1.5 text-secondary transition-colors hover:text-on-surface"
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          aria-label="Menu lainnya"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            more_horiz
          </span>
          <span className="mt-0.5 text-[11px] font-medium">More</span>
        </button>
      </nav>
      <SellerMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}

export default SellerBottomNav