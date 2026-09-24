'use client';

import {
  createTaskSchema,
  type AuthUser,
  type CreateTaskInput,
  type RequirementStatus,
  type Task,
  type TaskStatus,
} from '@client-portal/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  FormAlert,
  FormField,
  SelectInput,
  SubmitButton,
  TextAreaInput,
  TextInput,
} from '../auth/form-controls';
import { CommentThread } from './comment-thread';
import { apiRequest } from '../../lib/api-client';
import {
  taskAssigneesResponseSchema,
  taskResponseSchema,
  tasksResponseSchema,
} from '../../lib/workspace-api';

const statusStyles: Record<TaskStatus, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-amber-100 text-amber-900',
  DONE: 'bg-emerald-100 text-emerald-800',
};

function statusLabel(status: TaskStatus) {
  return status.toLowerCase().replaceAll('_', ' ');
}

function taskFormDefaults(): CreateTaskInput {
  return {
    idempotencyKey: globalThis.crypto.randomUUID(),
    title: '',
    description: '',
    assigneeId: null,
    estimateHours: null,
    dueDate: null,
  };
}

function TaskDiscussion({ task, user }: { task: Task; user: AuthUser }) {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="mt-4 border-t border-slate-100 pt-3"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="cursor-pointer rounded-md py-2 text-sm font-semibold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30">
        Task discussion
      </summary>
      <div className="mt-2">
        <CommentThread
          compact
          enabled={open}
          targetId={task.id}
          targetType="tasks"
          user={user}
        />
      </div>
    </details>
  );
}

export function RequirementTasks({
  requirementId,
  requirementStatus,
  user,
}: {
  requirementId: string;
  requirementStatus: RequirementStatus;
  user: AuthUser;
}) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState<string>();
  const tasks = useQuery({
    queryKey: ['requirement', requirementId, 'tasks'],
    queryFn: async () =>
      tasksResponseSchema.parse(
        await apiRequest<unknown>(
          `/requirements/${requirementId}/tasks?pageSize=100`,
        ),
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
  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: taskFormDefaults(),
  });
  const createTask = useMutation({
    mutationFn: async (input: CreateTaskInput) =>
      taskResponseSchema.parse(
        await apiRequest<unknown>(
          `/requirements/${requirementId}/tasks`,
          { method: 'POST', body: JSON.stringify(input) },
          { csrf: true },
        ),
      ).data,
    onSuccess: async () => {
      form.reset(taskFormDefaults());
      setSuccess('Task added to the requirement breakdown.');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['requirement', requirementId, 'tasks'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['requirement', requirementId, 'activity'],
        }),
        queryClient.invalidateQueries({ queryKey: ['board-tasks'] }),
      ]);
    },
  });
  const canCreate = user.role === 'PM' && requirementStatus === 'APPROVED';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            Task breakdown
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Delivery work created from this approved requirement.
          </p>
        </div>
        {tasks.data ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {tasks.data.length} {tasks.data.length === 1 ? 'task' : 'tasks'}
          </span>
        ) : null}
      </div>

      {tasks.isPending ? (
        <p className="mt-5 text-sm text-slate-600" aria-busy="true">
          Loading tasks…
        </p>
      ) : tasks.isError ? (
        <div className="mt-5">
          <FormAlert message={tasks.error.message} />
        </div>
      ) : tasks.data.length === 0 ? (
        <p className="mt-5 rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-600">
          No tasks have been created for this requirement.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {tasks.data.map((task) => (
            <li
              className="rounded-lg border border-slate-200 p-4"
              key={task.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">{task.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {task.description}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[task.status]}`}
                >
                  {statusLabel(task.status)}
                </span>
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                <div>
                  <dt className="sr-only">Assignee</dt>
                  <dd>{task.assignee?.name ?? 'Unassigned'}</dd>
                </div>
                <div>
                  <dt className="sr-only">Estimate</dt>
                  <dd>
                    {task.estimateHours
                      ? `${task.estimateHours} hours`
                      : 'No estimate'}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Due date</dt>
                  <dd>
                    {task.dueDate
                      ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                      : 'No due date'}
                  </dd>
                </div>
              </dl>
              <TaskDiscussion task={task} user={user} />
            </li>
          ))}
        </ul>
      )}

      {canCreate ? (
        <form
          className="mt-6 space-y-4 border-t border-slate-200 pt-6"
          onSubmit={(event) =>
            void form.handleSubmit((input) => {
              setSuccess(undefined);
              createTask.mutate(input);
            })(event)
          }
        >
          <input type="hidden" {...form.register('idempotencyKey')} />
          <h3 className="font-semibold text-slate-950">Add task</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              error={form.formState.errors.title?.message}
              label="Task title"
            >
              <TextInput {...form.register('title')} />
            </FormField>
            <FormField
              error={form.formState.errors.assigneeId?.message}
              label="Engineer"
            >
              <SelectInput
                {...form.register('assigneeId', {
                  setValueAs: (value: string) => value || null,
                })}
              >
                <option value="">Unassigned</option>
                {assignees.data?.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.name}
                  </option>
                ))}
              </SelectInput>
            </FormField>
          </div>
          <FormField
            error={form.formState.errors.description?.message}
            label="Description"
          >
            <TextAreaInput {...form.register('description')} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              error={form.formState.errors.estimateHours?.message}
              label="Estimate (hours)"
            >
              <TextInput
                min="0.25"
                step="0.25"
                type="number"
                {...form.register('estimateHours', {
                  setValueAs: (value: string) =>
                    value === '' ? null : Number(value),
                })}
              />
            </FormField>
            <FormField
              error={form.formState.errors.dueDate?.message}
              label="Due date"
            >
              <TextInput
                type="date"
                {...form.register('dueDate', {
                  setValueAs: (value: string) => value || null,
                })}
              />
            </FormField>
          </div>
          <FormAlert message={assignees.error?.message} />
          <FormAlert message={createTask.error?.message} />
          <FormAlert message={success} success />
          <SubmitButton pending={createTask.isPending}>Add task</SubmitButton>
        </form>
      ) : null}
    </section>
  );
}
