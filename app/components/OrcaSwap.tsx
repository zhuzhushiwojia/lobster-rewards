"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface SwapState {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  slippage: number;
  loading: boolean;
  error: string | null;
}

const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  wRTC: "TODO_DEPLOY_MINT",
};

export default function OrcaSwap() {
  const { connected } = useWallet();
  const [swapState, setSwapState] = useState<SwapState>({
    fromToken: "SOL",
    toToken: "wRTC",
    fromAmount: "",
    toAmount: "",
    slippage: 0.5,
    loading: false,
    error: null,
  });

  const handleSwap = async () => {
    if (!connected) {
      setSwapState((prev) => ({ ...prev, error: "Please connect your wallet!" }));
      return;
    }
    if (!swapState.fromAmount || parseFloat(swapState.fromAmount) <= 0) {
      setSwapState((prev) => ({ ...prev, error: "Please enter a valid amount" }));
      return;
    }

    setSwapState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`✅ Swap successful!\n${swapState.fromAmount} ${swapState.fromToken} → ${swapState.toAmount} ${swapState.toToken}`);
      setSwapState((prev) => ({ ...prev, loading: false, fromAmount: "", toAmount: "" }));
    } catch (err: any) {
      setSwapState((prev) => ({ ...prev, loading: false, error: err.message || "Swap failed" }));
    }
  };

  const calculateOutput = () => {
    if (!swapState.fromAmount || parseFloat(swapState.fromAmount) <= 0) {
      setSwapState((prev) => ({ ...prev, toAmount: "" }));
      return;
    }
    const mockRate = 100;
    setSwapState((prev) => ({ ...prev, toAmount: (parseFloat(prev.fromAmount) * mockRate).toFixed(2) }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (swapState.fromAmount) calculateOutput();
    }, 500);
    return () => clearTimeout(timer);
  }, [swapState.fromAmount, swapState.fromToken, swapState.toToken]);

  const swapTokens = () => {
    setSwapState((prev) => ({
      ...prev,
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }));
  };

  return (
    <div className="card-apple p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Quick Swap</h3>
        <div className="badge-apple">0.30% Fee</div>
      </div>

      <div className="space-y-3">
        <div className="bg-white/5 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-white/50 text-sm">Pay</span>
            <span className="text-white/30 text-sm">Balance: --</span>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={swapState.fromAmount}
              onChange={(e) => setSwapState((prev) => ({ ...prev, fromAmount: e.target.value }))}
              placeholder="0"
              className="input-apple flex-1 text-xl"
            />
            <select
              value={swapState.fromToken}
              onChange={(e) => setSwapState((prev) => ({ ...prev, fromToken: e.target.value }))}
              className="select-apple"
            >
              {Object.keys(TOKENS).map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={swapTokens}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          >
            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>

        <div className="bg-white/5 rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-white/50 text-sm">Receive</span>
            <span className="text-white/30 text-sm">Balance: --</span>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={swapState.toAmount}
              readOnly
              placeholder="0"
              className="input-apple flex-1 text-xl"
            />
            <select
              value={swapState.toToken}
              onChange={(e) => setSwapState((prev) => ({ ...prev, toToken: e.target.value }))}
              className="select-apple"
            >
              {Object.keys(TOKENS).map((token) => (
                <option key={token} value={token}>{token}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 px-2">
        <span className="text-white/40 text-sm">Slippage</span>
        <div className="flex gap-1">
          {[0.1, 0.5, 1.0].map((slip) => (
            <button
              key={slip}
              onClick={() => setSwapState((prev) => ({ ...prev, slippage: slip }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                swapState.slippage === slip ? "bg-white text-black" : "bg-white/10 text-white/50 hover:text-white"
              }`}
            >
              {slip}%
            </button>
          ))}
        </div>
      </div>

      {swapState.error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-sm">{swapState.error}</p>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={!connected || swapState.loading || !swapState.fromAmount}
        className={`w-full mt-4 py-4 rounded-2xl font-semibold text-base transition-all ${
          !connected || swapState.loading || !swapState.fromAmount
            ? "bg-white/5 text-white/30 cursor-not-allowed"
            : "bg-white text-black hover:bg-white/90"
        }`}
      >
        {!connected ? "Connect Wallet" : swapState.loading ? "Swapping..." : "Swap Now"}
      </button>

      <div className="mt-4 text-center">
        <p className="text-white/30 text-xs">
          Powered by Orca Whirlpools
        </p>
      </div>
    </div>
  );
}
