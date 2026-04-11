import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '@/components/layout/Sidebar';
import { usePathname } from 'next/navigation';

// 模拟next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

// 模拟next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Sidebar组件', () => {
  const mockUser = { email: 'test@example.com' };
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('渲染未折叠状态', () => {
    render(<Sidebar user={mockUser} />);

    // 检查Logo文本
    expect(screen.getByText('Vertex AI')).toBeInTheDocument();
    expect(screen.getByText('电商智能体')).toBeInTheDocument();

    // 检查导航项
    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('智能对话')).toBeInTheDocument();
    expect(screen.getByText('数据仪表板')).toBeInTheDocument();

    // 检查用户信息
    expect(screen.getByText('test')).toBeInTheDocument(); // 邮箱前缀
    expect(screen.getByText('高级会员')).toBeInTheDocument();

    // 检查平台选择
    expect(screen.getByText('数据平台')).toBeInTheDocument();
    expect(screen.getByText('亚马逊')).toBeInTheDocument();
    expect(screen.getByText('京东')).toBeInTheDocument();

    // 检查新建分析任务按钮
    expect(screen.getByText('新建分析任务')).toBeInTheDocument();
  });

  it('渲染折叠状态', () => {
    // 点击折叠按钮
    const { container } = render(<Sidebar user={mockUser} />);
    const collapseButton = screen.getByRole('button', { name: /chevron-left/i });
    fireEvent.click(collapseButton);

    // 检查折叠后Logo文本消失
    expect(screen.queryByText('Vertex AI')).not.toBeInTheDocument();
    expect(screen.queryByText('电商智能体')).not.toBeInTheDocument();

    // 导航项文本应该消失
    expect(screen.queryByText('首页')).not.toBeInTheDocument();
    expect(screen.queryByText('智能对话')).not.toBeInTheDocument();

    // 平台选择应该消失
    expect(screen.queryByText('数据平台')).not.toBeInTheDocument();
    expect(screen.queryByText('亚马逊')).not.toBeInTheDocument();

    // 用户信息应该消失
    expect(screen.queryByText('test')).not.toBeInTheDocument();

    // 新建分析任务按钮应该只显示图标
    expect(screen.queryByText('新建分析任务')).not.toBeInTheDocument();
  });

  it('高亮当前活动路径', () => {
    mockUsePathname.mockReturnValue('/chat');
    render(<Sidebar user={mockUser} />);

    // 智能对话应该被高亮
    const chatLink = screen.getByText('智能对话').closest('a');
    expect(chatLink).toHaveClass('bg-primary/20');
  });

  it('切换平台选择', () => {
    render(<Sidebar user={mockUser} />);

    // 默认选中亚马逊
    const amazonButton = screen.getByText('亚马逊').closest('button');
    expect(amazonButton).toHaveClass('bg-primary/20');

    // 点击京东
    const jdButton = screen.getByText('京东').closest('button');
    fireEvent.click(jdButton);

    // 京东应该被选中
    expect(jdButton).toHaveClass('bg-primary/20');
    // 亚马逊应该取消选中
    expect(amazonButton).not.toHaveClass('bg-primary/20');
  });

  it('无用户时渲染', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Sidebar user={null} />);

    // 用户信息区域不应该显示
    expect(screen.queryByText('高级会员')).not.toBeInTheDocument();

    // 其他部分正常显示
    expect(screen.getByText('Vertex AI')).toBeInTheDocument();
    expect(screen.getByText('首页')).toBeInTheDocument();
  });
});