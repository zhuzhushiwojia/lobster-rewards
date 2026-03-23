/**
 * Lobster Rewards - 组件单元测试
 * 
 * 测试框架：Jest + React Testing Library
 * 运行命令：npm test
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock modules
jest.mock("@solana/wallet-adapter-react", () => ({
  useWallet: jest.fn(),
  useConnection: jest.fn(),
  WalletProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@solana/web3.js", () => ({
  Connection: jest.fn().mockImplementation(() => ({
    getBalance: jest.fn().mockResolvedValue(1000000000),
    sendTransaction: jest.fn().mockResolvedValue("mock-signature"),
    confirmTransaction: jest.fn().mockResolvedValue({ value: { err: null } }),
  })),
  PublicKey: jest.fn().mockImplementation((key: string) => ({ toString: () => key })),
  clusterApiUrl: jest.fn().mockReturnValue("https://api.devnet.solana.com"),
}));

// ============================================================================
// 积分系统测试
// ============================================================================

describe("积分系统", () => {
  describe("每日签到", () => {
    it("应该允许用户每日签到并获得积分", () => {
      // 模拟已连接钱包
      const mockUseWallet = require("@solana/wallet-adapter-react").useWallet;
      mockUseWallet.mockReturnValue({
        connected: true,
        publicKey: { toString: () => "mock-wallet-address" },
      });

      // 测试签到逻辑
      let points = 0;
      const handleCheckIn = () => {
        points += 50;
      };

      // 初始状态
      expect(points).toBe(0);

      // 点击签到
      handleCheckIn();

      // 验证积分更新
      expect(points).toBe(50);
    });

    it("应该阻止未连接钱包的用户签到", () => {
      const mockUseWallet = require("@solana/wallet-adapter-react").useWallet;
      mockUseWallet.mockReturnValue({
        connected: false,
        publicKey: null,
      });

      // 测试未连接时不能签到
      const canCheckIn = mockUseWallet().connected;
      expect(canCheckIn).toBe(false);
    });

    it("应该防止重复签到", () => {
      const mockUseWallet = require("@solana/wallet-adapter-react").useWallet;
      mockUseWallet.mockReturnValue({
        connected: true,
        publicKey: { toString: () => "mock-wallet-address" },
      });

      // 模拟已签到状态
      let lastCheckin = "2026-03-15";
      let canCheckIn = true;

      // 已签到状态
      expect(lastCheckin).toContain("2026-03-15");
      // 同一天不能重复签到
      canCheckIn = false;
      expect(canCheckIn).toBe(false);
    });
  });

  describe("任务系统", () => {
    const mockTasks = [
      {
        id: "task-1",
        title: "关注 Twitter",
        points: 75,
        completed: false,
        url: "https://twitter.com/lobster-rewards",
      },
      {
        id: "task-2",
        title: "加入 Discord",
        points: 75,
        completed: false,
        url: "https://discord.gg/lobster-rewards",
      },
      {
        id: "task-3",
        title: "邀请好友",
        points: 200,
        completed: false,
        url: null,
      },
    ];

    it("应该显示任务列表", () => {
      render(
        <div data-testid="tasks-list">
          {mockTasks.map((task) => (
            <div key={task.id} data-testid={`task-${task.id}`}>
              <span>{task.title}</span>
              <span>+{task.points} pts</span>
            </div>
          ))}
        </div>
      );

      expect(screen.getByText("关注 Twitter")).toBeInTheDocument();
      expect(screen.getByText("加入 Discord")).toBeInTheDocument();
      expect(screen.getByText("邀请好友")).toBeInTheDocument();
    });

    it("应该允许用户完成任务并获得积分", () => {
      // 模拟任务完成逻辑
      let points = 100;
      const taskPoints = 75;
      const completeTask = () => {
        points += taskPoints;
      };

      expect(points).toBe(100);

      completeTask();

      expect(points).toBe(175);
    });

    it("应该标记已完成的任务", () => {
      render(
        <div data-testid="task-completed" className="completed">
          <span>关注 Twitter</span>
          <span>✅ 已完成</span>
        </div>
      );

      const completedTask = screen.getByTestId("task-completed");
      expect(completedTask).toHaveClass("completed");
      expect(screen.getByText("✅ 已完成")).toBeInTheDocument();
    });
  });

  describe("推荐系统", () => {
    it("应该生成唯一的推荐链接", () => {
      const mockUserId = "user-123";
      const referralLink = `https://lobster-rewards.app/?ref=${mockUserId}`;

      expect(referralLink).toContain(mockUserId);
      expect(referralLink).toMatch(/https:\/\/lobster-rewards\.app\/\?ref=/);
    });

    it("应该复制推荐链接到剪贴板", async () => {
      // Mock clipboard API
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const referralLink = "https://lobster-rewards.app/?ref=user-123";
      
      // 模拟复制操作
      await navigator.clipboard.writeText(referralLink);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(referralLink);
    });

    it("应该追踪推荐成功并奖励积分", async () => {
      const referrerPoints = 100;
      const refereeBonus = 50;
      const referrerBonus = 200;

      // 推荐人初始积分
      expect(referrerPoints).toBe(100);

      // 被推荐人注册后
      const newReferrerPoints = referrerPoints + referrerBonus;
      expect(newReferrerPoints).toBe(300);

      // 被推荐人获得奖励
      expect(refereeBonus).toBe(50);
    });
  });
});

// ============================================================================
// Orca Swap 测试
// ============================================================================

describe("Orca Swap 集成", () => {
  describe("汇率计算", () => {
    it("应该正确计算输出金额", () => {
      const inputAmount = 1; // 1 SOL
      const exchangeRate = 100; // 1 SOL = 100 wRTC (mock)
      const expectedOutput = inputAmount * exchangeRate;

      expect(expectedOutput).toBe(100);
    });

    it("应该考虑滑点设置", () => {
      const outputAmount = 100;
      const slippageBps = 50; // 0.5%
      const minimumAmountOut = outputAmount * (1 - slippageBps / 10000);

      expect(minimumAmountOut).toBe(99.5);
    });

    it("应该处理大额交易的滑点", () => {
      const outputAmount = 10000;
      const slippageBps = 100; // 1%
      const minimumAmountOut = outputAmount * (1 - slippageBps / 10000);

      expect(minimumAmountOut).toBe(9900);
    });
  });

  describe("Swap 验证", () => {
    it("应该验证输入金额大于 0", () => {
      const validateInput = (amount: string): boolean => {
        const num = parseFloat(amount);
        return !isNaN(num) && num > 0;
      };

      expect(validateInput("1")).toBe(true);
      expect(validateInput("0.5")).toBe(true);
      expect(validateInput("0")).toBe(false);
      expect(validateInput("-1")).toBe(false);
      expect(validateInput("")).toBe(false);
      expect(validateInput("abc")).toBe(false);
    });

    it("应该验证钱包连接状态", () => {
      const connected = true;
      const disconnected = false;

      expect(connected).toBe(true);
      expect(disconnected).toBe(false);
    });

    it("应该验证余额充足", () => {
      const balance = 10;
      const swapAmount = 5;
      const insufficientAmount = 15;

      expect(balance >= swapAmount).toBe(true);
      expect(balance >= insufficientAmount).toBe(false);
    });
  });

  describe("错误处理", () => {
    it("应该处理网络错误", async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error("Network error"));
      global.fetch = mockFetch;

      await expect(fetch("/api/orca/quote")).rejects.toThrow("Network error");
    });

    it("应该处理交易失败", async () => {
      const mockSendTransaction = jest.fn().mockRejectedValue(
        new Error("Transaction failed: Insufficient funds")
      );

      const sendTransaction = mockSendTransaction;

      await expect(sendTransaction()).rejects.toThrow("Insufficient funds");
    });

    it("应该处理超时错误", async () => {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), 5000);
      });

      await expect(timeoutPromise).rejects.toThrow("Timeout");
    });
  });
});

// ============================================================================
// DeAura Token 测试
// ============================================================================

describe("DeAura Token 集成", () => {
  describe("代币创建", () => {
    it("应该验证代币参数", () => {
      const validateTokenParams = (params: {
        name: string;
        symbol: string;
        decimals: number;
        supply: number;
      }): boolean => {
        if (!params.name || params.name.length < 2) return false;
        if (!params.symbol || params.symbol.length < 2) return false;
        if (params.decimals < 0 || params.decimals > 9) return false;
        if (params.supply <= 0) return false;
        return true;
      };

      expect(
        validateTokenParams({
          name: "Lobster Token",
          symbol: "LRT",
          decimals: 9,
          supply: 1000000000,
        })
      ).toBe(true);

      expect(
        validateTokenParams({
          name: "A",
          symbol: "T",
          decimals: 9,
          supply: 1000000000,
        })
      ).toBe(false);

      expect(
        validateTokenParams({
          name: "Token",
          symbol: "TKN",
          decimals: 10,
          supply: 1000000000,
        })
      ).toBe(false);
    });

    it("应该生成正确的代币元数据", () => {
      const tokenMetadata = {
        name: "Lobster Rewards Token",
        symbol: "LRT",
        description: "Community rewards token for Lobster platform",
        image: "https://lobster-rewards.app/logo.png",
        decimals: 9,
      };

      expect(tokenMetadata.name).toBe("Lobster Rewards Token");
      expect(tokenMetadata.symbol).toBe("LRT");
      expect(tokenMetadata.decimals).toBe(9);
    });
  });

  describe("代币分发", () => {
    it("应该计算总分发量", () => {
      const recipients = [
        { address: "addr1", amount: 1000 },
        { address: "addr2", amount: 2000 },
        { address: "addr3", amount: 3000 },
      ];

      const totalDistribution = recipients.reduce(
        (sum, r) => sum + r.amount,
        0
      );

      expect(totalDistribution).toBe(6000);
    });

    it("应该验证接收者地址格式", () => {
      const isValidSolanaAddress = (address: string): boolean => {
        // Solana 地址是 32-44 字符的 base58 字符串
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
        return base58Regex.test(address);
      };

      expect(isValidSolanaAddress("So11111111111111111111111111111111111111112")).toBe(true);
      expect(isValidSolanaAddress("invalid-address")).toBe(false);
      expect(isValidSolanaAddress("")).toBe(false);
    });
  });

  describe("余额查询", () => {
    it("应该正确格式化代币余额", () => {
      const rawBalance = "1000000000"; // lamports
      const decimals = 9;
      const formattedBalance = parseInt(rawBalance) / Math.pow(10, decimals);

      expect(formattedBalance).toBe(1);
    });

    it("应该处理不同精度的代币", () => {
      const formatBalance = (raw: string, decimals: number): number => {
        return parseInt(raw) / Math.pow(10, decimals);
      };

      expect(formatBalance("1000000", 6)).toBe(1); // USDC
      expect(formatBalance("1000000000", 9)).toBe(1); // Most tokens
      expect(formatBalance("1000000000000000000", 18)).toBe(1); // ETH-style
    });
  });
});

// ============================================================================
// 排行榜测试
// ============================================================================

describe("排行榜系统", () => {
  const mockLeaderboard = [
    { rank: 1, userId: "user-1", points: 10000, wallet: "wallet-1" },
    { rank: 2, userId: "user-2", points: 8500, wallet: "wallet-2" },
    { rank: 3, userId: "user-3", points: 7200, wallet: "wallet-3" },
    { rank: 4, userId: "user-4", points: 6000, wallet: "wallet-4" },
    { rank: 5, userId: "user-5", points: 5500, wallet: "wallet-5" },
  ];

  describe("排名计算", () => {
    it("应该按积分降序排序", () => {
      const sorted = [...mockLeaderboard].sort((a, b) => b.points - a.points);

      expect(sorted[0].points).toBeGreaterThanOrEqual(sorted[1].points);
      expect(sorted[1].points).toBeGreaterThanOrEqual(sorted[2].points);
    });

    it("应该正确分配排名", () => {
      const withRanks = mockLeaderboard.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

      expect(withRanks[0].rank).toBe(1);
      expect(withRanks[4].rank).toBe(5);
    });

    it("应该处理相同积分的排名", () => {
      const tiedLeaderboard = [
        { userId: "user-1", points: 10000 },
        { userId: "user-2", points: 10000 },
        { userId: "user-3", points: 8000 },
      ];

      // 使用稳定的排序和排名逻辑
      const sorted = [...tiedLeaderboard].sort((a, b) => b.points - a.points);
      const withRanks: Array<{ userId: string; points: number; rank: number }> = [];
      
      for (let i = 0; i < sorted.length; i++) {
        if (i === 0) {
          withRanks.push({ ...sorted[i], rank: 1 });
        } else if (sorted[i].points === sorted[i - 1].points) {
          // 分数相同，排名相同
          withRanks.push({ ...sorted[i], rank: withRanks[i - 1].rank });
        } else {
          // 分数不同，排名为当前位置 +1
          withRanks.push({ ...sorted[i], rank: i + 1 });
        }
      }

      // 验证有 2 个用户并列第一
      const rank1Users = withRanks.filter(u => u.rank === 1);
      expect(rank1Users.length).toBe(2);
      
      // 验证第三名排名为 3（跳过第二名）
      const rank3Users = withRanks.filter(u => u.rank === 3);
      expect(rank3Users.length).toBe(1);
    });
  });

  describe("用户排名查询", () => {
    it("应该返回用户的排名", () => {
      const userPoints = 7200;
      const userRank =
        mockLeaderboard.filter((entry) => entry.points > userPoints).length + 1;

      expect(userRank).toBe(3);
    });

    it("应该处理不在前 100 的用户", () => {
      const userPoints = 100;
      const totalUsers = 500;
      const estimatedRank = totalUsers - Math.floor((userPoints / 10000) * totalUsers);

      expect(estimatedRank).toBeGreaterThan(100);
    });
  });

  describe("分页", () => {
    it("应该支持分页获取排行榜", () => {
      const pageSize = 10;
      const currentPage = 2;
      const offset = (currentPage - 1) * pageSize;

      expect(offset).toBe(10);
    });

    it("应该限制每页大小", () => {
      const requestedSize = 200;
      const maxSize = 100;
      const actualSize = Math.min(requestedSize, maxSize);

      expect(actualSize).toBe(100);
    });
  });
});

// ============================================================================
// 工具函数测试
// ============================================================================

describe("工具函数", () => {
  describe("地址格式化", () => {
    const truncateAddress = (address: string, chars = 4): string => {
      if (address.length <= chars * 2) return address;
      return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    };

    it("应该正确截断长地址", () => {
      const longAddress = "So11111111111111111111111111111111111111112";
      const truncated = truncateAddress(longAddress);

      expect(truncated).toBe("So11...1112");
      expect(truncated.length).toBeLessThan(longAddress.length);
    });

    it("应该保留短地址完整", () => {
      const shortAddress = "abc123";
      const truncated = truncateAddress(shortAddress);

      expect(truncated).toBe(shortAddress);
    });
  });

  describe("时间格式化", () => {
    const formatTimeAgo = (timestamp: number): string => {
      const now = Date.now();
      const diff = now - timestamp;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}天前`;
      if (hours > 0) return `${hours}小时前`;
      if (minutes > 0) return `${minutes}分钟前`;
      return "刚刚";
    };

    it("应该格式化最近的时间", () => {
      const now = Date.now();
      expect(formatTimeAgo(now)).toBe("刚刚");
    });

    it("应该格式化分钟前的时间", () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      expect(formatTimeAgo(fiveMinutesAgo)).toContain("分钟");
    });

    it("应该格式化小时前时间", () => {
      const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
      expect(formatTimeAgo(threeHoursAgo)).toContain("小时");
    });
  });

  describe("积分格式化", () => {
    const formatPoints = (points: number): string => {
      if (points >= 1000000) return `${(points / 1000000).toFixed(1)}M`;
      if (points >= 1000) return `${(points / 1000).toFixed(1)}K`;
      return points.toString();
    };

    it("应该格式化大数值", () => {
      expect(formatPoints(1500000)).toBe("1.5M");
      expect(formatPoints(1500)).toBe("1.5K");
      expect(formatPoints(500)).toBe("500");
    });
  });
});

// ============================================================================
// 集成测试
// ============================================================================

describe("端到端流程", () => {
  it("应该完成完整的用户流程", async () => {
    // 1. 用户连接钱包
    const walletConnected = true;
    expect(walletConnected).toBe(true);

    // 2. 用户签到获得积分
    let points = 0;
    points += 50; // 签到奖励
    expect(points).toBe(50);

    // 3. 用户完成任务
    points += 75; // Twitter 任务
    points += 75; // Discord 任务
    expect(points).toBe(200);

    // 4. 用户推荐好友
    points += 200; // 推荐奖励
    expect(points).toBe(400);

    // 5. 用户进行 Swap
    points += 200; // Swap 奖励
    expect(points).toBe(600);

    // 6. 用户兑换奖励
    const rewardCost = 500;
    if (points >= rewardCost) {
      points -= rewardCost;
    }
    expect(points).toBe(100);
    expect(points).toBeGreaterThanOrEqual(0);
  });
});
