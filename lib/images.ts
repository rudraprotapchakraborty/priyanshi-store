import { Binary, ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

/**
 * Product photos uploaded by an admin are stored in MongoDB and served from
 * `/api/images/:id`, so the store needs no third-party image host and works the
 * same on any deployment. The admin form shrinks photos in the browser first,
 * which keeps each one far below Mongo's 16 MB document limit.
 */

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024

/** No SVG: it can carry script, and product photos never need it. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

interface ImageDoc {
  data: Binary
  contentType: string
  size: number
  createdAt: Date
}

export async function saveImage(bytes: Buffer, contentType: string): Promise<string> {
  const db = await getDb()
  const result = await db.collection<ImageDoc>('images').insertOne({
    data: new Binary(bytes),
    contentType,
    size: bytes.length,
    createdAt: new Date(),
  })
  return `/api/images/${result.insertedId.toString()}`
}

export async function getImage(id: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!ObjectId.isValid(id)) return null
  const db = await getDb()
  const doc = await db.collection<ImageDoc>('images').findOne({ _id: new ObjectId(id) })
  if (!doc) return null
  return { bytes: Buffer.from(doc.data.buffer), contentType: doc.contentType }
}

const IMAGE_URL = /^\/api\/images\/([a-f0-9]{24})$/

/**
 * Removes an uploaded image once no product points at it any more, so replaced
 * and deleted product photos do not pile up in the database.
 */
export async function deleteImageIfUnused(url: string | undefined): Promise<void> {
  const id = url?.match(IMAGE_URL)?.[1]
  if (!id) return
  const db = await getDb()
  const stillUsed = await db.collection('products').countDocuments({ image: url }, { limit: 1 })
  if (!stillUsed) await db.collection('images').deleteOne({ _id: new ObjectId(id) })
}
