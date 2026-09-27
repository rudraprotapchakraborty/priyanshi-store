import type { ReactNode } from 'react'
import { MessageCircle } from 'lucide-react'
import { formatPrice, type Product } from '@/lib/product-types'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') || ''

function orderLink(product: Product): string {
  const text = `Hi! I'd like to order the ${product.name} (${formatPrice(product.price)}).`
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
}

export function ProductCard({
  product,
  adminActions,
  showDescription = false,
}: {
  product: Product
  /** Edit / delete controls, rendered over the photo for admins. */
  adminActions?: ReactNode
  showDescription?: boolean
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-paper shadow-card transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {/* Plain img: product photos may live on any https host an admin links to. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-xs font-semibold text-cream">
            Sold out
          </span>
        )}
        {adminActions && <div className="absolute right-3 top-3 flex gap-2">{adminActions}</div>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">{product.name}</h3>
          <p className="shrink-0 rounded-full bg-peach/35 px-3 py-1 text-sm font-bold text-walnut">
            {formatPrice(product.price)}
          </p>
        </div>
        {product.tagline && <p className="text-sm font-medium text-clay">{product.tagline}</p>}
        {showDescription && product.description && (
          <p className="text-sm leading-relaxed text-ink-soft">{product.description}</p>
        )}

        {WHATSAPP && product.inStock && (
          <a
            href={orderLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-2 self-start rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-walnut"
          >
            <MessageCircle className="h-4 w-4" /> Order on WhatsApp
          </a>
        )}
      </div>
    </article>
  )
}
