import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { NavLinks } from '@/components/nav-links'
import { AccountMenu } from '@/components/account-menu'

export async function SiteHeader() {
  const user = await getSession()

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">Priyanshi</span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-clay sm:inline">
            store
          </span>
        </Link>

        <NavLinks />

        <div className="ml-auto">
          <AccountMenu user={user} />
        </div>
      </div>
    </header>
  )
}
