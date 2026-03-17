"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Tasks from "./components/Tasks";
import Rewards from "./components/Rewards";
import OrcaSwap from "./components/OrcaSwap";
import DeAuraIntegration from "./components/DeAuraIntegration";
import WalletButton from "./components/WalletButton";
import ClientOnly from "./components/ClientOnly";

export default function Home() {
  const { connected, publicKey } = useWallet();
  const [points, setPoints] = useState(1250);
  const [referrals, setReferrals] = useState(5);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "rewards" | "deaura" | "leaderboard">("overview");

  const handleDailyCheckIn = async () => {
    if (!connected) {
      alert("Please connect your wallet first!");
      return;
    }
    setPoints(points + 50);
    alert("✅ Check-in successful! +50 pts");
  };

  const handleReferFriend = async () => {
    if (!connected) {
      alert("Please connect your wallet first!");
      return;
    }
    const referralLink = `https://lobster-rewards.vercel.app/?ref=${publicKey?.toString().slice(0, 8)}`;
    await navigator.clipboard.writeText(referralLink);
    setReferrals(referrals + 1);
    setPoints(points + 200);
    alert(`✅ Referral link copied!\n${referralLink}\n\nBoth you and your friend will get +200 pts`);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "tasks", label: "Tasks" },
    { id: "rewards", label: "Rewards" },
    { id: "deaura", label: "DeAura" },
    { id: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <div className="min-h-screen bg-black">
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
              <span className="text-lg">🦞</span>
            </div>
            <span className="text-white font-semibold text-lg">Lobster</span>
          </div>
          <div className="flex items-center gap-4">
            {connected && (
              <div className="hidden sm:block">
                <p className="text-white font-medium">{points.toLocaleString()} pts</p>
              </div>
            )}
            <ClientOnly>
              <WalletButton />
            </ClientOnly>
          </div>
        </div>
      </header>

      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scroll-smooth py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "tab-active" : "tab-inactive"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="text-center py-12">
              <h2 className="text-4xl font-semibold text-white mb-3">
                Earn Crypto Rewards
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
                Complete tasks, refer friends, and earn DeAura tokens on Solana
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleDailyCheckIn}
                  disabled={!connected}
                  className="btn-apple btn-apple-primary px-8 py-3 disabled:opacity-50"
                >
                  Daily Check-in +50 pts
                </button>
                <button
                  onClick={handleReferFriend}
                  disabled={!connected}
                  className="btn-apple px-8 py-3 disabled:opacity-50"
                >
                  Refer Friend +200 pts
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card-apple p-6">
                <p className="text-white/50 text-sm mb-1">Your Points</p>
                <p className="text-4xl font-semibold text-white">{points.toLocaleString()}</p>
                <p className="text-white/30 text-sm mt-2">≈ {(points / 1000).toFixed(2)} DeAura</p>
              </div>

              <div className="card-apple p-6">
                <p className="text-white/50 text-sm mb-1">Referrals</p>
                <p className="text-4xl font-semibold text-white">{referrals}</p>
                <p className="text-white/30 text-sm mt-2">+{referrals * 200} pts</p>
              </div>

              <div className="card-apple p-6">
                <p className="text-white/50 text-sm mb-1">Token Balance</p>
                <p className="text-2xl font-semibold text-white">
                  {connected ? "0.00" : "Connect Wallet"}
                </p>
                <p className="text-white/30 text-sm mt-2">{connected ? "≈ $0.00" : ""}</p>
              </div>
            </div>

            <div className="max-w-xl mx-auto">
              <OrcaSwap />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Tasks />
              <Rewards />
            </div>
          </div>
        )}

        {activeTab === "tasks" && <Tasks />}

        {activeTab === "rewards" && <Rewards />}

        {activeTab === "deaura" && <DeAuraIntegration />}

        {activeTab === "leaderboard" && (
          <div className="card-apple p-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Leaderboard</h3>
            <div className="space-y-2">
              {[
                { rank: 1, address: "8xPt...3kL9", points: 125000, change: "+2.5%" },
                { rank: 2, address: "3mNx...7wQ2", points: 98500, change: "+1.8%" },
                { rank: 3, address: "5kRt...9pM4", points: 87200, change: "+3.2%" },
                { rank: 4, address: "7jKw...2nL6", points: 76800, change: "-0.5%" },
                { rank: 5, address: "9pLm...4xR8", points: 65400, change: "+1.2%" },
                { rank: 6, address: "2hYz...5tN3", points: 58900, change: "+0.8%" },
                { rank: 7, address: "6kLp...8wM1", points: 52300, change: "+1.5%" },
                { rank: 8, address: "4mQr...2xP7", points: 47800, change: "-1.2%" },
                { rank: 9, address: "1nTs...6yK4", points: 43200, change: "+2.1%" },
                { rank: 10, address: "8pWv...3zR9", points: 39500, change: "+0.5%" },
              ].map((user) => (
                <div
                  key={user.rank}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      user.rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                      user.rank === 2 ? "bg-gray-400/20 text-gray-400" :
                      user.rank === 3 ? "bg-orange-600/20 text-orange-600" :
                      "bg-white/10 text-white/50"
                    }`}>
                      {user.rank}
                    </div>
                    <span className="text-white/80 font-mono">{user.address}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">{user.points.toLocaleString()} pts</span>
                    <span className={`text-sm ${user.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                      {user.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 mt-16 py-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-white/30 text-sm">Powered by Solana & DeAura</p>
          <p className="text-white/20 text-xs mt-2">Built for TokenTon26</p>
          <div className="flex justify-center gap-6 mt-6">
            <a href="#" className="text-white/30 hover:text-white/60 text-sm transition-colors">Twitter</a>
            <a href="#" className="text-white/30 hover:text-white/60 text-sm transition-colors">Discord</a>
            <a href="#" className="text-white/30 hover:text-white/60 text-sm transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
