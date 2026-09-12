/**
 * Informational summary cards for the Customer Interest page.
 * Counts are derived in useCustomerInterest (no direct mock access here),
 * and the cards are display-only — filtering stays in the activity filter.
 * @param {{ totalInterest: number, whatsappClicks: number, marketplaceClicks: number }} props
 */
function InterestSummary({ totalInterest, whatsappClicks, marketplaceClicks }) {
  const cards = [
    {
      label: 'Total Interest',
      valueLine: String(totalInterest),
      help: 'total aktivitas minat di katalog',
      icon: 'favorite_border',
    },
    {
      label: 'WhatsApp Clicks',
      valueLine: String(whatsappClicks),
      help: 'klik WhatsApp untuk menghubungi langsung',
      icon: 'chat',
    },
    {
      label: 'Marketplace Clicks',
      valueLine: String(marketplaceClicks),
      help: 'klik channel eksternal',
      icon: 'shopping_bag',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-start justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              {card.label}
            </span>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-on-surface">
              {card.valueLine}
            </div>
            <p className="mt-2 text-xs text-secondary">{card.help}</p>
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              {card.icon}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default InterestSummary