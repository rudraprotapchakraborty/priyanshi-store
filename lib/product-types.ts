/**
 * Product shape and input validation shared by the API routes and the admin
 * form. Kept free of `mongodb` imports so client components can use it.
 */

export interface Product {
  _id: string
  name: string
  slug: string
  tagline: string
  description: string
  /** Whole rupees. */
  price: number
  image: string
  inStock: boolean
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  name: string
  slug: string
  tagline: string
  description: string
  price: number
  image: string
  inStock: boolean
  featured: boolean
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/**
 * Builds a product from a request body. An allow-list, so a caller cannot set
 * `_id` or timestamps by including them in the JSON.
 */
export function sanitizeProductInput(raw: unknown): ProductInput {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const name = str(data.name, 120)
  const price = Number(data.price)

  return {
    name,
    slug: slugify(str(data.slug, 120) || name),
    tagline: str(data.tagline, 160),
    description: str(data.description, 4000),
    price: Number.isFinite(price) ? Math.round(price) : NaN,
    image: str(data.image, 2000),
    inStock: data.inStock !== false,
    featured: data.featured === true,
  }
}

export function validateProductInput(input: ProductInput): string | null {
  if (!input.name) return 'Name is required.'
  if (!input.slug) return 'Name must contain at least one letter or number.'
  if (!Number.isFinite(input.price) || input.price < 0) return 'Price must be a positive number.'
  if (input.price > 10_000_000) return 'Price is too large.'
  if (!input.image) return 'An image is required.'
  if (!input.image.startsWith('/') && !/^https:\/\//i.test(input.image)) {
    return 'Image must be an uploaded image or an https:// link.'
  }
  return null
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

export function formatPrice(rupees: number): string {
  return inr.format(rupees)
}
