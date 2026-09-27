import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-sand/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-display text-xl font-semibold text-ink">Priyanshi</p>
          <p className="mt-1 max-w-xs text-sm text-ink-soft">
            Small, handmade things for slower, kinder days.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-ink-soft sm:items-end">
          <nav className="flex gap-4">
            <Link href="/" className="hover:text-ink">Home</Link>
            <Link href="/products" className="hover:text-ink">Products</Link>
          </nav>
          <p>© {new Date().getFullYear()} Priyanshi. Made with care in India.</p>
        </div>
      </div>
    </footer>
  )
}
