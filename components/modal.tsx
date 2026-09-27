'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Centered dialog with a dimmed backdrop. Escape and backdrop clicks close it unless `locked`. */
export function Modal({
  title,
  onClose,
  locked = false,
  size = 'md',
  children,
}: {
  title: string
  onClose: () => void
  /** Blocks closing, e.g. while a save is in flight. */
  locked?: boolean
  size?: 'sm' | 'md'
  children: ReactNode
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !locked) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [locked, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !locked) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`rise max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-paper shadow-card sm:rounded-3xl ${
          size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-2xl'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-5 py-4 sm:px-6">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sand hover:text-ink disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
