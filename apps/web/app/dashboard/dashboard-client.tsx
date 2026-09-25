'use client';

import type {
  AuthUser,
  Dashboard,
  RequirementStatus,
} from '@client-portal/shared';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import {
  AuthenticatedScreen,
  WorkspaceShell,
} from '../../components/workspace/workspace-shell';
import { apiRequest } from '../../lib/api-client';
import { dashboardResponseSchema } from '../../lib/workspace-api';

const statusLabels: Record<RequirementStatus, string> = {
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  NEEDS_INFO: 'Needs information',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In progress',
  DELIVERED: 'Delivered',
  REJECTED: 'Rejected',
};

const statusStyles: Record<RequirementStatus, string> = {
  SUBMITTED: 'bg-slate-100 text-slate-700',
  IN_REVIEW: 'bg-violet-100 text-violet-800',
  NEEDS_INFO: 'bg-amber-100 text-amber-900',
  APPROVED: 'bg-cyan-100 text-cyan-900',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const activityLabels: Record<string, string> = {
  REQUIREMENT_SUBMITTED: 'submitted the requirement',
  REQUIREMENT_UPDATED: 'updated the requirement',
  REQUIREMENT_STATUS_CHANGED: 'changed the requirement status',
  TASK_CREATED: 'created a task',
  TASK_UPDATED: 'updated a task',
  TASK_STATUS_CHANGED: 'changed a task status',
  COMMENT_CREATED: 'added a comment',
};

function dashboardCopy(user: AuthUser) {
  if (user.role === 'CLIENT') {
    return {
      title: `Welcome back, ${user.name}`,
      description:
        'Track delivery progress, requirement health, and recent client-safe activity across your projects.',
      actionHref: '/projects',
      actionLabel: 'View projects',
    };
  }
  if (user.role === 'ENGINEER') {
    return {
      title: `Welcome back, ${user.name}`,
      description:
        'See progress and recent activity only for delivery work assigned to you.',
      actionHref: '/board',
      actionLabel: 'Open task board',
    };
  }
  return {
    title: `Welcome back, ${user.name}`,
    description:
      'Monitor delivery health across clients, requirements, and project work.',
    actionHref: '/projects',
    actionLabel: 'Manage projects',
  };
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
            key={index}
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
      </div>
      <p className="sr-only">Loading dashboard metrics</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: number | string;
  note: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </section>
  );
}

function DashboardEmpty({ user }: { user: AuthUser }) {
  const isEngineer = user.role === 'ENGINEER';
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h2 className="text-xl font-semibold text-slate-950">
        {isEngineer ? 'No assigned delivery work yet' : 'No project work yet'}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">
        {isEngineer
          ? 'Tasks assigned to you will appear here with their project progress and recent activity.'
          : user.role === 'CLIENT'
            ? 'Your organization team will add projects here. Once available, you can submit and track requirements.'
            : 'Create a client and project to start tracking requirements and delivery progress.'}
      </p>
      {!isEngineer ? (
        <Link
          className="mt-6 inline-flex min-h-11 cursor-pointer items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:ring-offset-2"
          href={user.role === 'CLIENT' ? '/projects' : '/admin'}
        >
          {user.role === 'CLIENT' ? 'Check projects' : 'Set up a client'}
        </Link>
      ) : null}
    </section>
  );
}

