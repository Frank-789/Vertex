'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, CheckCircle, Database, TrendingUp, Clock } from 'lucide-react'

interface Task {
  id: string
  platform: string
  keyword: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  result?: any
  error?: string
  createdAt: string
  finishedAt?: string
}

interface DashboardStats {
  totalTasks: number
  successfulTasks: number
  activeUsers: number
  platformCount: number
  successRate: number
  todayTasks: number
  todayActiveUsers: number
  platformDistribution: Record<string, number>
  taskStatusDistribution: Record<string, number>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    successfulTasks: 0,
    activeUsers: 0,
    platformCount: 4,
    successRate: 0,
    todayTasks: 0,
    todayActiveUsers: 0,
    platformDistribution: {},
    taskStatusDistribution: {},
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    try {
      // 从localStorage加载任务数据
      const saved = localStorage.getItem('crawler_tasks')
      const tasks: Task[] = saved ? JSON.parse(saved) : []

      // 计算统计数据
      const today = new Date().toDateString()
      const todayTasks = tasks.filter(task =>
        new Date(task.createdAt).toDateString() === today
      ).length

      const successfulTasks = tasks.filter(task => task.status === 'completed').length
      const totalTasks = tasks.length
      const successRate = totalTasks > 0 ? Math.round((successfulTasks / totalTasks) * 100) : 0

      // 平台分布
      const platformDistribution: Record<string, number> = {}
      tasks.forEach(task => {
        platformDistribution[task.platform] = (platformDistribution[task.platform] || 0) + 1
      })

      // 任务状态分布
      const taskStatusDistribution: Record<string, number> = {}
      tasks.forEach(task => {
        taskStatusDistribution[task.status] = (taskStatusDistribution[task.status] || 0) + 1
      })

      // 平台数量（支持的平台数）
      const supportedPlatforms = ['amazon', 'jd', 'taobao', 'ebay', 'pdd']
      const platformCount = supportedPlatforms.length

      // 模拟活跃用户数据（从localStorage或随机生成）
      const activeUsers = Math.floor(Math.random() * 50) + 10
      const todayActiveUsers = Math.floor(Math.random() * 20) + 5

      // 最近任务（按创建时间排序）
      const recent = tasks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setStats({
        totalTasks,
        successfulTasks,
        activeUsers,
        platformCount,
        successRate,
        todayTasks,
        todayActiveUsers,
        platformDistribution,
        taskStatusDistribution,
      })
      setRecentTasks(recent)
    } catch (err) {
      console.error('加载仪表板数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'amazon': return 'bg-yellow-500'
      case 'jd': return 'bg-red-500'
      case 'taobao': return 'bg-orange-500'
      case 'ebay': return 'bg-blue-500'
      case 'pdd': return 'bg-pink-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500'
      case 'running': return 'bg-blue-500/20 text-blue-500'
      case 'failed': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'completed': return '完成'
      case 'running': return '进行中'
      case 'failed': return '失败'
      default: return '等待'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">数据仪表板</h1>
        <p className="text-text-muted">
          实时监控系统运行状态、任务进度和数据统计
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-text-muted">加载数据中...</p>
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-muted mb-2 flex items-center gap-2">
                    <Database size={16} />
                    总任务数
                  </h3>
                  <p className="text-3xl font-bold text-primary-light">{stats.totalTasks}</p>
                </div>
                <TrendingUp className="text-primary-light/50" size={24} />
              </div>
              <p className="text-xs text-text-muted mt-1">今日新增: {stats.todayTasks}</p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-muted mb-2 flex items-center gap-2">
                    <CheckCircle size={16} />
                    成功任务
                  </h3>
                  <p className="text-3xl font-bold text-green-500">{stats.successfulTasks}</p>
                </div>
                <CheckCircle className="text-green-500/50" size={24} />
              </div>
              <p className="text-xs text-text-muted mt-1">成功率: {stats.successRate}%</p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-muted mb-2 flex items-center gap-2">
                    <Users size={16} />
                    活跃用户
                  </h3>
                  <p className="text-3xl font-bold text-accent">{stats.activeUsers}</p>
                </div>
                <Users className="text-accent/50" size={24} />
              </div>
              <p className="text-xs text-text-muted mt-1">今日活跃: {stats.todayActiveUsers}</p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-muted mb-2 flex items-center gap-2">
                    <BarChart3 size={16} />
                    平台分布
                  </h3>
                  <p className="text-3xl font-bold text-purple-500">{stats.platformCount}</p>
                </div>
                <BarChart3 className="text-purple-500/50" size={24} />
              </div>
              <p className="text-xs text-text-muted mt-1">支持平台数</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 平台分布图表 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database size={20} />
                平台使用统计
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.platformDistribution).length > 0 ? (
                  Object.entries(stats.platformDistribution).map(([platform, count]) => {
                    const percentage = stats.totalTasks > 0
                      ? Math.round((count / stats.totalTasks) * 100)
                      : 0
                    return (
                      <div key={platform} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform)}`}></div>
                            <span className="font-medium">{platform}</span>
                          </div>
                          <span>{count} 任务 ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPlatformColor(platform)}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl">
                    <p className="text-text-muted">暂无平台数据</p>
                  </div>
                )}
              </div>
            </div>

            {/* 任务状态分布 */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                任务状态分布
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.taskStatusDistribution).length > 0 ? (
                  Object.entries(stats.taskStatusDistribution).map(([status, count]) => {
                    const percentage = stats.totalTasks > 0
                      ? Math.round((count / stats.totalTasks) * 100)
                      : 0
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`w-3 h-3 rounded-full ${
                              status === 'completed' ? 'bg-green-500' :
                              status === 'running' ? 'bg-blue-500' :
                              status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></span>
                            <span className="font-medium">{getStatusText(status as Task['status'])}</span>
                          </div>
                          <span>{count} 任务 ({percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              status === 'completed' ? 'bg-green-500' :
                              status === 'running' ? 'bg-blue-500' :
                              status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl">
                    <p className="text-text-muted">暂无任务数据</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 最近任务 */}
          <div className="glass rounded-2xl p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock size={20} />
                最近任务
              </h3>
              <button
                onClick={loadDashboardData}
                className="text-sm text-primary-light hover:opacity-80 transition"
              >
                刷新
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-text-muted border-b border-border">
                    <th className="pb-3">平台</th>
                    <th className="pb-3">关键词</th>
                    <th className="pb-3">状态</th>
                    <th className="pb-3">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <tr key={task.id} className="text-sm hover:bg-secondary/30 transition">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getPlatformColor(task.platform)}`}></div>
                            <span>{task.platform}</span>
                          </div>
                        </td>
                        <td className="py-3">{task.keyword}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </td>
                        <td className="py-3">{new Date(task.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted">
                        暂无任务数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}