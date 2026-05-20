import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Header from '@/components/Header'
import { ToastProvider } from '@/hooks/use-toast'
import ReduxProvider from '@/providers/ReduxProvider'
import AuthInitializer from '@/components/AuthInitializer'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Tech Saksham',
  description: 'Register as a citizen, receive your ID card, and participate in community questions and discussions.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/logos/tech-saksham.png', sizes: '32x32', type: 'image/png' },
      { url: '/logos/tech-saksham.png', sizes: '64x64', type: 'image/png' },
      { url: '/logos/tech-saksham.png', sizes: '128x128', type: 'image/png' },
      { url: '/logos/tech-saksham.png', sizes: '192x192', type: 'image/png' },
      { url: '/logos/tech-saksham.png', sizes: '256x256', type: 'image/png' },
      { url: '/logos/tech-saksham.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logos/tech-saksham.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReduxProvider>
          <AuthInitializer/>
        <ToastProvider>
          <Header />
          {children}
          <Analytics />
        </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
