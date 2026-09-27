import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession, safeRedirectPath } from '@/lib/auth'
import { AuthCard, GoogleButton, OrDivider } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'

export const metadata: Metadata = { title: 'Create account' }

export default async function RegisterPage({ searchParams }: PageProps<'/register'>) {
  const params = await searchParams
  const from = safeRedirectPath(typeof params.from === 'string' ? params.from : null, '/products')

  if (await getSession()) redirect(from)

  const loginHref = from === '/products' ? '/login' : `/login?from=${encodeURIComponent(from)}`

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up in seconds with Google or your email."
      footer={
        <>
          Already have an account?{' '}
          <Link href={loginHref} className="font-semibold text-clay hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton label="Sign up with Google" from={from} />
      <OrDivider />
      <AuthForm mode="register" from={from} />
    </AuthCard>
  )
}
