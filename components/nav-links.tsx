'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="ml-2 flex items-center gap-1 sm:ml-6">
      {LINKS.map(link => {
        const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active ? 'bg-ink text-cream' : 'text-ink-soft hover:bg-sand hover:text-ink'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
