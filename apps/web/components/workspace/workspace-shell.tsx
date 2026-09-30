'use client';

import type { AuthUser } from '@client-portal/shared';
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { ApiClientError, apiRequest } from '../../lib/api-client';
import { meResponseSchema } from '../../lib/workspace-api';
import { NotificationBell } from './notification-bell';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () =>
      meResponseSchema.parse(await apiRequest<unknown>('/auth/me')).data.user,
    retry: false,
  });
}

const roleLabels: Record<AuthUser['role'], string> = {
  ADMIN: 'Organization admin',
  PM: 'Project manager',
  ENGINEER: 'Engineering',
  CLIENT: 'Client workspace',
};

export function WorkspaceShell({
  user,
  title,
  description,
  titleAriaLabel,
  actions,
  children,
}: {
  user: AuthUser;
  title: string;
  description: string;
  titleAriaLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const logout = useMutation({
    mutationFn: () =>
      apiRequest<void>('/auth/logout', { method: 'POST' }, { csrf: true }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });
  const navigation = [
    {
      group: 'WORKSPACE',
      items: [{ href: '/dashboard', label: 'Overview', icon: LayoutDashboard }],
    },
    {
      group: 'DELIVERY',
      items: [
        ...(user.role === 'ENGINEER'
          ? []
          : [
              { href: '/projects', label: 'Projects', icon: BriefcaseBusiness },
            ]),
        ...(user.role === 'PM' || user.role === 'ENGINEER'
          ? [{ href: '/board', label: 'Task board', icon: ClipboardList }]
          : []),
      ],
    },
    ...(user.role === 'ADMIN' || user.role === 'PM'
      ? [
          {
            group: 'ORGANIZATION',
            items: [
              { href: '/admin', label: 'Clients & team', icon: Building2 },
            ],
          },
        ]
      : []),
  ].filter((group) => group.items.length > 0);

  return (
    <div className="min-h-dvh bg-[var(--color-background)] text-[var(--color-foreground)]">
      <a className="skip-link" href="#workspace-content">
        Skip to main content
      </a>
      <aside className="workspace-sidebar" aria-label="Workspace">
        <Link className="brand-lockup" href="/dashboard">
          <span className="brand-mark" aria-hidden="true">
            CP
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold tracking-tight text-[var(--color-foreground)]">
              Client Portal
            </span>
            <span className="mt-0.5 block truncate text-xs text-[var(--color-muted-foreground)]">
              Workspace
            </span>
          </span>
        </Link>
        <div className="workspace-switcher">
          <span className="workspace-switcher-mark" aria-hidden="true">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {user.name}
            </span>
            <span className="mt-0.5 block truncate text-xs text-[var(--color-muted-foreground)]">
              {roleLabels[user.role]}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-[var(--color-muted-foreground)]"
          />
        </div>
        <nav aria-label="Primary navigation" className="workspace-nav">
          {navigation.map((group) => (
            <div className="workspace-nav-group" key={group.group}>
              <p className="workspace-nav-label">{group.group}</p>
              {group.items.map(({ href, label, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <Link
                    aria-current={active ? 'page' : undefined}
                    className={`workspace-nav-link${active ? ' is-active' : ''}`}
                    href={href}
                    key={href}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-[18px] shrink-0"
                      strokeWidth={1.8}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="workspace-sidebar-footer">
          <span className="role-dot" aria-hidden="true" />
          <span className="truncate">{user.role}</span>
          <span className="ml-auto text-xs text-[var(--color-muted-foreground)]">
            Portal
          </span>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-topbar">
          <button
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
            className="icon-button mobile-nav-toggle"
            onClick={() => setMobileNavOpen((open) => !open)}
            type="button"
          >
            {mobileNavOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
          </button>
          <p className="topbar-context">
            <span className="role-dot" aria-hidden="true" />
            {roleLabels[user.role]}
          </p>
          <div className="topbar-actions">
            <NotificationBell user={user} />
            <span className="topbar-divider" aria-hidden="true" />
            <span className="topbar-avatar" aria-hidden="true">
              {user.name
                .split(/\s+/)
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <span className="topbar-user truncate">{user.name}</span>
            <button
              aria-label="Sign out"
              className="icon-button signout-button"
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
              title={logout.isPending ? 'Signing out' : 'Sign out'}
              type="button"
            >
              <LogOut aria-hidden="true" className="size-4" />
            </button>
          </div>
        </header>
        {mobileNavOpen ? (
          <div className="mobile-navigation-panel">
            <nav
              aria-label="Mobile primary navigation"
              className="workspace-nav"
            >
              {navigation
                .flatMap((group) => group.items)
                .map(({ href, label, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      aria-current={active ? 'page' : undefined}
                      className={`workspace-nav-link${active ? ' is-active' : ''}`}
                      href={href}
                      key={href}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      <Icon aria-hidden="true" className="size-[18px]" />
                      {label}
                    </Link>
                  );
                })}
            </nav>
          </div>
        ) : null}
        <main className="workspace-content" id="workspace-content">
          <div className="page-heading">
            <div className="min-w-0">
              <p className="page-eyebrow">{roleLabels[user.role]}</p>
              <h1 aria-label={titleAriaLabel} className="page-title">
                {title}
              </h1>
              <p className="page-description">{description}</p>
            </div>
            {actions ? <div className="page-actions">{actions}</div> : null}
          </div>
          {logout.error ? (
            <p className="mt-4 text-sm text-[var(--color-danger)]" role="alert">
              {logout.error.message}
            </p>
          ) : null}
          <div className="page-body">{children}</div>
        </main>
      </div>
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
        <p className="text-[var(--color-muted-foreground)]">
          Loading your workspace…
        </p>
      </main>
    );
  }
  if (query.isError) {
    return (
      <main className="mx-auto max-w-xl px-5 py-20 sm:px-8">
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Unable to load your workspace
        </h1>
        <p className="mt-3 text-[var(--color-muted-foreground)]">
          {query.error.message}
        </p>
        <button
          className="button-primary mt-6"
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
