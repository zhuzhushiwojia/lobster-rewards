import { useCallback, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useSwap, SwapStatus } from '../lib/hooks/useSwap'
import { SUPPORTED_TOKENS, SWAP_CONFIG } from '../lib/constants'

/**
 * Orca Whirlpools swap panel.
 *
 * Features:
 * - Token selection (SOL, USDC, wRTC)
 * - Slippage tolerance settings
 * - Transaction simulation before sending
 * - Detailed error messages for common failure modes
 * - Loading states for quote and transaction
 * - Success feedback with transaction signature
 */
export function SwapPanel() {
  const { publicKey } = useWallet()
  const { status, error, result, executeSwap, reset } = useSwap()

  const [fromToken, setFromToken] = useState<string>('SOL')
  const [toToken, setToToken] = useState<string>('wRTC')
  const [amount, setAmount] = useState<string>('')
  const [slippage, setSlippage] = useState<number>(SWAP_CONFIG.DEFAULT_SLIPPAGE_PERCENT)
  const [showSlippageSettings, setShowSlippageSettings] = useState(false)

  const fromMint = useMemo(() => {
    const token = SUPPORTED_TOKENS.find((t) => t.symbol === fromToken)
    return token ? token.mint : SUPPORTED_TOKENS[0].mint
  }, [fromToken])

  const toMint = useMemo(() => {
    const token = SUPPORTED_TOKENS.find((t) => t.symbol === toToken)
    return token ? token.mint : SUPPORTED_TOKENS[2].mint
  }, [toToken])

  const canSwap = useMemo(() => {
    const parsedAmount = parseFloat(amount)
    return (
      publicKey !== null &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0 &&
      fromToken !== toToken &&
      status !== 'quoting' &&
      status !== 'pending'
    )
  }, [amount, fromToken, toToken, publicKey, status])

  const handleSwap = useCallback(async () => {
    const parsedAmount = parseFloat(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return

    await executeSwap({
      fromMint,
      toMint,
      amount: parsedAmount,
      slippagePercent: slippage,
    })
  }, [amount, fromMint, toMint, slippage, executeSwap])

  const handleFlip = useCallback(() => {
    setFromToken(toToken)
    setToToken(fromToken)
    setAmount('')
    reset()
  }, [fromToken, toToken, reset])

  const handleReset = useCallback(() => {
    setAmount('')
    reset()
  }, [reset])

  const isPending = status === 'quoting' || status === 'pending'

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-950/40 to-stone-950/60 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-400">Quick Swap</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">
            {SWAP_CONFIG.DEFAULT_FEE_PERCENT}% Fee
          </span>
          <button
            onClick={() => setShowSlippageSettings((v) => !v)}
            className="text-xs text-amber-400 hover:text-amber-300 underline"
            aria-label="Configure slippage"
          >
            Slippage: {slippage}%
          </button>
        </div>
      </div>

      {showSlippageSettings && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-stone-900/50 p-3">
          <span className="text-xs text-stone-400">Slippage tolerance:</span>
          {[0.1, 0.5, 1.0].map((value) => (
            <button
              key={value}
              onClick={() => setSlippage(value)}
              className={`
                rounded-md px-3 py-1 text-xs font-medium transition-colors
                ${slippage === value
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                }
              `}
            >
              {value}%
            </button>
          ))}
        </div>
      )}

      {/* From token */}
      <div className="mb-2">
        <label className="mb-1 block text-xs text-stone-400">Pay</label>
        <div className="flex items-center gap-2 rounded-xl bg-stone-900/70 p-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              if (status === 'success' || status === 'error') reset()
            }}
            placeholder="0.00"
            disabled={isPending}
            className="
              flex-1 bg-transparent text-lg font-medium text-white
              placeholder:text-stone-600 focus:outline-none
              disabled:opacity-50
            "
            min="0"
            step="0.000001"
          />
          <select
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            disabled={isPending}
            className="
              rounded-lg bg-stone-800 px-3 py-2 text-sm font-medium text-white
              focus:outline-none focus:ring-2 focus:ring-amber-500/50
              disabled:opacity-50
            "
          >
            {SUPPORTED_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flip button */}
      <div className="my-2 flex justify-center">
        <button
          onClick={handleFlip}
          disabled={isPending}
          className="
            rounded-full border border-amber-500/30 bg-stone-900 p-2
            text-amber-400 transition-colors hover:bg-amber-500/10
            disabled:opacity-50
          "
          aria-label="Flip swap direction"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 10l5-5 5 5M17 14l-5 5-5-5" />
          </svg>
        </button>
      </div>

      {/* To token */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-stone-400">Receive</label>
        <div className="flex items-center gap-2 rounded-xl bg-stone-900/70 p-3">
          <input
            type="text"
            value={result ? result.amountOut.toFixed(6) : ''}
            placeholder={isPending ? 'Calculating...' : '--'}
            readOnly
            className="
              flex-1 bg-transparent text-lg font-medium text-white
              placeholder:text-stone-600 focus:outline-none
            "
          />
          <select
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            disabled={isPending}
            className="
              rounded-lg bg-stone-800 px-3 py-2 text-sm font-medium text-white
              focus:outline-none focus:ring-2 focus:ring-amber-500/50
              disabled:opacity-50
            "
          >
            {SUPPORTED_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-950/40 p-3 text-sm text-red-400">
          <span className="text-red-500">\u26A0</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {status === 'success' && result && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-green-950/40 p-3 text-sm text-green-400">
          <span className="text-green-500">\u2713</span>
          <div className="flex flex-col gap-1">
            <span>Swap successful!</span>
            <a
              href={`https://solscan.io/tx/${result.signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-300 underline"
            >
              View on Solscan
            </a>
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={handleSwap}
        disabled={!canSwap}
        className={`
          w-full rounded-xl py-3 font-semibold text-white transition-all
          ${!canSwap
            ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
            : isPending
              ? 'bg-amber-700 animate-pulse cursor-wait'
              : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] shadow-lg shadow-amber-500/20'
          }
        `}
      >
        {isPending
          ? 'Processing...'
          : !publicKey
            ? 'Connect Wallet'
            : !amount
              ? 'Enter Amount'
              : fromToken === toToken
                ? 'Select Different Tokens'
                : 'Swap'}
      </button>

      {/* Reset after success */}
      {status === 'success' && (
        <button
          onClick={handleReset}
          className="mt-2 w-full text-center text-xs text-stone-500 hover:text-stone-400 underline"
        >
          Start new swap
        </button>
      )}

      <p className="mt-3 text-center text-xs text-stone-600">
        Powered by Orca Whirlpools
      </p>
    </div>
  )
}
