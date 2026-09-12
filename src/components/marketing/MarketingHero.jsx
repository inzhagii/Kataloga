import { Link } from 'react-router-dom'
import heroMockup from '../../assets/branding/Kataloga Hero Mockup.png'

function MarketingHero() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 px-6 py-24 md:flex-row md:justify-between md:py-32">
        <div className="order-2 flex w-full flex-col gap-6 text-center md:order-1 md:w-1/2 md:text-left">
          <h1 className="text-3xl font-bold leading-tight text-text-charcoal md:text-[44px]">
            Toko <span className="text-primary-brand">Lebih Rapi</span>. Jualan Jadi{' '}
            <span className="text-primary-brand">Lebih Mudah</span> dengan Kataloga.
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-loose text-gray-600 md:mx-0">
            Kelola produk, tampilkan toko dengan mudah, dan terhubung dengan customer tanpa harus
            berpindah-pindah.
          </p>
          <div className="flex justify-center pt-4 md:justify-start">
            <Link
              to="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary-brand px-8 text-base font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Buat Toko Sekarang
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
        <div className="order-1 relative mb-8 w-full md:order-2 md:mb-0 md:w-1/2">
          <img
            src={heroMockup}
            alt="Kataloga Hero Mockup"
            className="relative z-10 h-auto w-full animate-float object-contain"
          />
        </div>
      </div>
    </section>
  )
}

export default MarketingHero