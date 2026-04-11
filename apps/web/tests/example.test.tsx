import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';

// 一个简单的测试
describe('示例测试', () => {
  it('1 + 1 应该等于 2', () => {
    expect(1 + 1).toBe(2);
  });

  it('应该能够渲染文本', () => {
    render(<div>测试文本</div>);
    expect(screen.getByText('测试文本')).toBeInTheDocument();
  });
});

// 模拟一个简单的React组件测试
describe('简单的组件测试', () => {
  it('渲染按钮', () => {
    render(<button>点击我</button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('点击我')).toBeInTheDocument();
  });
});