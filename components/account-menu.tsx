'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, ShieldCheck, UserRound } from 'lucide-react'
import type { AuthPayload } from '@/lib/auth'

export function AccountMenu({ user }: { user: AuthPayload | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:inline-block"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
        >
          <span className="sm:hidden">Sign in</span>
          <span className="hidden sm:inline">Create account</span>
        </Link>
      </div>
    )
  }

  async function logout() {
    setBusy(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setOpen(false)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-3 text-sm font-medium text-ink transition-colors hover:border-ink-soft/40"
      >
        <Avatar user={user} />
        <span className="hidden max-w-[9rem] truncate sm:inline">{user.name?.split(' ')[0] || 'Account'}</span>
        {user.role === 'admin' && <ShieldCheck className="h-4 w-4 text-clay" aria-label="Admin" />}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] w-60 rounded-2xl border border-line bg-paper p-1.5 shadow-card"
        >
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">{user.name || user.email}</p>
            {user.email && <p className="truncate text-xs text-ink-soft">{user.email}</p>}
            {user.role === 'admin' && (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-peach/40 px-2 py-0.5 text-[11px] font-semibold text-walnut">
                <ShieldCheck className="h-3 w-3" /> Admin
              </p>
            )}
          </div>
          {user.role === 'admin' && (
            <Link
              href="/products"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-sand hover:text-ink"
            >
              <UserRound className="h-4 w-4" /> Manage products
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            disabled={busy}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-sand hover:text-ink disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" /> {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}

function Avatar({ user }: { user: AuthPayload }) {
  const [failed, setFailed] = useState(false)
  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase()

  if (user.avatar && !failed) {
    return (
      // Plain img: Google's avatar host would otherwise need allow-listing for next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-7 w-7 rounded-full object-cover"
      />
    )
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-peach to-blush text-xs font-bold text-walnut">
      {initial}
    </span>
  )
}
