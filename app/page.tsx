import Link from 'next/link'
import { ArrowRight, Hand, Leaf, Sparkles } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { listProducts } from '@/lib/products'
import { formatPrice, type Product } from '@/lib/product-types'

async function loadProducts(): Promise<Product[]> {
  try {
    return await listProducts()
  } catch (err) {
    console.error('Home page could not load products:', err)
    return []
  }
}

const NOTES = [
  {
    icon: Hand,
    title: 'Made by hand',
    body: 'Every stone is pressed and smoothed by hand, so no two are quite the same.',
  },
  {
    icon: Leaf,
    title: 'Made to slow you down',
    body: 'Little rituals — a thumb on a stone, a question on paper — that bring you back to now.',
  },
  {
    icon: Sparkles,
    title: 'Kind on your pocket',
    body: 'Thoughtful gifts for yourself or someone you love, without the fuss.',
  },
]

export default async function HomePage() {
  const products = await loadProducts()
  const featured = products.filter(p => p.featured)
  const showcase = (featured.length ? featured : products).slice(0, 4)
  const lowest = products.length ? Math.min(...products.map(p => p.price)) : null

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden">
        <div className="wash -left-24 top-10 h-72 w-72 bg-peach" />
        <div className="wash right-0 top-40 h-80 w-80 bg-sky" />
        <div className="wash bottom-0 left-1/3 h-64 w-64 bg-blush" />

        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-16 text-center sm:px-6 md:pb-28 md:pt-24">
          <div className="rise">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-walnut">
              <span className="h-1.5 w-1.5 rounded-full bg-clay" /> Handmade · Small batch
            </p>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Small things for <em className="font-normal italic text-clay">slower</em> days.
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              Worry stones to hold when your mind runs ahead, and planners that ask who you want
              to <em>be</em> — not just what you have to do.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-walnut"
              >
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              {lowest !== null && (
                <span className="text-sm text-ink-soft">
                  Everything from <strong className="text-ink">{formatPrice(lowest)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">The collection</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">Made for everyday calm</h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-clay">
            See all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {showcase.length ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {showcase.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="rounded-3xl border border-dashed border-line bg-paper p-10 text-center text-ink-soft">
            New pieces are on their way. Check back soon.
          </p>
        )}
      </section>

      {/* Story */}
      <section id="story" className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {NOTES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-3xl border border-line bg-paper p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-peach/60 via-blush/50 to-sky/60 text-walnut">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center sm:px-12">
          <div className="wash -left-10 -top-10 h-56 w-56 bg-peach opacity-30" />
          <div className="wash -bottom-16 right-0 h-56 w-56 bg-sky opacity-30" />
          <p className="relative mx-auto max-w-2xl font-display text-3xl font-medium italic leading-snug text-cream sm:text-4xl">
            “Who am I being today?”
          </p>
          <p className="relative mx-auto mt-4 max-w-md text-sm text-cream/70">
            A gentler question to start the day with. Find it printed on every To-Be List.
          </p>
          <Link
            href="/products"
            className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-peach"
          >
            Browse products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
