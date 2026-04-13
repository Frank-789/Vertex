'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, Database, Download, Moon, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from '@/components/ui/AvatarUpload'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    getUser()
  }, [supabase])
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    tasks: true,
    updates: true,
  })
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState('中')
  const [dataRetention, setDataRetention] = useState('保留30天')
  const [language, setLanguage] = useState('简体中文')
  const [timezone, setTimezone] = useState('Asia/Shanghai (GMT+8)')

  const tabs = [
    { id: 'profile', name: '个人资料', icon: User },
    { id: 'notifications', name: '通知', icon: Bell },
    { id: 'security', name: '安全', icon: Shield },
    { id: 'storage', name: '存储', icon: Database },
    { id: 'appearance', name: '外观', icon: Moon },
    { id: 'system', name: '系统', icon: Globe },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">系统设置</h1>
        <p className="text-text-muted">
          管理个人偏好、安全设置和系统配置
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧选项卡 */}
        <div className="glass rounded-2xl p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === tab.id
                    ? 'bg-primary/20 text-primary-light'
                    : 'text-text-muted hover:bg-secondary/50'
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* 右侧设置内容 */}
        <div className="lg:col-span-3">
          {/* 个人资料 */}
          {activeTab === 'profile' && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">个人资料</h3>
              {isLoadingUser ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light mx-auto mb-4"></div>
                  <p className="text-text-muted">加载用户信息...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 头像上传组件 */}
                  {user && (
                    <AvatarUpload
                      currentAvatarUrl={user.user_metadata?.avatar_url}
                      userId={user.id}
                      onUploadSuccess={(avatarUrl) => {
                        // 更新本地用户状态
                        setUser({
                          ...user,
                          user_metadata: {
                            ...user.user_metadata,
                            avatar_url: avatarUrl
                          }
                        })
                      }}
                      onUploadError={(error) => {
                        console.error('头像上传失败:', error)
                      }}
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">姓名</label>
                      <input
                        type="text"
                        defaultValue={user?.user_metadata?.name || "张三"}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">邮箱</label>
                      <input
                        type="email"
                        defaultValue={user?.email || "zhangsan@example.com"}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">职位</label>
                      <input
                        type="text"
                        defaultValue={user?.user_metadata?.position || "数据分析师"}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">部门</label>
                      <input
                        type="text"
                        defaultValue={user?.user_metadata?.department || "电商分析部"}
                        className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">个人简介</label>
                    <textarea
                      className="w-full h-24 px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                      defaultValue={user?.user_metadata?.bio || "专注于电商数据分析和市场趋势研究，擅长使用AI工具提升分析效率。"}
                    />
                  </div>
                  <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
                    保存更改
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 通知设置 */}
          {activeTab === 'notifications' && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">通知设置</h3>
              <div className="space-y-4">
                {[
                  { id: 'email', label: '邮件通知', description: '重要事件和每日摘要' },
                  { id: 'push', label: '推送通知', description: '实时任务状态更新' },
                  { id: 'tasks', label: '任务提醒', description: '任务完成和失败通知' },
                  { id: 'updates', label: '系统更新', description: '新功能和维护通知' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-text-muted">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.id as keyof typeof notifications]}
                        onChange={(e) => setNotifications({ ...notifications, [item.id]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 安全设置 */}
          {activeTab === 'security' && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">安全设置</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">当前密码</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">新密码</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">确认新密码</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="twofa" className="rounded border-border" />
                  <label htmlFor="twofa" className="text-sm">
                    启用双重验证 (2FA)
                  </label>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
                  更新密码
                </button>
              </div>
            </div>
          )}

          {/* 存储设置 */}
          {activeTab === 'storage' && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">存储设置</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>存储使用情况</span>
                    <span>0.5 GB / 10 GB</span>
                  </div>
                  <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-light" style={{ width: '5%' }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <p className="text-xs text-text-muted mb-1">文件数</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="bg-secondary/30 rounded-xl p-4">
                    <p className="text-xs text-text-muted mb-1">数据量</p>
                    <p className="text-2xl font-bold">0.5 GB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">数据保留策略</label>
                  <select
                    value={dataRetention}
                    onChange={(e) => setDataRetention(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                  >
                    <option value="保留30天">保留30天</option>
                    <option value="保留90天">保留90天</option>
                    <option value="保留180天">保留180天</option>
                    <option value="永久保留">永久保留</option>
                  </select>
                </div>
                <button className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition flex items-center gap-2">
                  <Download size={16} />
                  导出所有数据
                </button>
              </div>
            </div>
          )}

          {/* 外观设置 */}
          {activeTab === 'appearance' && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">外观设置</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-4">主题</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-primary-light bg-primary/10' : 'border-border bg-secondary/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-900"></div>
                        <span className="text-sm font-medium">深色主题</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-xl border-2 ${theme === 'light' ? 'border-primary-light bg-primary/10' : 'border-border bg-secondary/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gray-100"></div>
                        <span className="text-sm font-medium">浅色主题</span>
                      </div>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">字体大小</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                  >
                    <option value="小">小</option>
                    <option value="中">中</option>
                    <option value="大">大</option>
                  </select>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
                  应用设置
                </button>
              </div>
            </div>
          )}

          {/* 系统设置 */}
          {activeTab === 'system' && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-6">系统设置</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">语言</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                  >
                    <option value="简体中文">简体中文</option>
                    <option value="English">English</option>
                    <option value="日本語">日本語</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">时区</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                  >
                    <option value="Asia/Shanghai (GMT+8)">Asia/Shanghai (GMT+8)</option>
                    <option value="America/New_York (GMT-5)">America/New_York (GMT-5)</option>
                    <option value="Europe/London (GMT+0)">Europe/London (GMT+0)</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="autoupdate" className="rounded border-border" defaultChecked />
                  <label htmlFor="autoupdate" className="text-sm">
                    自动检查更新
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="analytics" className="rounded border-border" defaultChecked />
                  <label htmlFor="analytics" className="text-sm">
                    发送使用情况统计（匿名）
                  </label>
                </div>
                <div className="pt-6 border-t border-border">
                  <button className="px-6 py-3 rounded-xl border border-red-500/30 text-red-500 font-medium hover:bg-red-500/10 transition">
                    恢复默认设置
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}