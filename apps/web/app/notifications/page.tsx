'use client'

import { useState } from 'react'
import { Bell, Check, Clock, AlertCircle, Info, MessageSquare, Calendar, Download } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '爬虫任务完成',
      description: '京东商品爬取任务已完成，共获取125件商品数据。',
      time: '刚刚',
      read: false,
      type: 'success' as const,
      icon: Check,
    },
    {
      id: 2,
      title: '新消息回复',
      description: '您有一条新的AI对话回复，请查看详情。',
      time: '10分钟前',
      read: false,
      type: 'message' as const,
      icon: MessageSquare,
    },
    {
      id: 3,
      title: '系统维护通知',
      description: '计划于本周六凌晨2:00-4:00进行系统维护，期间服务可能短暂中断。',
      time: '2小时前',
      read: true,
      type: 'info' as const,
      icon: Info,
    },
    {
      id: 4,
      title: '存储空间警告',
      description: '您的存储空间已使用85%，建议清理不需要的文件。',
      time: '5小时前',
      read: true,
      type: 'warning' as const,
      icon: AlertCircle,
    },
    {
      id: 5,
      title: '数据分析报告',
      description: '月度数据分析报告已生成，点击查看详细报告。',
      time: '1天前',
      read: true,
      type: 'info' as const,
      icon: Download,
    },
    {
      id: 6,
      title: '订阅即将到期',
      description: '您的专业版订阅将在7天后到期，请及时续费。',
      time: '2天前',
      read: true,
      type: 'warning' as const,
      icon: Calendar,
    },
  ])

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">通知中心</h1>
            <p className="text-text-muted">
              查看和管理所有系统通知
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-lg bg-primary/20 text-primary-light text-sm font-medium hover:bg-primary/30 transition"
              >
                全部标记为已读
              </button>
            )}
            <div className="relative">
              <Bell size={20} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧：通知设置 */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">通知设置</h3>
            <div className="space-y-4">
              {[
                { id: 'email', label: '邮件通知', enabled: true },
                { id: 'push', label: '推送通知', enabled: false },
                { id: 'task', label: '任务通知', enabled: true },
                { id: 'system', label: '系统通知', enabled: true },
                { id: 'marketing', label: '营销信息', enabled: false },
              ].map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.enabled}
                      onChange={() => {}}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="font-medium mb-4">通知频率</h4>
              <select className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition">
                <option>实时通知</option>
                <option>每小时汇总</option>
                <option>每日摘要</option>
                <option>每周摘要</option>
              </select>
            </div>
          </div>
        </div>

        {/* 右侧：通知列表 */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">所有通知</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">筛选:</span>
                <select className="px-3 py-2 rounded-lg bg-secondary/30 border border-border text-sm focus:outline-none">
                  <option>全部通知</option>
                  <option>未读通知</option>
                  <option>系统通知</option>
                  <option>任务通知</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={48} className="mx-auto text-text-muted mb-4" />
                  <p className="text-text-muted">暂无通知</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.icon
                  const typeColors = {
                    success: 'text-accent',
                    warning: 'text-yellow-500',
                    info: 'text-blue-500',
                    message: 'text-primary-light',
                  }

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl transition ${notification.read ? 'bg-secondary/30' : 'bg-primary/10 border border-primary-light/30'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${typeColors[notification.type]}/20`}>
                          <Icon size={20} className={typeColors[notification.type]} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className={`font-medium ${notification.read ? '' : 'text-primary-light'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-text-muted mt-1">{notification.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-text-muted">{notification.time}</span>
                              <Clock size={12} className="text-text-muted" />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="px-3 py-1 rounded-lg bg-primary/20 text-primary-light text-xs font-medium hover:bg-primary/30 transition"
                              >
                                标记为已读
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="px-3 py-1 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/50 transition"
                            >
                              删除
                            </button>
                            <button className="px-3 py-1 rounded-lg bg-secondary text-xs font-medium hover:bg-secondary/50 transition">
                              查看详情
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                上一页
              </button>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${page === 1 ? 'bg-primary-light text-white' : 'bg-secondary hover:bg-secondary/50'}`}
                  >
                    {page}
                  </button>
                ))}
                <span className="text-text-muted">...</span>
              </div>
              <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}