'use client';

import Link from 'next/link';

import {
  AuthenticatedScreen,
  WorkspaceShell,
} from '../../components/workspace/workspace-shell';

export function DashboardClient() {
  return (
    <AuthenticatedScreen>
      {(user) => (
        <WorkspaceShell
          description="Keep client requests and delivery work connected in one tenant-safe workspace."
          title={`Welcome, ${user.name}`}
          user={user}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {user.role !== 'ENGINEER' ? (
              <Link
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30"
                href="/projects"
              >
                <p className="text-sm font-semibold text-blue-700">Projects</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  {user.role === 'CLIENT'
                    ? 'View projects and submit requirements'
                    : 'Manage delivery work'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review scoped projects, requirements, priorities, and current
                  statuses.
                </p>
              </Link>
            ) : (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-blue-700">
                  Engineering workspace
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Assigned tasks arrive in Phase 5
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Engineer access will be limited to assigned delivery work
                  rather than the organization-wide project portfolio.
                </p>
              </section>
            )}
            {user.role === 'ADMIN' || user.role === 'PM' ? (
              <Link
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50/30"
                href="/admin"
              >
                <p className="text-sm font-semibold text-blue-700">
                  Administration
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Clients and access
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Create client accounts and prepare the people who collaborate
                  on their projects.
                </p>
              </Link>
            ) : (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-blue-700">
                  Account scope
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">
                  Protected client access
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Your account can only access projects and requirements
                  assigned to your client account.
                </p>
              </section>
            )}
          </div>
        </WorkspaceShell>
      )}
    </AuthenticatedScreen>
  );
}
