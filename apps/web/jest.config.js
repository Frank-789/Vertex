/** @type {import('jest').Config} */
const config = {
  // 测试环境
  testEnvironment: 'jest-environment-jsdom',

  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.spec.{js,jsx,ts,tsx}'
  ],

  // 忽略的路径
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/'
  ],

  // 模块文件扩展名
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

  // 模块名映射
  moduleNameMapper: {
    // 处理CSS和静态文件
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js'
  },

  // 设置测试文件
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 收集测试覆盖率
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],

  // 覆盖率目录
  coverageDirectory: '<rootDir>/coverage',

  // 覆盖率报告
  coverageReporters: ['text', 'lcov', 'html'],

  // 测试前转换
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },

  // 全局设置
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  }
};

module.exports = config;