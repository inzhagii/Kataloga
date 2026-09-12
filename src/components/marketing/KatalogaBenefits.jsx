import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'

const benefits = [
  {
    icon: 'category',
    title: 'Manajemen Produk',
    description: 'Kelola produk, brand, kategori, dan detail produk dari satu tempat.',
  },
  {
    icon: 'web',
    title: 'Toko Sendiri',
    description: 'Tampilkan brand secara profesional dalam satu halaman toko yang rapi.',
  },
  {
    icon: 'smartphone',
    title: 'Mobile Friendly',
    description: 'Tampilan optimal di semua perangkat, terutama smartphone.',
  },
  {
    icon: 'forum',
    title: 'Terhubung ke WhatsApp & Marketplace',
    description: 'Hubungkan customer ke WhatsApp dan channel penjualan eksternalmu.',
  },
  {
    icon: 'insights',
    title: 'Customer Interest',
    description: 'Pantau minat customer melalui produk dan channel yang mereka pilih.',
  },
  {
    icon: 'link',
    title: 'Satu Link Toko',
    description: 'Satu link halaman toko yang mudah dibagikan ke mana saja.',
  },
]

function KatalogaBenefits() {
  return (
    <section className="bg-white py-24" id="fitur">
      <Container>
        <SectionHeading
          title="APA YANG KAMU DAPATKAN DI KATALOGA?"
          subtitle="Fitur esensial untuk memaksimalkan potensi bisnis online Anda."
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="group flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all duration-300"
            >
              <div className="mt-1 rounded-lg border border-gray-100 bg-blue-50 p-2 transition-colors group-hover:bg-blue-100">
                <span className="material-symbols-outlined text-2xl text-primary-brand">
                  {item.icon}
                </span>
              </div>
              <div>
                <h4 className="mb-2 text-[18px] font-semibold text-text-charcoal">{item.title}</h4>
                <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default KatalogaBenefits