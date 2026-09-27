// Seeds the two launch products. Safe to re-run: products are matched by slug,
// so running it again refreshes them instead of creating duplicates.
//
//   npm run seed

import { MongoClient } from 'mongodb'

try {
  process.loadEnvFile('.env.local')
} catch {
  // Fall back to variables already in the environment (e.g. on a CI box).
}

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Add it to .env.local first.')
  process.exit(1)
}

const products = [
  {
    name: 'Worry Stone',
    slug: 'worry-stone',
    tagline: 'A calm little stone for restless thumbs.',
    description:
      'Hand-shaped from smooth clay with a soft thumb-sized dip in the middle. Keep it in your pocket or on your desk and rub it whenever your mind starts racing — a tiny, quiet ritual to bring you back to the moment. Every stone is shaped by hand, so each one is a little different.',
    price: 299,
    image: '/products/worry-stone.webp',
    inStock: true,
    featured: true,
  },
  {
    name: 'To-Be List',
    slug: 'to-be-list',
    tagline: 'Not what to do — who to be today.',
    description:
      'A daily planner sheet that starts with a gentler question: who am I being today? Space for a daily affirmation, gratitude, your tasks and notes, printed on thick paper with a dreamy pastel wash. Pin it to your wall or keep it on your desk to start each day with intention.',
    price: 299,
    image: '/products/to-be-list.webp',
    inStock: true,
    featured: true,
  },
]

const client = new MongoClient(uri)
try {
  await client.connect()
  const db = client.db(process.env.MONGODB_DB || 'priyanshi-store')
  const collection = db.collection('products')
  await collection.createIndex({ slug: 1 }, { unique: true })

  const now = new Date()
  for (const product of products) {
    await collection.updateOne(
      { slug: product.slug },
      { $set: { ...product, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    )
    console.log(`✓ ${product.name} — ₹${product.price}`)
  }
  console.log(`Seeded ${products.length} products into "${db.databaseName}".`)
} finally {
  await client.close()
}
