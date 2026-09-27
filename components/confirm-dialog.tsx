'use client'

import { Modal } from '@/components/modal'
import { FormError } from '@/components/form-bits'

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  busy,
  error,
  onCancel,
  onConfirm,
}: {
  title: string
  body: string
  confirmLabel: string
  busy: boolean
  error?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Modal title={title} onClose={onCancel} locked={busy} size="sm">
      <p className="text-sm leading-relaxed text-ink-soft">{body}</p>
      <FormError message={error ?? ''} />
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:bg-sand hover:text-ink disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
        >
          {busy ? 'Deleting…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
