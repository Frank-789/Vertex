import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserAvatar from '@/components/layout/UserAvatar';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// 模拟Supabase客户端
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}));

// 模拟next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('UserAvatar组件', () => {
  const mockSupabaseClient = {
    auth: {
      signOut: jest.fn()
    }
  };

  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn()
  };

  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  beforeEach(() => {
    mockCreateClient.mockReturnValue(mockSupabaseClient as any);
    mockUseRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('渲染无用户状态（登录/注册按钮）', () => {
    render(<UserAvatar user={null} />);

    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByText('注册')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '登录' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: '注册' })).toHaveAttribute('href', '/register');
  });

  it('渲染有用户状态', () => {
    const mockUser = {
      email: 'test@example.com',
      id: 'user1234567890'
    };

    render(<UserAvatar user={mockUser} />);

    // 显示用户头像和邮箱前缀
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('高级会员')).toBeInTheDocument();

    // 点击下拉按钮
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);

    // 下拉菜单应该显示
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('账户 ID: user1234...')).toBeInTheDocument();

    // 检查菜单项
    expect(screen.getByText('个人资料')).toBeInTheDocument();
    expect(screen.getByText('系统设置')).toBeInTheDocument();
    expect(screen.getByText('订阅管理')).toBeInTheDocument();
    expect(screen.getByText('通知中心')).toBeInTheDocument();
    expect(screen.getByText('帮助与支持')).toBeInTheDocument();
    expect(screen.getByText('退出登录')).toBeInTheDocument();
  });

  it('切换下拉菜单', async () => {
    const mockUser = { email: 'test@example.com', id: 'user123' };

    render(<UserAvatar user={mockUser} />);

    // 初始状态下拉菜单应该隐藏
    expect(screen.queryByText('个人资料')).not.toBeInTheDocument();

    // 点击按钮显示下拉菜单
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);

    // 下拉菜单应该显示
    expect(screen.getByText('个人资料')).toBeInTheDocument();

    // 再次点击按钮应该隐藏下拉菜单
    fireEvent.click(dropdownButton);

    // 等待动画完成
    await waitFor(() => {
      expect(screen.queryByText('个人资料')).not.toBeInTheDocument();
    });
  });

  it('点击外部关闭下拉菜单', () => {
    const mockUser = { email: 'test@example.com', id: 'user123' };

    render(<UserAvatar user={mockUser} />);

    // 打开下拉菜单
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);
    expect(screen.getByText('个人资料')).toBeInTheDocument();

    // 模拟点击外部
    fireEvent.mouseDown(document.body);

    // 下拉菜单应该关闭
    expect(screen.queryByText('个人资料')).not.toBeInTheDocument();
  });

  it('退出登录功能', async () => {
    const mockUser = { email: 'test@example.com', id: 'user123' };
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

    render(<UserAvatar user={mockUser} />);

    // 打开下拉菜单
    const dropdownButton = screen.getByRole('button');
    fireEvent.click(dropdownButton);

    // 点击退出登录按钮
    const signOutButton = screen.getByText('退出登录');
    fireEvent.click(signOutButton);

    // 应该调用Supabase signOut
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();

    // 应该跳转到登录页面
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
      expect(mockRouter.refresh).toHaveBeenCalled();
    });
  });

  it('显示用户头像首字母', () => {
    const mockUser = { email: 'test@example.com', id: 'user123' };

    render(<UserAvatar user={mockUser} />);

    // 头像应该显示邮箱首字母'T'
    const avatar = screen.getByText('T');
    expect(avatar).toBeInTheDocument();
  });

  it('用户无邮箱时显示默认头像', () => {
    const mockUser = { email: null, id: 'user123' };

    render(<UserAvatar user={mockUser} />);

    // 头像应该显示默认字母'U'
    const avatar = screen.getByText('U');
    expect(avatar).toBeInTheDocument();
  });
});