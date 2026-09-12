import Container from '../ui/Container'
import SectionHeading from '../ui/SectionHeading'

const steps = [
  {
    number: '01',
    title: 'Daftar Akun',
    description: 'Buat akun dengan email atau nomor telepon Anda.',
  },
  {
    number: '02',
    title: 'Buat Toko',
    description: 'Pilih nama toko dan sesuaikan profil bisnis.',
  },
  {
    number: '03',
    title: 'Tambahkan Produk',
    description: 'Upload foto, deskripsi, dan harga produk Anda.',
  },
  {
    number: '04',
    title: 'Bagikan Toko',
    description: 'Sebarkan link toko dan mulailah terhubung dengan customer.',
  },
]

function HowItWorks() {
  return (
    <section className="bg-surface-container-low py-24 md:py-32" id="cara-kerja">
      <Container>
        <SectionHeading
          title="Mulai Buat Toko di Kataloga"
          subtitle="Langkah mudah untuk go digital hari ini."
        />
        <div className="relative flex flex-col items-start justify-between md:flex-row">
          <div className="absolute left-[12%] right-[12%] top-8 z-0 hidden h-px bg-gray-200 md:block" />
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`relative z-10 flex w-full flex-col items-center text-center md:w-1/4 ${
                index < steps.length - 1 ? 'mb-10 md:mb-0' : ''
              }`}
            >
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${
                  index === 0
                    ? 'bg-primary-brand text-white ring-4 ring-white'
                    : 'border border-gray-200 bg-white text-gray-500'
                }`}
              >
                {step.number}
              </div>
              <h4 className="mb-2 text-lg font-semibold text-text-charcoal">{step.title}</h4>
              <p className="px-4 text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default HowItWorks