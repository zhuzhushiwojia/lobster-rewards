import { clusterApiUrl, PublicKey } from '@solana/web3.js'

/**
 * Solana network configuration for Lobster Rewards.
 * The app operates exclusively on Devnet to avoid accidental mainnet transactions.
 */
export const SOLANA_NETWORK = 'devnet' as const
export const SOLANA_RPC_ENDPOINT = clusterApiUrl('devnet')
export const SOLANA_COMMITMENT = 'confirmed' as const

/**
 * wRTC token mint address on Solana Devnet.
 * This is the primary reward token for the Lobster Rewards platform.
 */
export const WRTC_MINT = new PublicKey('6zoec1UvtibQePttPFBifnEW48EB8P92VPKHLd8Y5uiZ')

/**
 * SOL mint address (wrapped SOL).
 */
export const SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')

/**
 * USDC mint on Devnet.
 */
export const USDC_MINT = new PublicKey('4zMMC9dcb525PvQrwQxFhGmKg2JxFJzY3wXm4v9bZrjy')

/**
 * Supported tokens for swap operations.
 */
export const SUPPORTED_TOKENS = [
  { symbol: 'SOL', mint: SOL_MINT, decimals: 9 },
  { symbol: 'USDC', mint: USDC_MINT, decimals: 6 },
  { symbol: 'wRTC', mint: WRTC_MINT, decimals: 6 },
] as const

/**
 * Orca Whirlpool program ID on Devnet.
 */
export const ORCA_WHIRLPOOL_PROGRAM_ID = new PublicKey(
  'whirLbMiicVdio4qvUfM5iBuzzNJBx19NC2n5k3iy8Z'
)

/**
 * Points system constants.
 */
export const POINTS = {
  DAILY_CHECKIN: 50,
  COMPLETE_PROFILE: 100,
  FOLLOW_TWITTER: 75,
  JOIN_DISCORD: 75,
  SWAP_ON_ORCA: 200,
  PROVIDE_LIQUIDITY: 500,
  REFER_FRIEND: 200,
  FIRST_SWAP: 150,
} as const

/**
 * Points-to-token conversion rate.
 * 1000 points = 1 DeAura token.
 */
export const POINTS_PER_DEAURA = 1000

/**
 * Reward tiers available for claiming.
 */
export const REWARD_TIERS = [
  { id: 'deaura-100', name: '100 DeAura Tokens', type: 'token', cost: 1000, amount: 100 },
  { id: 'deaura-500', name: '500 DeAura Tokens', type: 'token', cost: 5000, amount: 500 },
  { id: 'deaura-1000', name: '1000 DeAura Tokens', type: 'token', cost: 10000, amount: 1000 },
  { id: 'nft-badge', name: 'Exclusive NFT Badge', type: 'nft', cost: 2500, amount: 1 },
  { id: 'boost-7d', name: '7 Days 2x Points', type: 'boost', cost: 1500, amount: 7 },
  { id: 'boost-30d', name: '30 Days 2x Points', type: 'boost', cost: 5000, amount: 30 },
] as const

/**
 * Task definitions.
 */
export const TASKS = [
  { id: 'daily-checkin', title: 'Daily Check-in', description: 'Login daily to claim rewards', points: POINTS.DAILY_CHECKIN, icon: '\u{1F4C5}' },
  { id: 'complete-profile', title: 'Complete Profile', description: 'Fill in your profile information', points: POINTS.COMPLETE_PROFILE, icon: '\u{1F464}' },
  { id: 'follow-twitter', title: 'Follow Twitter', description: 'Follow our official Twitter', points: POINTS.FOLLOW_TWITTER, icon: '\u{1F426}' },
  { id: 'join-discord', title: 'Join Discord', description: 'Join our community Discord', points: POINTS.JOIN_DISCORD, icon: '\u{1F4AC}' },
  { id: 'swap-on-orca', title: 'Swap on Orca', description: 'Complete any token swap', points: POINTS.SWAP_ON_ORCA, icon: '\u{1F504}' },
  { id: 'provide-liquidity', title: 'Provide Liquidity', description: 'Add funds to liquidity pool', points: POINTS.PROVIDE_LIQUIDITY, icon: '\u{1F4A7}' },
  { id: 'refer-friend', title: 'Refer Friend', description: 'Invite friends to join', points: POINTS.REFER_FRIEND, icon: '\u{1F465}' },
  { id: 'first-swap', title: 'First Swap', description: 'Complete your first token swap', points: POINTS.FIRST_SWAP, icon: '\u{1F3AF}' },
] as const

/**
 * Swap fee configuration.
 */
export const SWAP_CONFIG = {
  DEFAULT_FEE_PERCENT: 0.30,
  DEFAULT_SLIPPAGE_PERCENT: 0.5,
  MIN_SLIPPAGE_PERCENT: 0.1,
  MAX_SLIPPAGE_PERCENT: 5.0,
  MAX_SWAP_AMOUNT_SOL: 10,
} as const

/**
 * LocalStorage keys.
 */
export const STORAGE_KEYS = {
  POINTS: 'lobster_points',
  COMPLETED_TASKS: 'lobster_completed_tasks',
  LAST_CHECKIN: 'lobster_last_checkin',
  REFERRALS: 'lobster_referrals',
  WALLET_CONNECTED: 'lobster_wallet_connected',
} as const
