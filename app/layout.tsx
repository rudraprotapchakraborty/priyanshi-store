import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

const heading = Fraunces({
  variable: '--font-heading',
  subsets: ['latin'],
  axes: ['SOFT', 'opsz'],
})

const body = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Priyanshi — small things for slower days',
    template: '%s · Priyanshi',
  },
  description: 'Handmade worry stones, mindful planners and little objects that help you slow down.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
