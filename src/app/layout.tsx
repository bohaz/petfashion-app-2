import type { Metadata, Viewport } from 'next'
import { Jost, Playfair_Display } from 'next/font/google'
import './globals.css'

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pet Fashion Gestión',
  description: 'Sistema de gestión Pet Fashion Dog Salon',
  applicationName: 'Pet Fashion Gestión',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Pet Fashion Gestión',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f0e0c',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${jost.variable} ${playfair.variable}`}>
      <body
        style={{
          background: 'var(--pf-bg)',
          color: 'var(--pf-cream)',
        }}
      >
        {children}
      </body>
    </html>
  )
}