function DashboardContent({
  dashboard,
  user,
}: {
  dashboard: Dashboard;
  user: AuthUser;
}) {
  if (dashboard.totals.projects === 0) return <DashboardEmpty user={user} />;
  const completion = dashboard.totals.tasks
    ? Math.round((dashboard.totals.doneTasks / dashboard.totals.tasks) * 100)
    : 0;
  const visibleStatuses = dashboard.requirementStatuses.filter(
    (status) => status.count > 0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={user.role === 'ENGINEER' ? 'Assigned projects' : 'Projects'}
          note="Within your authorized workspace"
          value={dashboard.totals.projects}
        />
        <MetricCard
          label="Requirements"
          note="Connected to the projects shown"
          value={dashboard.totals.requirements}
        />
        <MetricCard
          label={user.role === 'ENGINEER' ? 'Assigned tasks' : 'Tasks'}
          note={`${dashboard.totals.doneTasks} completed`}
          value={dashboard.totals.tasks}
        />
        <MetricCard
          label="Task completion"
          note="Completed tasks in the current scope"
          value={`${completion}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Project progress
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Task completion and requirement volume by project.
            </p>
          </div>
          <ul className="divide-y divide-slate-200">
            {dashboard.projectProgress.map((project) => {
              const projectCompletion = project.totalTasks
                ? Math.round((project.doneTasks / project.totalTasks) * 100)
                : 0;
              return (
                <li className="px-5 py-5 sm:px-6" key={project.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        className="cursor-pointer font-semibold text-slate-950 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                        href={
                          user.role === 'ENGINEER'
                            ? '/board'
                            : `/projects/${project.id}`
                        }
                      >
                        {project.name}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {project.clientName} · {project.requirementCount}{' '}
                        {project.requirementCount === 1
                          ? 'requirement'
                          : 'requirements'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {project.doneTasks}/{project.totalTasks} tasks
                    </span>
                  </div>
                  <div
                    aria-label={`${project.name} task completion`}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={projectCompletion}
                    className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                  >
                    <div
                      className="h-full rounded-full bg-blue-600 transition-[width] duration-200 motion-reduce:transition-none"
                      style={{ width: `${projectCompletion}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {project.totalTasks === 0
                      ? 'No tasks have been created yet.'
                      : `${projectCompletion}% complete`}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Requirement status
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Current distribution across this workspace.
          </p>
          {visibleStatuses.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {visibleStatuses.map((status) => (
                <li
                  className="flex items-center justify-between gap-4"
                  key={status.status}
                >
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status.status]}`}
                  >
                    {statusLabels[status.status]}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-950">
                    {status.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              No requirements have been submitted yet.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-slate-950">
            Recent activity
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Latest updates across requirements you can access.
          </p>
        </div>
        {dashboard.recentActivity.length > 0 ? (
          <ol className="divide-y divide-slate-200">
            {dashboard.recentActivity.map((activity) => (
              <li className="px-5 py-4 sm:px-6" key={activity.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
                  <p className="text-sm leading-6 text-slate-700">
                    <span className="font-semibold text-slate-950">
                      {activity.actor.name}
                    </span>{' '}
                    {activityLabels[activity.action] ?? 'updated the work'} on{' '}
                    <Link
                      className="cursor-pointer font-semibold text-blue-700 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                      href={`/requirements/${activity.requirementId}`}
                    >
                      {activity.requirementTitle}
                    </Link>
                    <span className="text-slate-500">
                      {' '}
                      in {activity.projectName}
                    </span>
                  </p>
                  <time
                    className="shrink-0 text-xs text-slate-500 sm:pt-1"
                    dateTime={activity.createdAt}
                  >
                    {new Date(activity.createdAt).toLocaleString()}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-5 py-8 text-sm text-slate-600 sm:px-6">
            No requirement activity has been recorded yet.
          </p>
        )}
      </section>
    </div>
  );
}

function DashboardWorkspace({ user }: { user: AuthUser }) {
  const copy = dashboardCopy(user);
  const dashboard = useQuery({
    queryKey: ['dashboard', user.id],
    queryFn: async () =>
      dashboardResponseSchema.parse(await apiRequest<unknown>('/dashboard'))
        .data,
  });

  return (
    <WorkspaceShell
      actions={
        <Link
          className="inline-flex min-h-11 cursor-pointer items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:ring-offset-2"
          href={copy.actionHref}
        >
          {copy.actionLabel}
        </Link>
      }
      description={copy.description}
      title={copy.title}
      user={user}
    >
      {dashboard.isPending ? <DashboardSkeleton /> : null}
      {dashboard.isError ? (
        <section
          className="rounded-xl border border-red-200 bg-red-50 p-6"
          role="alert"
        >
          <h2 className="text-lg font-semibold text-red-950">
            Dashboard data is unavailable
          </h2>
          <p className="mt-2 text-sm text-red-800">{dashboard.error.message}</p>
          <button
            className="mt-5 min-h-11 cursor-pointer rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:ring-offset-2"
            onClick={() => void dashboard.refetch()}
            type="button"
          >
            Try again
          </button>
        </section>
      ) : null}
      {dashboard.data ? (
        <DashboardContent dashboard={dashboard.data} user={user} />
      ) : null}
    </WorkspaceShell>
  );
}

export function DashboardClient() {
  return (
    <AuthenticatedScreen>
      {(user) => <DashboardWorkspace user={user} />}
    </AuthenticatedScreen>
  );
}
