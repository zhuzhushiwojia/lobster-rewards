/**
 * Jest Configuration for Lobster Rewards
 */

module.exports = {
  // 测试环境
  testEnvironment: "jsdom",
  
  // 测试文件匹配模式
  testMatch: [
    "**/__tests__/**/*.test.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  
  // 模块文件扩展名
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  
  // 转换配置
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  
  // 转换忽略
  transformIgnorePatterns: [
    "/node_modules/(?!(?:@solana|@orca|@wallet-standard)/)"
  ],
  
  // 模块名称映射
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js"
  },
  
  // 设置文件
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  
  // 覆盖率配置
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "!app/**/*.d.ts",
    "!app/**/node_modules/**"
  ],
  
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  
  // 详细输出
  verbose: true,
  
  // 超时设置
  testTimeout: 10000,
  
  // 清除 mocks
  clearMocks: true,
  
  // 收集覆盖率
  collectCoverage: false,
  
  // 覆盖率报告目录
  coverageDirectory: "coverage",
  
  // 覆盖率报告格式
  coverageReporters: ["text", "lcov", "html"]
};
