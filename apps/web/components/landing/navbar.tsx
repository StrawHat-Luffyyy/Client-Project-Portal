import Link from 'next/link';

const LogoMark = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform group-hover:scale-105 duration-300 ease-out"
  >
    <rect x="3" y="10" width="12" height="12" rx="2.5" fill="#2563EB" />
    <rect x="13" y="6" width="12" height="12" rx="2.5" fill="#0F172A" />
  </svg>
);

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center px-6">
        {/* Brand */}
        <Link href="/" className="group flex items-center gap-2.5 mr-10">
          <LogoMark />
          <span className="text-[15px] font-bold tracking-tight text-slate-950">
            Client Portal
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#product"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Product
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#workflow"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            How it works
          </Link>
          <Link
            href="#security"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Security
          </Link>
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:-translate-y-[0.5px] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ml-1"
          >
            Create workspace
          </Link>
        </div>
      </div>
    </header>
  );
}
