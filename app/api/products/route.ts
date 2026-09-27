import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { createProduct, isDuplicateKey, listProducts } from '@/lib/products'
import { sanitizeProductInput, validateProductInput } from '@/lib/product-types'

export async function GET() {
  try {
    return NextResponse.json({ products: await listProducts() })
  } catch (err) {
    console.error('Listing products failed:', err)
    return NextResponse.json({ error: 'Could not load products.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request)
  if (denied) return denied

  const input = sanitizeProductInput(await request.json().catch(() => null))
  const invalid = validateProductInput(input)
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

  try {
    return NextResponse.json({ product: await createProduct(input) }, { status: 201 })
  } catch (err) {
    if (isDuplicateKey(err)) {
      return NextResponse.json({ error: 'A product with that name already exists.' }, { status: 409 })
    }
    console.error('Creating product failed:', err)
    return NextResponse.json({ error: 'Could not save the product.' }, { status: 500 })
  }
}
