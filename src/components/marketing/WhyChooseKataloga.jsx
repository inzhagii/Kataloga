import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'

const reasons = [
  {
    icon: 'inventory_2',
    title: 'Kelola Produk dengan Mudah',
    description:
      'Tambah, edit, kategorikan, dan atur produkmu dari satu tempat.',
  },
  {
    icon: 'storefront',
    title: 'Tampilkan Toko dengan Rapi',
    description:
      'Semua produkmu tersusun dalam satu halaman toko yang mudah dibagikan kepada customer.',
  },
  {
    icon: 'hub',
    title: 'Terhubung dengan Channel Penjualanmu',
    description:
      'Hubungkan produk dengan WhatsApp, marketplace, atau channel eksternal yang kamu gunakan.',
  },
]

function WhyChooseKataloga() {
  return (
    <section className="bg-surface-container-low py-24" id="tentang">
      <Container>
        <SectionHeading
          title="Kenapa Banyak Seller Memilih Kataloga?"
          subtitle="Solusi lengkap untuk manajemen toko digital yang efisien."
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-[#E5E7EB] bg-white p-8 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 transition-colors group-hover:bg-blue-100">
                <span className="material-symbols-outlined text-3xl text-primary-brand">
                  {item.icon}
                </span>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-charcoal">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default WhyChooseKataloga