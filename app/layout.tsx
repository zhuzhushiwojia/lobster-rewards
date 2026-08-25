import type { Metadata } from 'next'
import { Providers } from './providers'
import '@solana/wallet-adapter-react-ui/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lobster Rewards - Earn Crypto on Solana',
  description: 'Complete tasks, refer friends, and earn DeAura tokens on Solana Devnet',
  keywords: ['solana', 'rewards', 'orca', 'swap', 'devnet', 'lobster'],
  openGraph: {
    title: 'Lobster Rewards',
    description: 'Earn Crypto Rewards on Solana',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-950 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
