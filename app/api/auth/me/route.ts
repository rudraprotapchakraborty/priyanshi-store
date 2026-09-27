import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getAuth(request)
  return NextResponse.json(user ? { authenticated: true, user } : { authenticated: false })
}
