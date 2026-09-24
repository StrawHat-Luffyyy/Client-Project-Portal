'use client';

import type { AuthUser } from '@client-portal/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { ApiClientError, apiRequest } from '../../lib/api-client';
import { meResponseSchema } from '../../lib/workspace-api';

const dashboardNavItem = { href: '/dashboard', label: 'Dashboard' } as const;
const projectsNavItem = { href: '/projects', label: 'Projects' } as const;
const boardNavItem = { href: '/board', label: 'Task board' } as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () =>
      meResponseSchema.parse(await apiRequest<unknown>('/auth/me')).data.user,
    retry: false,
  });
}

export function WorkspaceShell({
  user,
  title,
  description,
  actions,
  children,
}: {
  user: AuthUser;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useMutation({
    mutationFn: () =>
      apiRequest<void>('/auth/logout', { method: 'POST' }, { csrf: true }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });
  const navigation = [
    dashboardNavItem,
    ...(user.role === 'ENGINEER' ? [] : [projectsNavItem]),
    ...(user.role === 'PM' || user.role === 'ENGINEER' ? [boardNavItem] : []),
    ...(user.role === 'ADMIN' || user.role === 'PM'
      ? [{ href: '/admin', label: 'Clients & team' }]
      : []),
  ];

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
          <Link
            className="mr-auto text-sm font-semibold text-slate-950"
            href="/dashboard"
          >
            Client Project Portal
          </Link>
          <nav
            aria-label="Primary navigation"
            className="order-3 flex w-full gap-1 sm:order-none sm:w-auto"
          >
            {navigation.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            className="min-h-11 cursor-pointer rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            type="button"
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
              {user.role}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
          </div>
          {actions}
        </div>
        {logout.error ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {logout.error.message}
          </p>
        ) : null}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function AuthenticatedScreen({
  children,
}: {
  children: (user: AuthUser) => ReactNode;
}) {
  const router = useRouter();
  const query = useCurrentUser();

  useEffect(() => {
    if (query.error instanceof ApiClientError && query.error.status === 401) {
      router.replace('/login');
    }
  }, [query.error, router]);

  if (query.isPending) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8" aria-busy="true">
        <p className="text-slate-600">Loading your workspace…</p>
      </main>
    );
  }
  if (query.isError) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <h1 className="text-2xl font-semibold text-slate-950">
          Unable to load your workspace
        </h1>
        <p className="mt-3 text-slate-600">{query.error.message}</p>
        <button
          className="mt-6 min-h-11 cursor-pointer rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          onClick={() => void query.refetch()}
          type="button"
        >
          Try again
        </button>
      </main>
    );
  }
  return children(query.data);
}
