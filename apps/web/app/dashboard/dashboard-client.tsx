'use client';

import type {
  AuthUser,
  Dashboard,
  RequirementStatus,
} from '@client-portal/shared';
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FolderKanban,
  MessageSquareText,
} from 'lucide-react';
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
  SUBMITTED: 'status-neutral',
  IN_REVIEW: 'status-indigo',
  NEEDS_INFO: 'status-warning',
  APPROVED: 'status-teal',
  IN_PROGRESS: 'status-info',
  DELIVERED: 'status-success',
  REJECTED: 'status-danger',
};
const activityLabels: Record<string, string> = {
  REQUIREMENT_SUBMITTED: 'submitted a requirement',
  REQUIREMENT_UPDATED: 'updated requirement details',
  REQUIREMENT_STATUS_CHANGED: 'changed requirement status',
  TASK_CREATED: 'created a task',
  TASK_UPDATED: 'updated a task',
  TASK_STATUS_CHANGED: 'moved a task',
  COMMENT_CREATED: 'added a comment',
};

function dashboardCopy(user: AuthUser) {
  if (user.role === 'CLIENT')
    return {
      title: `Welcome back, ${user.name.split(' ')[0]}`,
      description:
        'Follow requests from submission through delivery across your active projects.',
      actionHref: '/projects',
      actionLabel: 'Open projects',
    };
  if (user.role === 'ENGINEER')
    return {
      title: `Your delivery work`,
      description: 'A focused view of the projects and tasks assigned to you.',
      actionHref: '/board',
      actionLabel: 'Go to task board',
    };
  return {
    title:
      user.role === 'ADMIN' ? 'Organization overview' : 'Delivery overview',
    description:
      user.role === 'ADMIN'
        ? 'A clear view of client work, request health, and recent delivery activity.'
        : 'Triage incoming requests and keep project delivery moving.',
    actionHref: user.role === 'ADMIN' ? '/admin' : '/projects',
    actionLabel: user.role === 'ADMIN' ? 'Clients & team' : 'Review projects',
  };
}

