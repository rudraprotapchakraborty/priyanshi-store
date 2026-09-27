import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export const COOKIE_NAME = 'ps-auth-token'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type Role = 'admin' | 'user'

export interface AuthPayload {
  /** The account's Mongo `_id`. */
  sub: string
  role: Role
  email?: string
  name?: string
  /** Google profile picture, carried in the token so the navbar needs no extra request. */
  avatar?: string
}

function secret(): string {
  const value = process.env.JWT_SECRET
  if (!value) throw new Error('JWT_SECRET environment variable is not set')
  return value
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: '7d' })
}

/** Verifies a session token. Anything without a subject and a known role is refused. */
export function verifyToken(token: string): AuthPayload | null {
  try {
    const raw = jwt.verify(token, secret()) as Partial<AuthPayload>
    if (!raw.sub) return null
    if (raw.role !== 'admin' && raw.role !== 'user') return null
    return { sub: raw.sub, role: raw.role, email: raw.email, name: raw.name, avatar: raw.avatar }
  } catch {
    return null
  }
}

/** Session from a route handler's request. */
export function getAuth(request: NextRequest): AuthPayload | null {
  const token = request.cookies.get(COOKIE_NAME)?.value
  return token ? verifyToken(token) : null
}

/** Session from a server component. */
export async function getSession(): Promise<AuthPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  return token ? verifyToken(token) : null
}

/**
 * Guard for admin-only API routes. Returns a response to send back when the
 * caller is not an admin, or `null` when the request may proceed.
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const auth = getAuth(request)
  if (!auth) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })
  if (auth.role !== 'admin') return NextResponse.json({ error: 'Admins only.' }, { status: 403 })
  return null
}

export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
  return response
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}

/** Same-site paths only, so redirect targets cannot be used as an open redirect. */
export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : fallback
}
