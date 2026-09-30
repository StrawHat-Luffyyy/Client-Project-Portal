import { Shield, Users, Lock, Layout } from 'lucide-react';

export function Trust() {
  return (
    <section
      id="security"
      className="bg-slate-950 py-24 sm:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Enterprise-grade protection
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Your data and your clients' data is isolated, protected, and
            accessible only to authorized members. Built on solid foundations,
            not buzzwords.
          </p>
        </div>

        <div className="mx-auto max-w-2xl lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-12 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Shield
                    className="h-6 w-6 text-blue-400"
                    aria-hidden="true"
                  />
                </div>
              </dt>
              <dd className="flex flex-auto flex-col text-base leading-7 text-slate-400 mt-2">
                <h3 className="text-white font-semibold mb-2">
                  Strict tenant isolation
                </h3>
                <p className="flex-auto text-sm">
                  Every organization's data is strictly isolated at the database
                  level. Cross-tenant access is cryptographically impossible by
                  design.
                </p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Lock
                    className="h-6 w-6 text-emerald-400"
                    aria-hidden="true"
                  />
                </div>
              </dt>
              <dd className="flex flex-auto flex-col text-base leading-7 text-slate-400 mt-2">
                <h3 className="text-white font-semibold mb-2">
                  Protected workspaces
                </h3>
                <p className="flex-auto text-sm">
                  Clients securely access their own dedicated portals without
                  ever seeing internal chatter, draft tasks, or other clients'
                  information.
                </p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Users
                    className="h-6 w-6 text-purple-400"
                    aria-hidden="true"
                  />
                </div>
              </dt>
              <dd className="flex flex-auto flex-col text-base leading-7 text-slate-400 mt-2">
                <h3 className="text-white font-semibold mb-2">
                  Role-based collaboration
                </h3>
                <p className="flex-auto text-sm">
                  Granular permissions ensure clients only see what you want
                  them to see, while your internal team has the exact tools they
                  need to execute.
                </p>
              </dd>
            </div>

            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Layout
                    className="h-6 w-6 text-amber-400"
                    aria-hidden="true"
                  />
                </div>
              </dt>
              <dd className="flex flex-auto flex-col text-base leading-7 text-slate-400 mt-2">
                <h3 className="text-white font-semibold mb-2">
                  Structured visibility
                </h3>
                <p className="flex-auto text-sm">
                  No more "What's the status?" emails. The platform surfaces
                  sanitized, high-level progress automatically based on actual
                  engineering work.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
