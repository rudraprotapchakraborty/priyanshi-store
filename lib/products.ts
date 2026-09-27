import { ObjectId, type Collection } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import type { Product, ProductInput } from '@/lib/product-types'

interface ProductDoc extends ProductInput {
  createdAt: Date
  updatedAt: Date
}

let indexReady: Promise<unknown> | null = null

async function productsCollection(): Promise<Collection<ProductDoc>> {
  const db = await getDb()
  const products = db.collection<ProductDoc>('products')
  indexReady ??= products.createIndex({ slug: 1 }, { unique: true }).catch(err => {
    indexReady = null
    throw err
  })
  await indexReady
  return products
}

function serialize(doc: ProductDoc & { _id: ObjectId }): Product {
  return {
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    tagline: doc.tagline ?? '',
    description: doc.description ?? '',
    price: doc.price,
    image: doc.image,
    inStock: doc.inStock !== false,
    featured: Boolean(doc.featured),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export async function listProducts(options: { featuredOnly?: boolean } = {}): Promise<Product[]> {
  const products = await productsCollection()
  const filter = options.featuredOnly ? { featured: true } : {}
  const docs = await products.find(filter).sort({ createdAt: 1 }).toArray()
  return docs.map(serialize)
}

/** Mongo's duplicate-key error, raised here when two products would share a slug. */
export function isDuplicateKey(err: unknown): boolean {
  return (err as { code?: number })?.code === 11000
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const products = await productsCollection()
  const now = new Date()
  const doc: ProductDoc = { ...input, createdAt: now, updatedAt: now }
  const result = await products.insertOne(doc)
  return serialize({ ...doc, _id: result.insertedId })
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product | null> {
  if (!ObjectId.isValid(id)) return null
  const products = await productsCollection()
  const doc = await products.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
  return doc ? serialize(doc) : null
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const products = await productsCollection()
  const result = await products.deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount === 1
}

export async function getProduct(id: string): Promise<Product | null> {
  if (!ObjectId.isValid(id)) return null
  const products = await productsCollection()
  const doc = await products.findOne({ _id: new ObjectId(id) })
  return doc ? serialize(doc) : null
}
