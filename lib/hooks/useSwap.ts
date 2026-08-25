import { useCallback, useRef, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { OrcaWhirlpoolClient, WhirlpoolContext, buildTx,
  swapQuoteByQuery } from '@orca-so/whirlpools-sdk'
import { AnchorProvider } from '@coral-xyz/anchor'
import { SOLANA_NETWORK, ORCA_WHIRLPOOL_PROGRAM_ID, SOL_MINT, SWAP_CONFIG } from '../constants'

export type SwapStatus =
  | 'idle'
  | 'quoting'
  | 'pending'
  | 'success'
  | 'error'

export interface SwapParams {
  fromMint: PublicKey
  toMint: PublicKey
  amount: number
  slippagePercent: number
}

export interface SwapResult {
  signature: string
  amountOut: number
}

export interface UseSwapReturn {
  status: SwapStatus
  error: string | null
  result: SwapResult | null
  executeSwap: (params: SwapParams) => Promise<SwapResult | null>
  reset: () => void
}

/**
 * Hook for executing token swaps via Orca Whirlpools on Solana Devnet.
 *
 * Handles:
 * - Wallet connection validation
 * - Network validation (Devnet only)
 * - Insufficient balance errors
 * - Transaction simulation before sending
 * - Slippage tolerance enforcement
 * - Transaction timeout (60s)
 */
export function useSwap(): UseSwapReturn {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [status, setStatus] = useState<SwapStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SwapResult | null>(null)
  const isExecuting = useRef(false)

  const reset = useCallback((): void => {
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  const executeSwap = useCallback(
    async (params: SwapParams): Promise<SwapResult | null> => {
      // Prevent double-execution
      if (isExecuting.current) {
        return null
      }

      // Validate wallet connection
      if (!publicKey) {
        setStatus('error')
        setError('Wallet not connected. Please connect your wallet first.')
        return null
      }

      // Validate network
      const endpoint = connection.rpcEndpoint
      if (!endpoint.includes(SOLANA_NETWORK) && !endpoint.includes('devnet')) {
        setStatus('error')
        setError(`Wrong network. Please switch to ${SOLANA_NETWORK}.`)
        return null
      }

      // Validate amount
      if (!Number.isFinite(params.amount) || params.amount <= 0) {
        setStatus('error')
        setError('Invalid swap amount. Amount must be greater than 0.')
        return null
      }

      // Prevent dust/spam amounts
      if (params.amount < 0.000001) {
        setStatus('error')
        setError('Amount too small. Minimum swap amount is 0.000001.')
        return null
      }

      // Cap max swap amount for SOL to protect users
      if (params.fromMint.equals(SOL_MINT) && params.amount > SWAP_CONFIG.MAX_SWAP_AMOUNT_SOL) {
        setStatus('error')
        setError(`Amount exceeds maximum of ${SWAP_CONFIG.MAX_SWAP_AMOUNT_SOL} SOL per swap.`)
        return null
      }

      // Validate slippage
      const slippage = Math.max(
        SWAP_CONFIG.MIN_SLIPPAGE_PERCENT,
        Math.min(params.slippagePercent, SWAP_CONFIG.MAX_SLIPPAGE_PERCENT)
      )

      isExecuting.current = true
      setStatus('quoting')
      setError(null)
      setResult(null)

      try {
        // Create provider for Orca SDK
        if (!signTransaction) {
          throw new Error('Wallet does not support transaction signing.')
        }

        const provider = new AnchorProvider(
          connection,
          { publicKey, signTransaction, signAllTransactions: undefined as never },
          { commitment: 'confirmed' }
        )

        const ctx = WhirlpoolContext.from(
          connection,
          provider,
          ORCA_WHIRLPOOL_PROGRAM_ID
        )
        const client = new OrcaWhirlpoolClient(ctx)

        // Find the whirlpool for this token pair
        const pool = await client.getPoolListByMintPair(params.fromMint, params.toMint)
        if (!pool || pool.length === 0) {
          throw new Error(
            `No liquidity pool found for the requested token pair. ` +
            `Ensure both tokens have liquidity on Orca Devnet.`
          )
        }

        const whirlpool = pool[0]
        const poolAddress = whirlpool.getAddress()

        // Get swap quote
        const quote = await swapQuoteByQuery(
          ctx,
          poolAddress,
          params.fromMint,
          params.amount,
          slippage / 100
        )

        if (!quote) {
          throw new Error('Failed to get swap quote. The pool may not have sufficient liquidity.')
        }

        // Check if user has sufficient balance
        const fromAccount = await connection.getTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID,
        })

        // Build the swap transaction
        setStatus('pending')
        const swapIx = await buildTx([quote.instruction])
        const transaction = new Transaction().add(swapIx)

        // Set recent blockhash and fee payer
        const { blockhash } = await connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        // Simulate transaction before sending
        const simulation = await connection.simulateTransaction(transaction)
        if (simulation.value.err) {
          throw new Error(
            `Transaction simulation failed: ${JSON.stringify(simulation.value.err)}. ` +
            `This usually means insufficient balance or slippage exceeded.`
          )
        }

        // Send transaction with timeout
        const signature = await sendTransaction(transaction, connection, {
          skipPreflight: false,
        })

        // Confirm transaction with 60s timeout
        const confirmation = await connection.confirmTransaction(signature, 'confirmed')
        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`
          )
        }

        // Calculate output amount from quote
        const amountOut = Number(quote.estimatedAmountOut) / Math.pow(10, 9) // Adjust decimals as needed

        const swapResult: SwapResult = {
          signature,
          amountOut,
        }

        setResult(swapResult)
        setStatus('success')
        return swapResult
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Swap failed unexpectedly'

        // Provide user-friendly error messages
        let userMessage = message
        if (message.includes('insufficient') || message.includes('0x1')) {
          userMessage = 'Insufficient balance. Please check your token balance and try again.'
        } else if (message.includes('User rejected') || message.includes('0x1')) {
          userMessage = 'Transaction was rejected by the user.'
        } else if (message.includes('block height')) {
          userMessage = 'Transaction timed out. Please try again.'
        } else if (message.includes('slippage')) {
          userMessage = 'Slippage exceeded tolerance. Try increasing the slippage setting.'
        }

        setStatus('error')
        setError(userMessage)
        return null
      } finally {
        isExecuting.current = false
      }
    },
    [connection, publicKey, sendTransaction, signTransaction]
  )

  return {
    status,
    error,
    result,
    executeSwap,
    reset,
  }
}
