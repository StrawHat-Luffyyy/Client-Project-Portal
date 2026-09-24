const capabilities = [
  [
    'Structured intake',
    'Clients submit clear, prioritized requirements in one place.',
  ],
  [
    'Visible delivery',
    'Project teams coordinate tasks while clients see useful progress.',
  ],
  [
    'Protected collaboration',
    'Organization and client boundaries are enforced throughout.',
  ],
] as const;

export default function HomePage() {
  return (
    <main>
      <header className="border-b border-[var(--color-border)] bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8">
          <span className="text-sm font-semibold tracking-tight text-slate-900">
            Client Project Portal
          </span>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
            Project operations, made clear
          </p>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-6xl">
            From client request to delivered work.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            A secure workspace for clients, project managers, and engineers to
            align on requirements, delivery, and progress.
          </p>
          <div className="mt-9 inline-flex min-h-11 items-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm">
            Foundation ready
          </div>
        </div>

        <aside className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">
            Platform status
          </p>
          <div className="mt-5 flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <span
              className="h-2.5 w-2.5 rounded-full bg-emerald-600"
              aria-hidden="true"
            />
            Foundation services configured
          </div>
          <dl className="mt-6 grid gap-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <dt className="text-slate-500">API</dt>
              <dd className="font-medium text-slate-900">Express</dd>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <dt className="text-slate-500">Database</dt>
              <dd className="font-medium text-slate-900">PostgreSQL</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Tenancy key</dt>
              <dd className="font-medium text-slate-900">organizationId</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="border-y border-[var(--color-border)] bg-white">
        <div className="mx-auto grid max-w-6xl gap-px bg-[var(--color-border)] sm:grid-cols-3">
          {capabilities.map(([title, description]) => (
            <article key={title} className="bg-white px-5 py-8 sm:px-8">
              <h2 className="font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
