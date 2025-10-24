import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/QueryProvider'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BidPerfect - AI-Powered Government Contracting Platform',
  description: 'Streamline your government contracting process with AI-powered tools for RFP analysis, proposal generation, and compliance management.',
  keywords: ['government contracting', 'RFP', 'AI', 'proposals', 'compliance'],
  authors: [{ name: 'BidPerfect Team' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body 
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <QueryProvider>
            <div className="relative min-h-screen">
              {children}
            </div>
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
