/**
 * Jest Setup File
 * 
 * 在每个测试文件之前运行
 */

require("@testing-library/jest-dom");

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
});

// 全局超时设置
jest.setTimeout(10000);

// 清理 mocks
afterEach(() => {
  jest.clearAllMocks();
});
