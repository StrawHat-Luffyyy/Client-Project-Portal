export default function DashboardLoading() {
  return (
    <main
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
      <div className="mt-8 h-48 animate-pulse rounded-xl bg-slate-200" />
      <p className="sr-only">Loading dashboard</p>
    </main>
  );
}
