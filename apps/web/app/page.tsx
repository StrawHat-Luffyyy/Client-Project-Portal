import { Navbar } from '../components/landing/navbar';
import { Hero } from '../components/landing/hero';
import { Workflow } from '../components/landing/workflow';
import { ProductUI } from '../components/landing/product-ui';
import { TruthSource } from '../components/landing/truth-source';
import { Trust } from '../components/landing/trust';
import { Footer } from '../components/landing/footer';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <Navbar />
      <Hero />
      <Workflow />
      <ProductUI />
      <TruthSource />
      <Trust />

      {/* Final CTA */}
      <section className="bg-white py-24 sm:py-32 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ready to standardize your delivery?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Create your organization workspace today and start providing a
              superior experience for your clients.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto rounded-md bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                Create organization workspace
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
