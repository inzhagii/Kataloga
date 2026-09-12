import { useNavigate } from 'react-router-dom'
import BottomSheet from '../storefront/BottomSheet'
import { SELLER_MORE_ITEMS } from '../../constants/sellerNav'

/**
 * Mobile-only "More" menu (bottom sheet). Shows the seller features that are
 * not in the 3-item mobile bottom navigation plus Logout.
 * Logout asks the seller shell for confirmation, which performs the actual
 * auth logout.
 * @param {{ open: boolean, onClose: () => void, onLogoutRequest: () => void }} props
 */
function SellerMoreSheet({ open, onClose, onLogoutRequest }) {
  const navigate = useNavigate()

  function handleLogout() {
    onClose()
    onLogoutRequest()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="More" icon="more_horiz">
      <nav aria-label="Menu lebih banyak">
        <ul className="flex flex-col">
          {SELLER_MORE_ITEMS.map((item) => (
            <li key={item.to}>
              <button
                type="button"
                onClick={() => {
                  navigate(item.to)
                  onClose()
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-secondary transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-error transition-colors hover:bg-error-container/40"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                logout
              </span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </BottomSheet>
  )
}

export default SellerMoreSheet