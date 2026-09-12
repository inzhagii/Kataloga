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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex min-w-0 items-start justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm sm:p-5"
        >
          <div className="min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-secondary sm:text-xs">
              {card.label}
            </span>
            <div className="mt-2 text-2xl font-extrabold tracking-tight text-on-surface sm:text-3xl">
              {card.valueLine}
            </div>
            <p className="mt-1.5 hidden text-xs text-secondary sm:block">{card.help}</p>
          </div>
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container text-secondary sm:h-10 sm:w-10">
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]" aria-hidden="true">
              {card.icon}
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

export default InterestSummary