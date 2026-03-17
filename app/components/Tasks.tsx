"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  icon: string;
  completed: boolean;
  category: "social" | "defi" | "daily" | "referral";
}

export default function Tasks() {
  const { connected } = useWallet();
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Daily Check-in", description: "Login daily to claim rewards", reward: 50, icon: "📅", completed: false, category: "daily" },
    { id: 2, title: "Complete Profile", description: "Fill in your profile information", reward: 100, icon: "👤", completed: false, category: "social" },
    { id: 3, title: "Follow Twitter", description: "Follow our official Twitter", reward: 75, icon: "🐦", completed: false, category: "social" },
    { id: 4, title: "Join Discord", description: "Join our community Discord", reward: 75, icon: "💬", completed: false, category: "social" },
    { id: 5, title: "Swap on Orca", description: "Complete any token swap", reward: 200, icon: "🔄", completed: false, category: "defi" },
    { id: 6, title: "Provide Liquidity", description: "Add funds to liquidity pool", reward: 500, icon: "💧", completed: false, category: "defi" },
    { id: 7, title: "Refer Friend", description: "Invite friends to join", reward: 200, icon: "👥", completed: false, category: "referral" },
    { id: 8, title: "First Swap", description: "Complete your first token swap", reward: 150, icon: "🎯", completed: false, category: "defi" },
  ]);

  const handleCompleteTask = async (taskId: number) => {
    if (!connected) {
      alert("Please connect your wallet first!");
      return;
    }
    setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: true } : task));
    alert("Task completed! Points added.");
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalReward = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.reward, 0);
  const progress = (completedCount / tasks.length) * 100;

  return (
    <div className="card-apple p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Tasks</h3>
        <div className="badge-apple">
          {completedCount}/{tasks.length} Completed
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/50">Progress</span>
          <span className="text-white">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar h-2">
          <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-white/30 text-sm mt-2">Earned {totalReward} pts</p>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
              task.completed ? "bg-green-500/5 border border-green-500/20" : "hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg">
                {task.icon}
              </div>
              <div>
                <h4 className="text-white font-medium">{task.title}</h4>
                <p className="text-white/40 text-sm">{task.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-sm">+{task.reward} pts</span>
              <button
                onClick={() => handleCompleteTask(task.id)}
                disabled={task.completed || !connected}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  task.completed
                    ? "bg-green-500/20 text-green-500"
                    : !connected
                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                {task.completed ? "✓" : "Complete"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!connected && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-center">
          <p className="text-yellow-500/80 text-sm">Connect wallet to start tasks</p>
        </div>
      )}
    </div>
  );
}
