import { ObjectId, type Collection, type WithId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import type { AuthPayload, Role } from '@/lib/auth'

export type AuthProvider = 'password' | 'google'

export interface UserDoc {
  /** Lowercased, trimmed — the unique key for an account. */
  email: string
  name: string
  password?: string
  role: Role
  providers: AuthProvider[]
  googleId?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

let indexReady: Promise<unknown> | null = null

export async function usersCollection(): Promise<Collection<UserDoc>> {
  const db = await getDb()
  const users = db.collection<UserDoc>('users')
  indexReady ??= users.createIndex({ email: 1 }, { unique: true }).catch(err => {
    indexReady = null
    throw err
  })
  await indexReady
  return users
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normaliseEmail(email))
}

/** Returns an error message when the password is too weak, or null when it passes. */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters.'
  if (password.length > 200) return 'Password is too long.'
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number.'
  }
  return null
}

export async function findUserByEmail(email: string): Promise<WithId<UserDoc> | null> {
  const users = await usersCollection()
  return users.findOne({ email: normaliseEmail(email) })
}

export function toAuthPayload(user: WithId<UserDoc>): AuthPayload {
  return {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
    name: user.name || user.email,
    avatar: user.avatar,
  }
}

/** Records the sign-in time. */
export async function recordLogin(user: WithId<UserDoc>): Promise<WithId<UserDoc>> {
  const users = await usersCollection()
  const now = new Date()
  await users.updateOne({ _id: user._id }, { $set: { lastLoginAt: now } })
  return { ...user, lastLoginAt: now }
}

/**
 * The account's current role, read from the database rather than the session
 * token, so promoting or demoting someone in MongoDB applies on their next
 * request. Returns null when the account no longer exists.
 */
export async function findRole(id: string): Promise<Role | null> {
  if (!ObjectId.isValid(id)) return null
  const users = await usersCollection()
  const doc = await users.findOne({ _id: new ObjectId(id) }, { projection: { role: 1 } })
  if (!doc) return null
  return doc.role === 'admin' ? 'admin' : 'user'
}

export async function createPasswordUser(input: {
  email: string
  name: string
  passwordHash: string
}): Promise<WithId<UserDoc>> {
  const users = await usersCollection()
  const email = normaliseEmail(input.email)
  const now = new Date()
  const doc: UserDoc = {
    email,
    name: input.name.trim() || email.split('@')[0],
    password: input.passwordHash,
    role: 'user',
    providers: ['password'],
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }
  const result = await users.insertOne(doc)
  return { ...doc, _id: result.insertedId }
}

/**
 * Signs in (or creates) the account behind a verified Google profile. When the
 * email already has a password account, Google is linked to it rather than
 * creating a duplicate — Google has verified the same address.
 */
export async function upsertGoogleUser(profile: {
  googleId: string
  email: string
  name?: string
  picture?: string
}): Promise<WithId<UserDoc>> {
  const users = await usersCollection()
  const email = normaliseEmail(profile.email)
  const now = new Date()

  const existing = await users.findOne({ email })
  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      {
        $set: {
          googleId: profile.googleId,
          avatar: profile.picture || existing.avatar,
          name: existing.name || profile.name || email.split('@')[0],
          updatedAt: now,
          lastLoginAt: now,
        },
        $addToSet: { providers: 'google' },
      },
    )
    return (await users.findOne({ _id: existing._id })) as WithId<UserDoc>
  }

  const doc: UserDoc = {
    email,
    name: profile.name || email.split('@')[0],
    role: 'user',
    providers: ['google'],
    googleId: profile.googleId,
    avatar: profile.picture,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  }
  const result = await users.insertOne(doc)
  return { ...doc, _id: result.insertedId }
}
