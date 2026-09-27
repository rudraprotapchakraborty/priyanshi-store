'use client'

import { useRef, useState, type FormEvent } from 'react'
import { ImagePlus, Link2 } from 'lucide-react'
import { Modal } from '@/components/modal'
import { Field, FormError, TextArea, TextInput } from '@/components/form-bits'
import type { Product } from '@/lib/product-types'

const MAX_EDGE = 1600

/**
 * Shrinks a photo in the browser before upload. Phone photos are often 5–10 MB;
 * a 1600px WebP is a few hundred KB and still looks sharp on the product card.
 */
async function shrinkImage(file: File): Promise<Blob> {
  if (file.type === 'image/gif') return file // re-encoding would drop the animation
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.86))
  return blob ?? file
}

export function ProductForm({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null
  onClose: () => void
  onSaved: (product: Product) => void
}) {
  const [name, setName] = useState(product?.name ?? '')
  const [tagline, setTagline] = useState(product?.tagline ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '299')
  const [image, setImage] = useState(product?.image ?? '')
  const [inStock, setInStock] = useState(product?.inStock ?? true)
  const [featured, setFeatured] = useState(product?.featured ?? true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showUrl, setShowUrl] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const busy = uploading || saving

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const blob = await shrinkImage(file)
      const body = new FormData()
      body.append('file', blob, file.name)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Upload failed.')
      setImage(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(product ? `/api/products/${product._id}` : '/api/products', {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tagline, description, price: Number(price), image, inStock, featured }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not save the product.')
      onSaved(data.product)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={product ? `Edit ${product.name}` : 'Add a product'} onClose={onClose} locked={busy}>
      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-[220px_1fr]">
        {/* Photo */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-soft">Photo</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-cream text-ink-soft transition-colors hover:border-clay hover:text-clay disabled:cursor-wait sm:aspect-square"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm font-medium">
                <ImagePlus className="h-6 w-6" /> Upload photo
              </span>
            )}
            {uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-paper/80 text-sm font-medium text-ink">
                Uploading…
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            {image && (
              <button type="button" onClick={() => fileRef.current?.click()} className="font-semibold text-clay hover:underline" disabled={busy}>
                Replace
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowUrl(v => !v)}
              className="inline-flex items-center gap-1 text-ink-soft hover:text-ink"
            >
              <Link2 className="h-3 w-3" /> {showUrl ? 'Hide link' : 'Use a link'}
            </button>
          </div>
          {showUrl && (
            <TextInput
              className="mt-2"
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="https://…"
              aria-label="Image link"
            />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <Field label="Name">
            {id => <TextInput id={id} value={name} onChange={e => setName(e.target.value)} required maxLength={120} />}
          </Field>
          <Field label="Tagline" hint="One short line shown under the name.">
            {id => <TextInput id={id} value={tagline} onChange={e => setTagline(e.target.value)} maxLength={160} />}
          </Field>
          <Field label="Price (₹)">
            {id => (
              <TextInput
                id={id}
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            )}
          </Field>
          <Field label="Description">
            {id => <TextArea id={id} value={description} onChange={e => setDescription(e.target.value)} maxLength={4000} />}
          </Field>
          <div className="flex flex-wrap gap-5">
            <Toggle label="In stock" checked={inStock} onChange={setInStock} />
            <Toggle label="Show on home page" checked={featured} onChange={setFeatured} />
          </div>
        </div>

        <div className="sm:col-span-2">
          <FormError message={error} />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-sand hover:text-ink disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-walnut disabled:opacity-60"
            >
              {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="peer sr-only" />
      <span className="relative h-5 w-9 rounded-full bg-line transition-colors peer-checked:bg-clay peer-focus-visible:ring-2 peer-focus-visible:ring-clay/30 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
      {label}
    </label>
  )
}
