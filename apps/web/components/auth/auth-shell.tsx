import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  alternateText,
  alternateHref,
  alternateLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  alternateText?: string;
  alternateHref?: string;
  alternateLabel?: string;
}) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <Link className="w-fit text-sm font-semibold tracking-tight" href="/">
          Client Project Portal
        </Link>
        <div className="max-w-lg pb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-300">
            Shared delivery workspace
          </p>
          <p className="mt-5 text-4xl font-semibold leading-tight tracking-tight">
            Clear requirements. Accountable delivery. No status chasing.
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
            Keep client priorities and project execution connected without
            exposing internal work.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            className="mb-10 inline-block text-sm font-semibold text-slate-900 lg:hidden"
            href="/"
          >
            Client Project Portal
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-3 leading-7 text-slate-600">{description}</p>
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>
          {alternateText && alternateHref && alternateLabel ? (
            <p className="mt-6 text-center text-sm text-slate-600">
              {alternateText}{' '}
              <Link
                className="font-semibold text-blue-700 underline-offset-4 hover:underline"
                href={alternateHref}
              >
                {alternateLabel}
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
