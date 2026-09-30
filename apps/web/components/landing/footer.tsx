import Link from 'next/link';

const LogoMark = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform group-hover:scale-105 duration-300 ease-out shrink-0"
  >
    <rect x="3" y="10" width="12" height="12" rx="2.5" fill="#2563EB" />
    <rect x="13" y="6" width="12" height="12" rx="2.5" fill="#0F172A" />
  </svg>
);

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-8">
      <div className="mx-auto max-w-[1180px] px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12">
          {/* Brand Column */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="group flex items-center gap-2.5 mb-4">
              <LogoMark />
              <span className="text-[15px] font-bold tracking-tight text-slate-950">
                Client Portal
              </span>
            </Link>
            <p className="text-[13.5px] leading-relaxed text-slate-500 max-w-xs">
              One workspace for teams and clients to plan, collaborate, and
              deliver projects.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900 mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#features"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#workflow"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#security"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-slate-900 mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-slate-900 mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="#"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Small Final CTA */}
        <div className="border-t border-slate-100 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-800">
            Ready to bring your projects into one workspace?
          </p>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:-translate-y-[0.5px] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 shrink-0"
          >
            Create workspace
          </Link>
        </div>

        {/* Bottom Legal Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 md:h-12">
          <p className="text-[13px] text-slate-500">
            &copy; {new Date().getFullYear()} Client Portal. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-[13px] text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Privacy
            </Link>
            <span>&middot;</span>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