function DashboardEmpty({ user }: { user: AuthUser }) {
  const copy =
    user.role === 'ENGINEER'
      ? [
          'Nothing assigned yet',
          'When a project manager assigns delivery work, your active tasks will appear here.',
        ]
      : user.role === 'CLIENT'
        ? [
            'Your workspace is getting ready',
            'Projects from your delivery team will appear here.',
          ]
        : [
            'No delivery work yet',
            'Add a client and project to start receiving and tracking requirements.',
          ];
  return (
    <section className="panel flex flex-col items-start gap-4 p-6 sm:p-8">
      <span className="grid size-10 place-items-center rounded-lg bg-[#edf3fa] text-[#2459a6]">
        <FolderKanban aria-hidden="true" className="size-5" />
      </span>
      <div>
        <h2 className="section-title">{copy[0]}</h2>
        <p className="section-description max-w-xl">{copy[1]}</p>
      </div>
      {user.role !== 'ENGINEER' ? (
        <Link
          className="button-secondary"
          href={user.role === 'CLIENT' ? '/projects' : '/admin'}
        >
          Continue <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </section>
  );
}

function ProgressPanel({
  dashboard,
  user,
}: {
  dashboard: Dashboard;
  user: AuthUser;
}) {
  return (
    <section className="panel overflow-hidden">
      <header className="panel-header flex items-center justify-between gap-4">
        <div>
          <h2 className="section-title">
            {user.role === 'CLIENT'
              ? 'Your projects'
              : user.role === 'ENGINEER'
                ? 'Assigned project'
                : 'Project delivery'}
          </h2>
          <p className="section-description">
            Task progress and active requirement volume
          </p>
        </div>
        <Link
          className="text-link text-sm"
          href={user.role === 'ENGINEER' ? '/board' : '/projects'}
        >
          View all
        </Link>
      </header>
      {dashboard.projectProgress.length ? (
        <ul className="divide-y divide-[#e8edf2]">
          {dashboard.projectProgress.map((project) => {
            const completion = project.totalTasks
              ? Math.round((project.doneTasks / project.totalTasks) * 100)
              : 0;
            return (
              <li className="px-5 py-4 sm:px-6" key={project.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <Link
                    className="font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
                    href={
                      user.role === 'ENGINEER'
                        ? '/board'
                        : `/projects/${project.id}`
                    }
                  >
                    {project.name}
                  </Link>
                  <span className="text-xs font-semibold tabular-nums text-[var(--color-muted-foreground)]">
                    {project.doneTasks} of {project.totalTasks} tasks done
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted-foreground)]">
                  <span>
                    {project.clientName}{' '}
                    <span className="px-1 text-[#9aa6b2]">·</span>{' '}
                    {project.requirementCount}{' '}
                    {project.requirementCount === 1
                      ? 'requirement'
                      : 'requirements'}
                  </span>
                  <span>
                    {project.totalTasks ? `${completion}%` : 'Not started'}
                  </span>
                </div>
                <div
                  aria-label={`${project.name} task completion`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={completion}
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8edf2]"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full bg-[#4775ad] transition-[width] duration-200 motion-reduce:transition-none"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-6 text-sm text-[var(--color-muted-foreground)]">
          No projects are available yet.
        </p>
      )}
    </section>
  );
}

function StatusPanel({
  dashboard,
  user,
}: {
  dashboard: Dashboard;
  user: AuthUser;
}) {
  const visible = dashboard.requirementStatuses.filter(
    (item) => item.count > 0,
  );
  return (
    <section className="panel p-5">
      <h2 className="section-title">
        {user.role === 'CLIENT' ? 'Request status' : 'Triage queue'}
      </h2>
      <p className="section-description">
        {user.role === 'CLIENT'
          ? 'Where your requests are in the delivery process'
          : 'Requirements across your authorized projects'}
      </p>
      <ul className="mt-5 grid gap-2.5">
        {visible.map(({ status, count }) => (
          <li className="flex items-center justify-between gap-4" key={status}>
            <span className={`status-chip ${statusStyles[status]}`}>
              {statusLabels[status]}
            </span>
            <span className="font-semibold tabular-nums text-[var(--color-foreground)]">
              {count}
            </span>
          </li>
        ))}
      </ul>
      {!visible.length ? (
        <p className="mt-5 text-sm text-[var(--color-muted-foreground)]">
          No requirements to report yet.
        </p>
      ) : null}
    </section>
  );
}

function ActivityPanel({ dashboard }: { dashboard: Dashboard }) {
  return (
    <section className="panel overflow-hidden">
      <header className="panel-header">
        <h2 className="section-title">Latest activity</h2>
        <p className="section-description">
          Recent updates you’re authorized to see
        </p>
      </header>
      {dashboard.recentActivity.length ? (
        <ol className="divide-y divide-[#e8edf2]">
          {dashboard.recentActivity.map((activity) => (
            <li className="flex gap-3 px-5 py-3.5 sm:px-6" key={activity.id}>
              <span className="mt-1 grid size-7 flex-none place-items-center rounded-full bg-[#edf3fa] text-[#42668f]">
                <MessageSquareText aria-hidden="true" className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 text-sm leading-5 text-[#45576b]">
                  <span className="font-semibold text-[var(--color-foreground)]">
                    {activity.actor.name}
                  </span>{' '}
                  {activityLabels[activity.action] ?? 'updated work'} on{' '}
                  <Link
                    className="text-link"
                    href={`/requirements/${activity.requirementId}`}
                  >
                    {activity.requirementTitle}
                  </Link>
                  <span className="text-[var(--color-muted-foreground)]">
                    {' '}
                    in {activity.projectName}
                  </span>
                </p>
                <time
                  className="mt-1 block text-xs text-[var(--color-muted-foreground)]"
                  dateTime={activity.createdAt}
                >
                  {new Date(activity.createdAt).toLocaleString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-5 py-6 text-sm text-[var(--color-muted-foreground)]">
          No activity has been recorded yet.
        </p>
      )}
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
  const pending = dashboard.requirementStatuses
    .filter((item) => ['SUBMITTED', 'NEEDS_INFO'].includes(item.status))
    .reduce((sum, item) => sum + item.count, 0);
  const tasksOpen = dashboard.totals.tasks - dashboard.totals.doneTasks;
  const isClient = user.role === 'CLIENT';
  const isEngineer = user.role === 'ENGINEER';
  const isAdmin = user.role === 'ADMIN';
  const lead = isClient
    ? {
        icon: CircleAlert,
        eyebrow: 'CLIENT WORKSPACE',
        title: pending
          ? `${pending} request${pending === 1 ? '' : 's'} need your attention`
          : 'Your requests are with the delivery team',
        note: `${dashboard.totals.projects} active ${dashboard.totals.projects === 1 ? 'project' : 'projects'} · ${dashboard.totals.requirements} total requests`,
        link: '/projects',
        linkText: pending ? 'Review requests' : 'Browse projects',
        tone: pending ? 'attention' : 'calm',
      }
    : isEngineer
      ? {
          icon: ClipboardCheck,
          eyebrow: 'MY ASSIGNMENTS',
          title: tasksOpen
            ? `${tasksOpen} task${tasksOpen === 1 ? '' : 's'} in progress`
            : 'Your assigned tasks are complete',
          note: `${dashboard.totals.doneTasks} of ${dashboard.totals.tasks} assigned tasks done · ${dashboard.totals.projects} project${dashboard.totals.projects === 1 ? '' : 's'}`,
          link: '/board',
          linkText: 'Open my task board',
          tone: 'calm',
        }
      : {
          icon: isAdmin ? FolderKanban : CircleAlert,
          eyebrow: isAdmin ? 'ORGANIZATION HEALTH' : 'TRIAGE QUEUE',
          title: pending
            ? `${pending} request${pending === 1 ? '' : 's'} waiting for action`
            : 'No requests are waiting for triage',
          note: `${dashboard.totals.projects} projects · ${dashboard.totals.tasks - dashboard.totals.doneTasks} open tasks · ${completion}% task completion`,
          link: isAdmin ? '/admin' : '/projects',
          linkText: isAdmin ? 'Manage workspace' : 'Open project queue',
          tone: pending ? 'attention' : 'calm',
        };
  const LeadIcon = lead.icon;

  return (
    <div className="space-y-5">
      <section className={`operational-lead ${lead.tone}`}>
        <div className="operational-lead-icon">
          <LeadIcon aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="operational-eyebrow">{lead.eyebrow}</p>
          <h2 className="operational-title">{lead.title}</h2>
          <p className="operational-note">{lead.note}</p>
        </div>
        <Link className="button-primary" href={lead.link}>
          {lead.linkText}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.8fr)]">
        <ProgressPanel dashboard={dashboard} user={user} />
        <div className="grid gap-5">
          <StatusPanel dashboard={dashboard} user={user} />
          <section className="quick-facts">
            <div className="quick-fact">
              <span>Requirements</span>
              <strong>{dashboard.totals.requirements}</strong>
            </div>
            <div className="quick-fact">
              <span>{isEngineer ? 'My tasks' : 'Total tasks'}</span>
              <strong>{dashboard.totals.tasks}</strong>
            </div>
            <div className="quick-fact">
              <span>Completed</span>
              <strong>{dashboard.totals.doneTasks}</strong>
              <CheckCircle2
                aria-hidden="true"
                className="size-4 text-[var(--color-success)]"
              />
            </div>
          </section>
        </div>
      </div>
      <ActivityPanel dashboard={dashboard} />
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
        <Link className="button-secondary" href={copy.actionHref}>
          {copy.actionLabel}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      }
      description={copy.description}
      title={copy.title}
      user={user}
    >
      {dashboard.isPending ? (
        <div
          aria-busy="true"
          aria-live="polite"
          className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,.8fr)]"
        >
          <div className="h-36 animate-pulse rounded-lg bg-[#e8edf2]" />
          <div className="h-64 animate-pulse rounded-lg bg-[#e8edf2]" />
          <p className="sr-only">Loading delivery overview</p>
        </div>
      ) : null}
      {dashboard.isError ? (
        <section
          className="rounded-lg border border-[#efcaca] bg-[#fff5f5] p-6"
          role="alert"
        >
          <h2 className="section-title text-[var(--color-danger)]">
            Dashboard data is unavailable
          </h2>
          <p className="mt-2 text-sm text-[#7f1d1d]">
            {dashboard.error.message}
          </p>
          <button
            className="button-secondary mt-4"
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
