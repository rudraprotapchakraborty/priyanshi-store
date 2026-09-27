import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { setSessionCookie, signToken } from '@/lib/auth'
import { isDuplicateKey } from '@/lib/products'
import {
  createPasswordUser,
  findUserByEmail,
  isValidEmail,
  toAuthPayload,
  validatePassword,
} from '@/lib/users'

/** Creates an email + password account and signs it in. */
export async function POST(request: NextRequest) {
  try {
    const { name = '', email = '', password = '' } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }
    if (!isValidEmail(String(email))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    const weak = validatePassword(password)
    if (weak) return NextResponse.json({ error: weak }, { status: 400 })

    const taken = { error: 'An account with that email already exists. Try signing in.' }
    if (await findUserByEmail(String(email))) return NextResponse.json(taken, { status: 409 })

    let user
    try {
      user = await createPasswordUser({
        email: String(email),
        name: String(name).slice(0, 80),
        passwordHash: await bcrypt.hash(String(password), 10),
      })
    } catch (err) {
      // Two sign-ups for the same email raced past the check above.
      if (isDuplicateKey(err)) return NextResponse.json(taken, { status: 409 })
      throw err
    }

    const payload = toAuthPayload(user)
    return setSessionCookie(NextResponse.json({ success: true, user: payload }), signToken(payload))
  } catch (err) {
    console.error('Registration failed:', err)
    return NextResponse.json({ error: 'Could not create your account. Please try again.' }, { status: 500 })
  }
}
