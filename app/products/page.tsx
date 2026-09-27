import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { listProducts } from '@/lib/products'
import type { Product } from '@/lib/product-types'
import { ProductsManager } from '@/components/products-manager'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Handmade worry stones and mindful To-Be List planners.',
}

export default async function ProductsPage() {
  const session = await getSession()

  let products: Product[] = []
  let loadError = false
  try {
    products = await listProducts()
  } catch (err) {
    console.error('Products page could not load products:', err)
    loadError = true
  }

  return (
    <div className="relative">
      <div className="grain relative overflow-hidden border-b border-line">
        <div className="wash -right-20 -top-24 h-72 w-72 bg-sky" />
        <div className="wash -left-16 top-8 h-56 w-56 bg-peach" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Shop</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            All products
          </h1>
          <p className="mt-3 max-w-lg text-ink-soft">
            Everything is made in small batches. If something is sold out, it usually comes back soon.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        {loadError ? (
          <p className="rounded-3xl border border-dashed border-line bg-paper p-10 text-center text-ink-soft">
            We could not load the products right now. Please refresh in a moment.
          </p>
        ) : (
          <ProductsManager initialProducts={products} isAdmin={session?.role === 'admin'} />
        )}
      </div>
    </div>
  )
}
