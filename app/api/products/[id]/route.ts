import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { deleteImageIfUnused } from '@/lib/images'
import { deleteProduct, getProduct, isDuplicateKey, updateProduct } from '@/lib/products'
import { sanitizeProductInput, validateProductInput } from '@/lib/product-types'

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const { id } = await ctx.params
  const product = await getProduct(id)
  if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(request: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await ctx.params
  const input = sanitizeProductInput(await request.json().catch(() => null))
  const invalid = validateProductInput(input)
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

  try {
    const before = await getProduct(id)
    const product = await updateProduct(id, input)
    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    if (before && before.image !== product.image) await deleteImageIfUnused(before.image)
    return NextResponse.json({ product })
  } catch (err) {
    if (isDuplicateKey(err)) {
      return NextResponse.json({ error: 'A product with that name already exists.' }, { status: 409 })
    }
    console.error('Updating product failed:', err)
    return NextResponse.json({ error: 'Could not save the product.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
  const denied = requireAdmin(request)
  if (denied) return denied

  const { id } = await ctx.params
  try {
    const before = await getProduct(id)
    if (!(await deleteProduct(id))) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 })
    }
    await deleteImageIfUnused(before?.image)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Deleting product failed:', err)
    return NextResponse.json({ error: 'Could not delete the product.' }, { status: 500 })
  }
}
