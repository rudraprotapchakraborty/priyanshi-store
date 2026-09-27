import { NextRequest, NextResponse } from 'next/server'
import { getImage } from '@/lib/images'

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/images/[id]'>) {
  const { id } = await ctx.params
  const image = await getImage(id)
  if (!image) return new NextResponse('Not found', { status: 404 })

  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      'Content-Type': image.contentType,
      // An id never points at different bytes, so the image can be cached for good.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
