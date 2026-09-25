'use client';

import {
  notificationEventSchema,
  type AuthUser,
  type Notification,
  type NotificationType,
} from '@client-portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect } from 'react';

import { API_URL, apiRequest } from '../../lib/api-client';
import {
  notificationResponseSchema,
  notificationsResponseSchema,
} from '../../lib/workspace-api';
import { FormAlert } from '../auth/form-controls';

const notificationLabels: Record<NotificationType, string> = {
  REQUIREMENT_STATUS_CHANGED: 'Requirement status changed',
  TASK_STATUS_CHANGED: 'Task status changed',
  COMMENT_CREATED: 'New comment',
};

function invalidateForNotification(
  queryClient: ReturnType<typeof useQueryClient>,
  notification: Notification,
) {
  void queryClient.invalidateQueries({ queryKey: ['notifications'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  if (notification.type === 'REQUIREMENT_STATUS_CHANGED') {
    void queryClient.invalidateQueries({ queryKey: ['requirement'] });
    void queryClient.invalidateQueries({ queryKey: ['requirements'] });
  }
  if (notification.type === 'TASK_STATUS_CHANGED') {
    void queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
    void queryClient.invalidateQueries({ queryKey: ['requirement'] });
  }
  if (notification.type === 'COMMENT_CREATED') {
    void queryClient.invalidateQueries({ queryKey: ['comments'] });
    void queryClient.invalidateQueries({ queryKey: ['requirement'] });
  }
}

export function NotificationBell({ user }: { user: AuthUser }) {
  const queryClient = useQueryClient();
  const notifications = useQuery({
    queryKey: ['notifications'],
    queryFn: async () =>
      notificationsResponseSchema.parse(
        await apiRequest<unknown>('/notifications?pageSize=20'),
      ),
  });
  const unread = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: async () =>
      notificationsResponseSchema.parse(
        await apiRequest<unknown>('/notifications?pageSize=1&unreadOnly=true'),
      ).pagination.total,
  });
  const markRead = useMutation({
    mutationFn: async (notificationId: string) =>
      notificationResponseSchema.parse(
        await apiRequest<unknown>(
          `/notifications/${notificationId}/read`,
          { method: 'POST' },
          { csrf: true },
        ),
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const source = new EventSource(`${API_URL}/events`, {
      withCredentials: true,
    });
    const onReady = () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['requirement'] });
      void queryClient.invalidateQueries({ queryKey: ['requirements'] });
      void queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      void queryClient.invalidateQueries({ queryKey: ['comments'] });
    };
    const onNotification = (event: MessageEvent<string>) => {
      try {
        const parsed = notificationEventSchema.safeParse(
          JSON.parse(event.data) as unknown,
        );
        if (parsed.success) {
          invalidateForNotification(queryClient, parsed.data.notification);
        }
      } catch {
        // Ignore malformed events and keep the stream connected.
      }
    };
    source.addEventListener('ready', onReady);
    source.addEventListener('notification', onNotification);
    return () => {
      source.removeEventListener('ready', onReady);
      source.removeEventListener('notification', onNotification);
      source.close();
    };
  }, [queryClient, user.id]);

  return (
    <details className="relative">
      <summary className="relative flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border border-slate-300 text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/30 [&::-webkit-details-marker]:hidden">
        <span aria-atomic="true" aria-live="polite" className="sr-only">
          Notifications{unread.data ? `, ${unread.data} unread` : ''}
        </span>
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        {unread.data ? (
          <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-blue-600 px-1.5 py-0.5 text-center text-[0.65rem] font-bold leading-4 text-white">
            {unread.data > 99 ? '99+' : unread.data}
          </span>
        ) : null}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2.5rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
        <div className="flex items-center justify-between gap-3 px-1 pb-2">
          <h2 className="font-semibold text-slate-950">Notifications</h2>
          <span className="text-xs text-slate-500">
            {unread.data ?? 0} unread
          </span>
        </div>
        {notifications.isPending ? (
          <p className="px-1 py-5 text-sm text-slate-600" aria-busy="true">
            Loading notifications…
          </p>
        ) : notifications.isError ? (
          <FormAlert message={notifications.error.message} />
        ) : notifications.data.data.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-3 py-5 text-sm text-slate-600">
            You have no notifications yet.
          </p>
        ) : (
          <ul className="max-h-96 space-y-1 overflow-y-auto">
            {notifications.data.data.map((notification) => (
              <li
                className={`rounded-lg p-3 ${notification.readAt ? 'bg-white' : 'bg-blue-50'}`}
                key={notification.id}
              >
                <Link
                  className="block text-sm font-semibold text-slate-900 hover:text-blue-800"
                  href={notification.href}
                  onClick={() => {
                    if (!notification.readAt) markRead.mutate(notification.id);
                  }}
                >
                  {notificationLabels[notification.type]}
                </Link>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <time
                    className="text-xs text-slate-500"
                    dateTime={notification.createdAt}
                  >
                    {new Date(notification.createdAt).toLocaleString()}
                  </time>
                  {!notification.readAt ? (
                    <button
                      className="min-h-8 rounded-md px-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(notification.id)}
                      type="button"
                    >
                      Mark read
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <FormAlert message={markRead.error?.message} />
        </div>
      </div>
    </details>
  );
}
