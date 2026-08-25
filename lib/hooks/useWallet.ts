import { useCallback, useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { SOLANA_NETWORK } from '../constants'

export type WalletStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'wrong-network'
  | 'error'

export interface UseWalletReturn {
  status: WalletStatus
  address: string | null
  shortAddress: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  errorMessage: string | null
  clearError: () => void
}

/**
 * Wrapper around Solana wallet adapter that adds:
 * - Network validation (enforces Devnet)
 * - Short address formatting
 * - Connection error handling
 * - Status tracking for UI rendering
 */
export function useWalletState(): UseWalletReturn {
  const { connection } = useConnection()
  const { publicKey, connected, connecting, connect: adapterConnect, disconnect: adapterDisconnect, wallet } = useWallet()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<WalletStatus>('disconnected')

  // Validate the current network matches Devnet
  useEffect(() => {
    if (!connected || !publicKey) {
      setStatus('disconnected')
      return
    }
    // Check if we are on the correct network by querying the endpoint
    const checkNetwork = async () => {
      try {
        const endpoint = connection.rpcEndpoint
        if (!endpoint.includes(SOLANA_NETWORK) && !endpoint.includes('devnet')) {
          setStatus('wrong-network')
          setErrorMessage(
            `Wrong network detected. Please switch to ${SOLANA_NETWORK}. Current: ${endpoint}`
          )
          return
        }
        setStatus('connected')
        setErrorMessage(null)
      } catch {
        setStatus('error')
        setErrorMessage('Failed to verify network. Please reconnect.')
      }
    }
    checkNetwork()
  }, [connected, publicKey, connection])

  const connect = useCallback(async (): Promise<void> => {
    setErrorMessage(null)
    setStatus('connecting')
    try {
      if (!wallet) {
        throw new Error('No wallet selected. Please install a Solana wallet extension like Phantom or Solflare.')
      }
      await adapterConnect()
      setStatus('connected')
    } catch (err) {
      setStatus('error')
      const message = err instanceof Error ? err.message : 'Failed to connect wallet'
      setErrorMessage(message)
    }
  }, [adapterConnect, wallet])

  const disconnect = useCallback(async (): Promise<void> => {
    setErrorMessage(null)
    try {
      await adapterDisconnect()
    } catch {
      // Ignore disconnect errors
    } finally {
      setStatus('disconnected')
    }
  }, [adapterDisconnect])

  const clearError = useCallback((): void => {
    setErrorMessage(null)
    if (status === 'error') {
      setStatus('disconnected')
    }
  }, [status])

  const address = publicKey ? publicKey.toBase58() : null
  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : null

  return {
    status,
    address,
    shortAddress,
    connect,
    disconnect,
    errorMessage,
    clearError,
  }
}
