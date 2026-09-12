import { Link } from 'react-router-dom'
import Container from '../ui/Container'

function FinalCta() {
  return (
    <section className="bg-white py-24 md:py-32">
      <Container>
        <div className="rounded-3xl bg-gradient-to-br from-primary-brand to-blue-800 p-12 text-center text-white md:p-16">
          <div className="mx-auto flex max-w-2xl flex-col items-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
              Daftarkan Toko Anda di Kataloga
            </h2>
            <p className="mb-10 text-lg text-blue-100">
              Kelola produk, tampilkan toko dengan mudah, dan terhubung dengan customer tanpa harus
              berpindah-pindah.
            </p>
            <Link
              to="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-base font-medium text-primary-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50"
            >
              Buat Toko di Kataloga
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default FinalCta