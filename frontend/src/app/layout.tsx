import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Medicare Part D Drug Spending Explorer',
  description: 'Explore Medicare Part D prescription drug spending data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[var(--color-background)]`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
