import { MongoClient, type Db } from 'mongodb'

const globalForMongo = globalThis as unknown as { _mongoClientPromise?: Promise<MongoClient> }

let clientPromise: Promise<MongoClient> | null = null

function getClientPromise(): Promise<MongoClient> {
  if (clientPromise) return clientPromise

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI environment variable is not set')

  // In dev, hot reloads re-evaluate this module; keep one client on the global
  // so every reload does not open a fresh connection pool.
  if (process.env.NODE_ENV === 'development') {
    globalForMongo._mongoClientPromise ??= new MongoClient(uri).connect()
    clientPromise = globalForMongo._mongoClientPromise
  } else {
    clientPromise = new MongoClient(uri).connect()
  }

  // A failed connect should not be cached forever — let the next request retry.
  clientPromise.catch(() => {
    clientPromise = null
    globalForMongo._mongoClientPromise = undefined
  })

  return clientPromise
}

/** The store's database. The URI carries no database name, so it is named here. */
export async function getDb(): Promise<Db> {
  const client = await getClientPromise()
  return client.db(process.env.MONGODB_DB || 'priyanshi-store')
}
