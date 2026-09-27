/**
 * Product photos are hosted on ImgBB. The admin form shrinks each photo in the
 * browser first, the upload route checks it, and this module sends it on. The
 * API key is read here, on the server, and never reaches the browser.
 */

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024

/** No SVG: it can carry script, and product photos never need it. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

export class ImgbbError extends Error {
  /** The status to send back: 500 when we are misconfigured, 502 when ImgBB refused. */
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ImgbbError'
    this.status = status
  }
}

/**
 * Uploads an image and returns its hosted URL. Sent as a multipart file rather
 * than a base64 field — ImgBB refuses base64 uploads from this account with
 * "You have been forbidden to use this website" (code 103).
 */
export async function uploadToImgbb(bytes: Buffer, contentType: string, name = 'product'): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) throw new ImgbbError('Image upload is not configured. Add IMGBB_API_KEY to .env.local.', 500)

  const body = new FormData()
  body.append('key', apiKey)
  body.append('image', new Blob([new Uint8Array(bytes)], { type: contentType }), name.slice(0, 80))

  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body })
  const data = await res.json().catch(() => null)
  const url: string | undefined = data?.data?.url

  if (!res.ok || !url) {
    throw new ImgbbError(data?.error?.message || 'The image host rejected the upload.', 502)
  }
  return url
}
