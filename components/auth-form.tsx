'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Field, FormError, PasswordInput, SubmitButton, TextInput } from '@/components/form-bits'

/** Email + password form for both sign-in and sign-up. */
export function AuthForm({ mode, from, initialError = '' }: { mode: 'login' | 'register'; from: string; initialError?: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(initialError)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'register' ? { name, email, password } : { email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      router.push(from)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === 'register' && (
        <Field label="Your name">
          {id => <TextInput id={id} value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={80} />}
        </Field>
      )}
      <Field label="Email">
        {id => (
          <TextInput
            id={id}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        )}
      </Field>
      <Field label="Password" hint={mode === 'register' ? 'At least 8 characters, with a letter and a number.' : undefined}>
        {id => (
          <PasswordInput
            id={id}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />
        )}
      </Field>
      <FormError message={error} />
      <div className="mt-2">
        <SubmitButton
          busy={busy}
          label={mode === 'register' ? 'Create account' : 'Sign in'}
          busyLabel={mode === 'register' ? 'Creating account…' : 'Signing in…'}
        />
      </div>
    </form>
  )
}
