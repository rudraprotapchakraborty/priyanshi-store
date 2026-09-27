import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { setSessionCookie, signToken } from '@/lib/auth'
import { findUserByEmail, recordLogin, toAuthPayload } from '@/lib/users'

/** Email + password sign-in. */
export async function POST(request: NextRequest) {
  try {
    const { email = '', password = '' } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const user = await findUserByEmail(String(email))

    // Accounts created through Google have no password to compare against.
    if (user && !user.password) {
      return NextResponse.json(
        { error: 'This account uses Google. Please use "Continue with Google".' },
        { status: 400 },
      )
    }

    if (!user || !(await bcrypt.compare(String(password), user.password as string))) {
      return NextResponse.json({ error: 'Wrong email or password.' }, { status: 401 })
    }

    const payload = toAuthPayload(await recordLogin(user))
    return setSessionCookie(NextResponse.json({ success: true, user: payload }), signToken(payload))
  } catch (err) {
    console.error('Login failed:', err)
    return NextResponse.json({ error: 'Could not sign in. Please try again.' }, { status: 500 })
  }
}
