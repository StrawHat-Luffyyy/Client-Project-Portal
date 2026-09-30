import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

const inputClassName =
  'form-control mt-2 min-h-11 w-full rounded-md border bg-white px-3 py-2 text-base text-slate-950 transition-colors placeholder:text-slate-400';

export function FormField({
  label,
  error,
  helper,
  children,
}: {
  label: string;
  error?: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-800">
        {label}
        {children}
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : helper ? (
        <p className="form-helper">{helper}</p>
      ) : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${inputClassName} ${props.className ?? ''}`}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputClassName} ${props.className ?? ''}`}
    />
  );
}

export function TextAreaInput(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`${inputClassName} min-h-32 resize-y ${props.className ?? ''}`}
    />
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: ReactNode;
}) {
  return (
    <button
      className="button-primary min-h-11 w-full disabled:cursor-not-allowed disabled:opacity-55"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Working…' : children}
    </button>
  );
}

export function FormAlert({
  message,
  success = false,
}: {
  message?: string;
  success?: boolean;
}) {
  if (!message) return null;
  return (
    <div
      className={`form-alert ${success ? 'is-success' : 'is-error'}`}
      role={success ? 'status' : 'alert'}
    >
      {message}
    </div>
  );
}
