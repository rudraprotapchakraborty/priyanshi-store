import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { safeRedirectPath } from '@/lib/auth'
import { OAUTH_STATE_COOKIE, buildConsentUrl, isGoogleConfigured } from '@/lib/google-oauth'

/** Starts Google sign-in (and sign-up — a new account is created on first visit). */
export async function GET(request: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(new URL('/login?error=google_unavailable', request.nextUrl.origin))
  }

  const from = safeRedirectPath(request.nextUrl.searchParams.get('from'), '/products')

  // Google echoes the state back; the callback compares it against this cookie,
  // which is what stops another site from completing a sign-in on your behalf.
  const state = `${randomBytes(16).toString('hex')}:${Buffer.from(from).toString('base64url')}`

  const response = NextResponse.redirect(buildConsentUrl(request, state))
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })
  return response
}
