'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  LayoutDashboard,
  FileText,
  Settings,
  BarChart3,
  Users,
  Bot,
  Database,
  CloudUpload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Home,
  Workflow,
} from 'lucide-react'

const navItems = [
  { name: '首页', href: '/', icon: Home },
  { name: '智能对话', href: '/chat', icon: MessageSquare },
  { name: '创意工坊', href: '/workshop', icon: Sparkles },
  { name: '数据仪表板', href: '/dashboard', icon: LayoutDashboard },
  { name: '文件分析', href: '/files', icon: FileText },
  { name: '爬虫任务', href: '/crawler', icon: Database },
  { name: '可视化分析', href: '/visualization', icon: BarChart3 },
  { name: '团队协作', href: '/team', icon: Users },
  { name: 'AI配置', href: '/ai-config', icon: Bot },
  { name: '系统设置', href: '/settings', icon: Settings },
]

const platformItems = [
  { name: '亚马逊', value: 'amazon', color: 'bg-yellow-500' },
  { name: '京东', value: 'jd', color: 'bg-red-500' },
  { name: '淘宝', value: 'taobao', color: 'bg-orange-500' },
  { name: 'eBay', value: 'ebay', color: 'bg-blue-500' },
  { name: '拼多多', value: 'pdd', color: 'bg-pink-500' },
]

export default function Sidebar({ user }: { user: any }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('amazon')

  return (
    <aside className={`glass border-r border-border h-screen sticky top-0 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo区域 */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl gradient-text">Vertex AI</h1>
                <p className="text-xs text-text-muted">电商智能体</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto">
              <Workflow className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-secondary transition"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* 用户信息 */}
      {!collapsed && user && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-accent"></div>
            <div className="flex-1">
              <p className="font-medium text-sm">{user.email?.split('@')[0]}</p>
              <p className="text-xs text-text-muted">高级会员</p>
            </div>
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                      ? 'bg-primary/20 text-primary-light border-l-4 border-primary-light'
                      : 'hover:bg-secondary/50 text-text-muted hover:text-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* 平台选择 */}
        {!collapsed && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              数据平台
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {platformItems.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => setSelectedPlatform(platform.value)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm transition ${selectedPlatform === platform.value
                      ? 'bg-primary/20 text-primary-light border border-primary-light'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                >
                  <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* 底部按钮 */}
      <div className="p-4 border-t border-border">
        {!collapsed ? (
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition">
            <CloudUpload size={18} />
            <span>新建分析任务</span>
          </button>
        ) : (
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium flex items-center justify-center">
            <CloudUpload size={18} />
          </button>
        )}
      </div>
    </aside>
  )
}