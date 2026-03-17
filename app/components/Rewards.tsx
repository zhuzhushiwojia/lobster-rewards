"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Reward {
  id: number;
  title: string;
  cost: number;
  type: "token" | "nft" | "boost";
}

export default function Rewards() {
  const { connected } = useWallet();
  const [points, setPoints] = useState(1250);
  const [loading, setLoading] = useState<number | null>(null);

  const rewards: Reward[] = [
    { id: 1, title: "100 DeAura Tokens", cost: 1000, type: "token" },
    { id: 2, title: "500 DeAura Tokens", cost: 5000, type: "token" },
    { id: 3, title: "1000 DeAura Tokens", cost: 10000, type: "token" },
    { id: 4, title: "Exclusive NFT Badge", cost: 2500, type: "nft" },
    { id: 5, title: "7 Days 2x Points", cost: 1500, type: "boost" },
    { id: 6, title: "30 Days 2x Points", cost: 5000, type: "boost" },
  ];

  const handleClaimReward = async (reward: Reward) => {
    if (!connected) {
      alert("Please connect your wallet first!");
      return;
    }
    if (points < reward.cost) {
      alert("Insufficient points!");
      return;
    }
    setLoading(reward.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPoints(points - reward.cost);
      alert(`✅ Claimed: ${reward.title}`);
    } catch {
      alert("Claim failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "token": return "Token";
      case "nft": return "NFT";
      case "boost": return "Boost";
      default: return type;
    }
  };

  return (
    <div className="card-apple p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Rewards</h3>
        <div className="text-right">
          <p className="text-white/50 text-sm">Available</p>
          <p className="text-2xl font-semibold text-white">{points.toLocaleString()}</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">💎</div>
          <div>
            <p className="text-white font-medium">DeAura Token</p>
            <p className="text-white/40 text-sm">1,000 pts = 1 DeAura</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white">{(points / 1000).toFixed(2)}</p>
            <p className="text-white/40 text-xs">Available</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {rewards.map((reward) => {
          const canClaim = points >= reward.cost && connected;
          return (
            <div
              key={reward.id}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                canClaim ? "hover:bg-white/5" : "opacity-40"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  {reward.type === "token" ? "🪙" : reward.type === "nft" ? "🖼️" : "⚡"}
                </div>
                <div>
                  <p className="text-white font-medium">{reward.title}</p>
                  <p className="text-white/40 text-xs">{getTypeLabel(reward.type)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/60 text-sm">{reward.cost.toLocaleString()} pts</span>
                <button
                  onClick={() => handleClaimReward(reward)}
                  disabled={!connected || points < reward.cost || loading === reward.id}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    loading === reward.id
                      ? "bg-white/10 text-white/50"
                      : canClaim
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  {loading === reward.id ? "..." : "Claim"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!connected && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-center">
          <p className="text-yellow-500/80 text-sm">Connect wallet to claim rewards</p>
        </div>
      )}

      <div className="mt-6 p-4 bg-white/5 rounded-2xl">
        <p className="text-white/40 text-xs text-center">Rewards will be sent to your wallet</p>
      </div>
    </div>
  );
}
