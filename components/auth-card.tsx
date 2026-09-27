import type { ReactNode } from 'react'

/** Shared frame for the sign-in and sign-up screens. */
export function AuthCard({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string
  subtitle: string
  footer: ReactNode
  children: ReactNode
}) {
  return (
    <div className="grain relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-14">
      <div className="wash -left-20 top-10 h-72 w-72 bg-peach" />
      <div className="wash -right-10 bottom-0 h-80 w-80 bg-sky" />
      <div className="wash left-1/2 top-1/3 h-48 w-48 bg-blush" />

      <div className="rise relative w-full max-w-md">
        <div className="rounded-[2rem] border border-line bg-paper/90 p-7 shadow-card backdrop-blur sm:p-9">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
      </div>
    </div>
  )
}

export function GoogleButton({ label, from }: { label: string; from: string }) {
  return (
    <a
      href={`/api/auth/google?from=${encodeURIComponent(from)}`}
      className="flex w-full items-center justify-center gap-3 rounded-full border border-line bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink-soft/40 hover:bg-cream"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
      {label}
    </a>
  )
}

export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">or</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
