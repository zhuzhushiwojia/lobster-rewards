import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SwapPanel } from '../components/SwapPanel'
import { useWallet } from '@solana/wallet-adapter-react'

// Mock wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: jest.fn(),
  useConnection: jest.fn(() => ({
    connection: {
      rpcEndpoint: 'https://api.devnet.solana.com',
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'test' }),
      simulateTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
      confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
      getTokenAccountsByOwner: jest.fn().mockResolvedValue({ value: [] }),
    },
  })),
}))

// Mock Orca SDK
jest.mock('@orca-so/whirlpools-sdk', () => ({
  OrcaWhirlpoolClient: jest.fn().mockImplementation(() => ({
    getPoolListByMintPair: jest.fn().mockResolvedValue([
      { getAddress: () => 'test-pool' },
    ]),
  })),
  WhirlpoolContext: {
    from: jest.fn().mockReturnValue({}),
  },
  buildTx: jest.fn().mockResolvedValue({ data: null, keys: [] }),
  swapQuoteByQuery: jest.fn().mockResolvedValue({
    instruction: { data: null, keys: [] },
    estimatedAmountOut: { toString: () => '1000000' },
  }),
}))

// Mock Anchor provider
jest.mock('@coral-xyz/anchor', () => ({
  AnchorProvider: jest.fn().mockImplementation(() => ({})),
}))

describe('SwapPanel', () => {
  const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders token selectors with SOL, USDC, wRTC options', () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      connecting: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      wallet: null,
      select: jest.fn(),
      signTransaction: undefined,
      signAllTransactions: undefined,
      sendTransaction: jest.fn(),
    } as any)

    render(<SwapPanel />)

    const selects = screen.getAllByRole('combobox')
    expect(selects).toHaveLength(2)

    const options = screen.getAllByRole('option')
    expect(options.some((o) => o.textContent === 'SOL')).toBe(true)
    expect(options.some((o) => o.textContent === 'USDC')).toBe(true)
    expect(options.some((o) => o.textContent === 'wRTC')).toBe(true)
  })

  it('disables swap button when wallet is not connected', () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      connecting: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      wallet: null,
      select: jest.fn(),
      signTransaction: undefined,
      signAllTransactions: undefined,
      sendTransaction: jest.fn(),
    } as any)

    render(<SwapPanel />)

    const button = screen.getByText('Connect Wallet')
    expect(button).toBeDisabled()
  })

  it('disables swap button when amount is empty', () => {
    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => '11111111111111111111111111111111' } as any,
      connected: true,
      connecting: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      wallet: {} as any,
      select: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: undefined,
      sendTransaction: jest.fn(),
    } as any)

    render(<SwapPanel />)

    const button = screen.getByText('Enter Amount')
    expect(button).toBeDisabled()
  })

  it('shows slippage settings when clicked', () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      connecting: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      wallet: null,
      select: jest.fn(),
      signTransaction: undefined,
      signAllTransactions: undefined,
      sendTransaction: jest.fn(),
    } as any)

    render(<SwapPanel />)

    const slippageButton = screen.getByText(/Slippage/)
    fireEvent.click(slippageButton)

    expect(screen.getByText('Slippage tolerance:')).toBeInTheDocument()
    expect(screen.getByText('0.1%')).toBeInTheDocument()
    expect(screen.getByText('0.5%')).toBeInTheDocument()
    expect(screen.getByText('1%')).toBeInTheDocument()
  })

  it('disables swap when from and to tokens are the same', () => {
    mockUseWallet.mockReturnValue({
      publicKey: { toBase58: () => '11111111111111111111111111111111' } as any,
      connected: true,
      connecting: false,
      connect: jest.fn(),
      disconnect: jest.fn(),
      wallet: {} as any,
      select: jest.fn(),
      signTransaction: jest.fn(),
      signAllTransactions: undefined,
      sendTransaction: jest.fn(),
    } as any)

    render(<SwapPanel />)

    const amountInput = screen.getByPlaceholderText('0.00')
    fireEvent.change(amountInput, { target: { value: '1.0' } })

    const fromSelect = screen.getAllByRole('combobox')[0]
    const toSelect = screen.getAllByRole('combobox')[1]

    fireEvent.change(fromSelect, { target: { value: 'SOL' } })
    fireEvent.change(toSelect, { target: { value: 'SOL' } })

    const button = screen.getByText('Select Different Tokens')
    expect(button).toBeDisabled()
  })
})
