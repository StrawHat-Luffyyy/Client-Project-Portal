'use client';

import type { AuthUser, Task, TaskStatus } from '@client-portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { FormAlert, SelectInput } from '../../components/auth/form-controls';
import {
  AuthenticatedScreen,
  WorkspaceShell,
} from '../../components/workspace/workspace-shell';
import { CommentThread } from '../../components/workspace/comment-thread';
import { apiRequest } from '../../lib/api-client';
import {
  projectsResponseSchema,
  taskAssigneesResponseSchema,
  taskResponseSchema,
  tasksResponseSchema,
} from '../../lib/workspace-api';

const columns: Array<{ status: TaskStatus; label: string; accent: string }> = [
  { status: 'TODO', label: 'To do', accent: 'bg-slate-400' },
  { status: 'IN_PROGRESS', label: 'In progress', accent: 'bg-blue-600' },
  { status: 'IN_REVIEW', label: 'In review', accent: 'bg-amber-500' },
  { status: 'DONE', label: 'Done', accent: 'bg-emerald-600' },
];

const nextStatus: Partial<Record<TaskStatus, TaskStatus>> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'IN_REVIEW',
  IN_REVIEW: 'DONE',
};

function statusLabel(status: TaskStatus) {
  return status.toLowerCase().replaceAll('_', ' ');
}

function TaskCard({
  task,
  move,
  showRequirementLink,
  user,
}: {
  task: Task;
  move: (taskId: string, to: TaskStatus) => void;
  showRequirementLink: boolean;
  user: AuthUser;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const next = nextStatus[task.status];
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">
        {task.requirement.project.name}
      </p>
      <h3 className="mt-1 font-semibold leading-6 text-slate-950">
        {task.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {task.description}
      </p>
      <dl className="mt-4 grid gap-2 text-xs text-slate-500">
        <div className="flex justify-between gap-3">
          <dt>Assignee</dt>
          <dd className="font-medium text-slate-700">
            {task.assignee?.name ?? 'Unassigned'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Estimate</dt>
          <dd className="font-medium text-slate-700">
            {task.estimateHours ? `${task.estimateHours}h` : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Due</dt>
          <dd className="font-medium text-slate-700">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
          </dd>
        </div>
      </dl>
      {showRequirementLink ? (
        <Link
          className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-900"
          href={`/requirements/${task.requirementId}`}
        >
          View requirement
        </Link>
      ) : null}
      <label className="mt-4 block border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
        Status
        <select
          className="mt-2 min-h-10 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm capitalize text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-slate-100"
          disabled={!next}
          onChange={(event) => move(task.id, event.target.value as TaskStatus)}
          value={task.status}
        >
          <option value={task.status}>{statusLabel(task.status)}</option>
          {next ? <option value={next}>{statusLabel(next)}</option> : null}
        </select>
      </label>
      <details
        className="mt-4 border-t border-slate-100 pt-3"
        onToggle={(event) => setCommentsOpen(event.currentTarget.open)}
      >
        <summary className="cursor-pointer rounded-md py-2 text-sm font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30">
          Task discussion
        </summary>
        <div className="mt-2">
          <CommentThread
            compact
            enabled={commentsOpen}
            targetId={task.id}
            targetType="tasks"
            user={user}
          />
        </div>
      </details>
    </article>
  );
}

function BoardContent({ user }: { user: AuthUser }) {
  const queryClient = useQueryClient();
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [success, setSuccess] = useState<string>();
  const query = new URLSearchParams({ pageSize: '100' });
  if (projectId) query.set('projectId', projectId);
  if (assigneeId) query.set('assigneeId', assigneeId);
  const tasks = useQuery({
    queryKey: ['board-tasks', projectId, assigneeId],
    queryFn: async () =>
      tasksResponseSchema.parse(
        await apiRequest<unknown>(`/tasks?${query.toString()}`),
      ).data,
  });
  const projects = useQuery({
    queryKey: ['projects', 'board-filter'],
    enabled: user.role === 'PM',
    queryFn: async () =>
      projectsResponseSchema.parse(
        await apiRequest<unknown>('/projects?pageSize=100'),
      ).data,
  });
  const assignees = useQuery({
    queryKey: ['task-assignees'],
    enabled: user.role === 'PM',
    queryFn: async () =>
      taskAssigneesResponseSchema.parse(
        await apiRequest<unknown>('/tasks/assignees'),
      ).data,
  });
  const moveTask = useMutation({
    mutationFn: async ({ taskId, to }: { taskId: string; to: TaskStatus }) =>
      taskResponseSchema.parse(
        await apiRequest<unknown>(
          `/tasks/${taskId}/move`,
          { method: 'POST', body: JSON.stringify({ to }) },
          { csrf: true },
        ),
      ).data,
    onSuccess: async (task) => {
      setSuccess(`${task.title} moved to ${statusLabel(task.status)}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['board-tasks'] }),
        queryClient.invalidateQueries({
          queryKey: ['requirement', task.requirementId],
        }),
      ]);
    },
  });

  return (
    <>
      {user.role === 'PM' ? (
        <section className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Project
            <SelectInput
              className="mt-2"
              onChange={(event) => setProjectId(event.target.value)}
              value={projectId}
            >
              <option value="">All projects</option>
              {projects.data?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </SelectInput>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Assignee
            <SelectInput
              className="mt-2"
              onChange={(event) => setAssigneeId(event.target.value)}
              value={assigneeId}
            >
              <option value="">All engineers</option>
              {assignees.data?.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>
                  {engineer.name}
                </option>
              ))}
            </SelectInput>
          </label>
        </section>
      ) : null}
      <div className="mb-5 space-y-3">
        <FormAlert message={tasks.error?.message} />
        <FormAlert message={projects.error?.message} />
        <FormAlert message={assignees.error?.message} />
        <FormAlert message={moveTask.error?.message} />
        <FormAlert message={success} success />
      </div>
      {tasks.isPending ? (
        <p className="text-slate-600" aria-busy="true">
          Loading task board…
        </p>
      ) : tasks.data?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="font-semibold text-slate-950">No tasks to show</h2>
          <p className="mt-2 text-sm text-slate-600">
            {user.role === 'ENGINEER'
              ? 'No tasks are currently assigned to you.'
              : 'Create tasks from an approved requirement or adjust the filters.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-4">
          {columns.map((column) => {
            const columnTasks =
              tasks.data?.filter((task) => task.status === column.status) ?? [];
            return (
              <section
                className="min-w-64 rounded-xl bg-slate-100/80 p-3"
                key={column.status}
              >
                <div className="flex items-center justify-between px-1 py-2">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-2 rounded-full ${column.accent}`}
                    />
                    <h2 className="text-sm font-semibold text-slate-900">
                      {column.label}
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="mt-2 grid gap-3">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-500">
                      Empty
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        move={(taskId, to) => {
                          setSuccess(undefined);
                          moveTask.mutate({ taskId, to });
                        }}
                        showRequirementLink={user.role === 'PM'}
                        task={task}
                        user={user}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export function BoardClient() {
  return (
    <AuthenticatedScreen>
      {(user) => (
        <WorkspaceShell
          description={
            user.role === 'ENGINEER'
              ? 'Track and advance the delivery work assigned to you.'
              : 'Monitor delivery work across projects and engineers.'
          }
          title="Task board"
          user={user}
        >
          {user.role === 'PM' || user.role === 'ENGINEER' ? (
            <BoardContent user={user} />
          ) : (
            <FormAlert message="You do not have access to the task board." />
          )}
        </WorkspaceShell>
      )}
    </AuthenticatedScreen>
  );
}
