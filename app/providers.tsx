'use client'

import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { SOLANA_RPC_ENDPOINT, SOLANA_COMMITMENT } from '../lib/constants'

/**
 * Application-level providers.
 *
 * Wraps the app with:
 * - Solana ConnectionProvider (Devnet)
 * - WalletProvider (Phantom, Solflare)
 * - WalletModalProvider for the connection modal
 */
export function Providers({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT} config={{ commitment: SOLANA_COMMITMENT }}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
