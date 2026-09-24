export default function Loading() {
  return (
    <main
      className="mx-auto max-w-6xl px-5 py-20 sm:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 h-12 max-w-xl animate-pulse rounded bg-slate-200" />
      <p className="sr-only">Loading portal</p>
    </main>
  );
}
