'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import { ProductForm } from '@/components/product-form'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Product } from '@/lib/product-types'

/**
 * The product grid. Shoppers see the cards; admins also get add / edit / delete,
 * applied optimistically to local state and then refreshed from the server so
 * the home page picks up the change too.
 */
export function ProductsManager({ initialProducts, isAdmin }: { initialProducts: Product[]; isAdmin: boolean }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function handleSaved(saved: Product) {
    setProducts(list => {
      const exists = list.some(p => p._id === saved._id)
      return exists ? list.map(p => (p._id === saved._id ? saved : p)) : [...list, saved]
    })
    setEditing(null)
    router.refresh()
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/products/${deleting._id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not delete the product.')
      setProducts(list => list.filter(p => p._id !== deleting._id))
      setDeleting(null)
      router.refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete the product.')
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <>
      {isAdmin && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-peach/60 bg-peach/15 px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-walnut">
            <ShieldCheck className="h-4 w-4" /> Admin mode — you can add, edit and delete products.
          </p>
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
          >
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>
      )}

      {products.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              showDescription
              adminActions={
                isAdmin ? (
                  <>
                    <IconButton label={`Edit ${product.name}`} onClick={() => setEditing(product)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                      label={`Delete ${product.name}`}
                      onClick={() => {
                        setDeleteError('')
                        setDeleting(product)
                      }}
                      danger
                    >
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </>
                ) : undefined
              }
            />
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-line bg-paper p-10 text-center text-ink-soft">
          {isAdmin ? 'No products yet. Add your first one above.' : 'New pieces are on their way. Check back soon.'}
        </p>
      )}

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete “${deleting.name}”?`}
          body="This removes the product from the store for everyone. It cannot be undone."
          confirmLabel="Delete product"
          busy={deleteBusy}
          error={deleteError}
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-paper/95 shadow-card backdrop-blur transition-colors ${
        danger ? 'text-red-700 hover:bg-red-50' : 'text-ink hover:bg-sand'
      }`}
    >
      {children}
    </button>
  )
}
