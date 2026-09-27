import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, saveImage } from '@/lib/images'

/** Admin image upload (multipart, field `file`). Returns the URL to store on the product. */
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image was sent.' }, { status: 400 })

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPG, PNG, WebP, AVIF or GIF image.' }, { status: 400 })
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Image is too large (max 4 MB).' }, { status: 413 })
  }

  try {
    const url = await saveImage(Buffer.from(await file.arrayBuffer()), file.type)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Image upload failed:', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
