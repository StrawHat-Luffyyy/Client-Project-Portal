import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  alternateText,
  alternateHref,
  alternateLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  alternateText?: string;
  alternateHref?: string;
  alternateLabel?: string;
}) {
  return (
    <main className="auth-layout">
      <section className="auth-aside">
        <Link className="auth-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            CP
          </span>
          <span>Client Project Portal</span>
        </Link>
        <div className="auth-aside-content">
          <p className="auth-eyebrow">SHARED DELIVERY WORKSPACE</p>
          <h2>From a clear request to confirmed delivery.</h2>
          <p className="auth-aside-note">
            One accountable path for client priorities, project review, and
            engineering work.
          </p>
          <ol className="auth-flow">
            <li>
              <span className="auth-flow-number">01</span>
              <span>
                <strong>Client request</strong>
                <small>Outcome and context</small>
              </span>
              <Check aria-hidden="true" className="size-4" />
            </li>
            <li>
              <span className="auth-flow-number">02</span>
              <span>
                <strong>PM review</strong>
                <small>Scope and next action</small>
              </span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </li>
            <li>
              <span className="auth-flow-number">03</span>
              <span>
                <strong>Engineering delivery</strong>
                <small>Visible progress</small>
              </span>
              <ArrowRight aria-hidden="true" className="size-4" />
            </li>
          </ol>
        </div>
        <p className="auth-aside-footer">
          Private by design · Scoped to your workspace
        </p>
      </section>

      <section className="auth-main">
        <div className="auth-main-inner">
          <Link className="auth-mobile-brand" href="/">
            Client Project Portal
          </Link>
          <p className="auth-eyebrow auth-eyebrow-light">{eyebrow}</p>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-description">{description}</p>
          <div className="auth-form-panel">{children}</div>
          {alternateText && alternateHref && alternateLabel ? (
            <p className="auth-alternate">
              {alternateText}{' '}
              <Link className="text-link" href={alternateHref}>
                {alternateLabel}
              </Link>
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
