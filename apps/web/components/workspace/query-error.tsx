export function QueryError({
  message,
  onRetry,
  title = 'Unable to load this information',
}: {
  message: string;
  onRetry: () => void;
  title?: string;
}) {
  return (
    <section
      className="rounded-xl border border-red-200 bg-red-50 p-5"
      role="alert"
    >
      <h2 className="font-semibold text-red-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-red-800">{message}</p>
      <button
        className="mt-4 min-h-11 cursor-pointer rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:ring-offset-2"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}
