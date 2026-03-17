"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface DeAuraTokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  supply: number;
}

export default function DeAuraIntegration() {
  const { connected, publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<DeAuraTokenInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'airdrop'>('create');

  const [createForm, setCreateForm] = useState({
    name: "Lobster Rewards Token",
    symbol: "LRT",
    decimals: 9,
    supply: 1_000_000_000,
    uri: "",
  });

  const [airdropForm, setAirdropForm] = useState({ recipients: "" });

  const createTokenViaDeAura = async () => {
    if (!connected) {
      alert("Please connect your wallet first!");
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockMint = "LRT" + createForm.symbol.toLowerCase() + "12345678";
      setTokenInfo({
        mint: mockMint,
        symbol: createForm.symbol,
        name: createForm.name,
        decimals: createForm.decimals,
        supply: createForm.supply,
      });
      alert(`✅ Token created successfully!\nContract address: ${mockMint}`);
    } catch (error: any) {
      alert(`❌ Creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeAirdrop = async () => {
    if (!connected || !tokenInfo) {
      alert("Please connect wallet and create token first!");
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`✅ Airdrop ready!`);
    } catch (error: any) {
      alert(`❌ Airdrop failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'create', label: 'Create' },
    { id: 'manage', label: 'Manage' },
    { id: 'airdrop', label: 'Airdrop' },
  ];

  return (
    <div className="card-apple p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">DeAura Token</h3>
        {tokenInfo && (
          <div className="badge-apple">{tokenInfo.symbol}</div>
        )}
      </div>

      <div className="flex gap-1 mb-6 border-b border-white/10 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id ? "bg-white text-black" : "text-white/50 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-sm block mb-2">Token Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="input-apple w-full"
              />
            </div>
            <div>
              <label className="text-white/50 text-sm block mb-2">Token Symbol</label>
              <input
                type="text"
                value={createForm.symbol}
                onChange={(e) => setCreateForm({ ...createForm, symbol: e.target.value })}
                className="input-apple w-full"
              />
            </div>
            <div>
              <label className="text-white/50 text-sm block mb-2">Decimals</label>
              <input
                type="number"
                value={createForm.decimals}
                onChange={(e) => setCreateForm({ ...createForm, decimals: parseInt(e.target.value) })}
                className="input-apple w-full"
                min="0"
                max="9"
              />
            </div>
            <div>
              <label className="text-white/50 text-sm block mb-2">Total Supply</label>
              <input
                type="number"
                value={createForm.supply}
                onChange={(e) => setCreateForm({ ...createForm, supply: parseInt(e.target.value) })}
                className="input-apple w-full"
              />
            </div>
          </div>

          <button
            onClick={createTokenViaDeAura}
            disabled={!connected || loading}
            className="w-full py-4 rounded-2xl font-semibold bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Create Token"}
          </button>
        </div>
      )}

      {activeTab === 'manage' && (
        <div>
          {tokenInfo ? (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/50">Name</span>
                  <span className="text-white">{tokenInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Symbol</span>
                  <span className="text-white">{tokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Decimals</span>
                  <span className="text-white">{tokenInfo.decimals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Supply</span>
                  <span className="text-white">{tokenInfo.supply.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Contract</span>
                  <span className="text-white font-mono text-sm">{tokenInfo.mint}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/30">
              <p>No token info</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-6 py-2 bg-white text-black rounded-xl font-medium"
              >
                Create Now
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'airdrop' && (
        <div>
          {!tokenInfo ? (
            <div className="text-center py-8 text-white/30">
              <p>Please create a token first</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-6 py-2 bg-white text-black rounded-xl font-medium"
              >
                Create Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-sm block mb-2">
                  Recipients (one per line: address, amount)
                </label>
                <textarea
                  value={airdropForm.recipients}
                  onChange={(e) => setAirdropForm({ ...airdropForm, recipients: e.target.value })}
                  className="input-apple w-full font-mono text-sm"
                  rows={5}
                  placeholder="addr1,1000\naddr2,2000"
                />
              </div>
              <button
                onClick={executeAirdrop}
                disabled={!connected || loading}
                className="w-full py-4 rounded-2xl font-semibold bg-white text-black hover:bg-white/90 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Execute Airdrop"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
