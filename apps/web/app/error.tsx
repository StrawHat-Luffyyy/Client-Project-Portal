'use client';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 sm:px-8">
      <h1 className="text-2xl font-semibold text-slate-950">
        We could not load the portal
      </h1>
      <p className="mt-3 text-slate-600">
        Try again. If the problem continues, contact your administrator.
      </p>
      <button
        className="mt-6 min-h-11 cursor-pointer rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
