import WhatsAppIcon from '../../ui/WhatsAppIcon'

/**
 * Informational summary cards for the Customer Interest page.
 * Counts are derived in useCustomerInterest (no direct mock access here),
 * and the cards are display-only — filtering stays in the activity filter.
 *
 * Mobile layout: Total Interest on its own row, then WhatsApp Click and
 * Marketplace Click side by side below. Desktop (lg) keeps the three cards
 * side by side in a single row. WhatsApp Click uses the recognizable
 * WhatsApp glyph with the semantic WhatsApp color.
 *
 * @param {{ totalInterest: number, whatsappClicks: number, marketplaceClicks: number }} props
 */
function InterestSummary({ totalInterest, whatsappClicks, marketplaceClicks }) {
  const cards = [
    {
      key: 'total',
      label: 'Total Interest',
      value: String(totalInterest),
      help: 'total aktivitas minat di katalog',
      icon: 'favorite_border',
      spanClass: 'col-span-2 lg:col-span-1',
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp Click',
      value: String(whatsappClicks),
      help: 'klik WhatsApp untuk menghubungi langsung',
      icon: 'whatsapp',
      spanClass: '',
    },
    {
      key: 'marketplace',
      label: 'Marketplace Click',
      value: String(marketplaceClicks),
      help: 'klik channel eksternal',
      icon: 'shopping_bag',
      spanClass: '',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card) => {
        const isWhatsApp = card.icon === 'whatsapp'
        return (
          <div
            key={card.key}
            className={`flex min-w-0 items-start justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm sm:p-5 ${card.spanClass}`}
          >
            <div className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary sm:text-xs">
                {card.label}
              </span>
              <div className="mt-2 text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
                {card.value}
              </div>
              <p className="mt-1.5 hidden text-xs text-secondary sm:block">{card.help}</p>
            </div>
            {isWhatsApp ? (
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-whatsapp-container text-whatsapp sm:h-10 sm:w-10">
                <WhatsAppIcon size={20} className="sm:hidden" />
                <WhatsAppIcon size={22} className="hidden sm:block" />
              </span>
            ) : (
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary sm:h-10 sm:w-10">
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]" aria-hidden="true">
                  {card.icon}
                </span>
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default InterestSummary