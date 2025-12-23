import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import GlobalNavbar from '@/components/GlobalNavbar'
import { Providers } from './providers'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Rishab Acharjee | AI Engineer & Full-Stack Developer',
  description: 'Final Year CSE student at NIT Durgapur. AI Engineer, Data Engineer, and Full-Stack Developer. Building intelligent systems at scale. Ex-BOSCH, Ex-Infinity Analytics.',
  keywords: ['Rishab Acharjee', 'Software Engineer', 'Data Engineer', 'Full Stack Developer', 'NIT Durgapur', 'Machine Learning', 'React', 'Next.js', 'Python'],
  authors: [{ name: 'Rishab Acharjee' }],
  openGraph: {
    title: 'Rishab Acharjee | AI Engineer & Full-Stack Developer',
    description: 'Building intelligent systems at scale. AI Engineer, Data Engineer, and Full-Stack Developer.',
    url: 'https://rishabacharjee.dev',
    siteName: 'Rishab Acharjee Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rishab Acharjee - AI Engineer & Full-Stack Developer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rishab Acharjee | AI Engineer & Full-Stack Developer',
    description: 'Building intelligent systems at scale. AI Engineer, Data Engineer, and Full-Stack Developer.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-slate-950 text-white min-h-screen">
        <Providers>
          <GlobalNavbar />
          <main className="pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}