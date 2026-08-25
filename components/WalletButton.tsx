import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWalletState } from '../lib/hooks/useWallet'

/**
 * Wallet connection button with network validation.
 *
 * Extends the default Solana wallet adapter button with:
 * - Devnet network validation
 * - Error state display
 * - Short address formatting
 */
export function WalletButton() {
  const { status, shortAddress, errorMessage, clearError } = useWalletState()

  if (status === 'wrong-network' || (errorMessage && status === 'error')) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
          <span className="text-sm font-medium text-red-400">
            {status === 'wrong-network' ? 'Wrong Network' : 'Error'}
          </span>
        </div>
        <p className="max-w-xs truncate text-xs text-red-400/70">{errorMessage}</p>
        <button
          onClick={clearError}
          className="text-xs text-amber-400 hover:text-amber-300 underline"
        >
          Dismiss
        </button>
      </div>
    )
  }

  if (status === 'connected' && shortAddress) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-green-400">{shortAddress}</span>
        <WalletMultiButton className="!hidden" />
      </div>
    )
  }

  if (status === 'connecting') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm font-medium text-yellow-400">Connecting...</span>
      </div>
    )
  }

  return (
    <WalletMultiButton
      className="
        !bg-amber-500 hover:!bg-amber-400
        !text-white !font-semibold
        !rounded-lg !px-4 !py-2
        !transition-colors !duration-200
        !border-0 !shadow-md
      "
    />
  )
}
