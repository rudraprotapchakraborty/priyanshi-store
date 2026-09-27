import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession, safeRedirectPath } from '@/lib/auth'
import { authErrorMessage } from '@/lib/auth-messages'
import { AuthCard, GoogleButton, OrDivider } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams
  const from = safeRedirectPath(typeof params.from === 'string' ? params.from : null, '/products')

  if (await getSession()) redirect(from)

  const registerHref = from === '/products' ? '/register' : `/register?from=${encodeURIComponent(from)}`

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your Priyanshi account."
      footer={
        <>
          New here?{' '}
          <Link href={registerHref} className="font-semibold text-clay hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <GoogleButton label="Continue with Google" from={from} />
      <OrDivider />
      <AuthForm mode="login" from={from} initialError={authErrorMessage(params.error)} />
    </AuthCard>
  )
}
