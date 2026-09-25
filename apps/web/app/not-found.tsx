import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center px-5 py-20 sm:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Page not found
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          This page may have moved, or your account may not have access to it.
        </p>
        <Link
          className="mt-7 inline-flex min-h-11 cursor-pointer items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:ring-offset-2"
          href="/dashboard"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
