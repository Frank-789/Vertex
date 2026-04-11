'use client'

import { useState, useEffect } from 'react'
import { Database, Play, Clock, Download, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const platformItems = [
  { name: '亚马逊', value: 'amazon', color: 'bg-yellow-500' },
  { name: '京东', value: 'jd', color: 'bg-red-500' },
  { name: '淘宝', value: 'taobao', color: 'bg-orange-500' },
  { name: 'eBay', value: 'ebay', color: 'bg-blue-500' },
  { name: '拼多多', value: 'pdd', color: 'bg-pink-500' },
]

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

export default function CrawlerPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('jd')
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('electronics')
  const [maxItems, setMaxItems] = useState(50)
  const [isRunning, setIsRunning] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [taskHistory, setTaskHistory] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { value: 'electronics', label: '电子产品' },
    { value: 'fashion', label: '时尚服饰' },
    { value: 'home', label: '家居用品' },
    { value: 'beauty', label: '美容护肤' },
    { value: 'sports', label: '运动户外' },
    { value: 'books', label: '图书音像' },
  ]

  // 加载任务历史
  useEffect(() => {
    loadTaskHistory()
  }, [])

  const loadTaskHistory = async () => {
    try {
      // 从localStorage加载任务历史（模拟）
      const saved = localStorage.getItem('crawler_tasks')
      if (saved) {
        setTaskHistory(JSON.parse(saved))
      }
    } catch (err) {
      console.error('加载任务历史失败:', err)
    }
  }

  const saveTask = (task: Task) => {
    const updated = [task, ...taskHistory]
    setTaskHistory(updated)
    localStorage.setItem('crawler_tasks', JSON.stringify(updated))
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updated = taskHistory.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
    setTaskHistory(updated)
    localStorage.setItem('crawler_tasks', JSON.stringify(updated))

    if (currentTask?.id === taskId) {
      setCurrentTask(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const handleStartCrawl = async () => {
    if (!keyword.trim()) {
      setError('请输入搜索关键词')
      return
    }

    setError(null)
    setIsRunning(true)

    const newTask: Task = {
      id: Date.now().toString(),
      platform: selectedPlatform,
      keyword,
      status: 'running',
      progress: 0,
      createdAt: new Date().toISOString(),
    }

    setCurrentTask(newTask)
    saveTask(newTask)

    try {
      // 调用API
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          category,
          max_items: maxItems,
          keyword, // 添加keyword参数
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      // 更新任务状态
      updateTask(newTask.id, {
        status: 'completed',
        progress: 100,
        result: data,
        finishedAt: new Date().toISOString(),
      })
      setCurrentTask(null)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误'
      setError(`抓取失败: ${errorMessage}`)
      updateTask(newTask.id, {
        status: 'failed',
        error: errorMessage,
        finishedAt: new Date().toISOString(),
      })
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="text-green-500" />
      case 'running': return <Clock size={14} className="text-blue-500" />
      case 'failed': return <XCircle size={14} className="text-red-500" />
      default: return <Clock size={14} className="text-gray-500" />
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

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500'
      case 'running': return 'bg-blue-500/20 text-blue-500'
      case 'failed': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const handleDownloadResult = (task: Task) => {
    if (!task.result) {
      alert('任务无结果可下载')
      return
    }

    const dataStr = JSON.stringify(task.result, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `crawl_${task.platform}_${task.keyword}_${task.createdAt}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">爬虫任务</h1>
        <p className="text-text-muted">
          配置并执行多平台数据抓取任务，实时监控抓取进度
        </p>
      </div>

      {error && (
        <div className="mb-6 glass rounded-2xl p-4 border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧配置面板 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Database size={20} />
              平台选择
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              {platformItems.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => setSelectedPlatform(platform.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition ${selectedPlatform === platform.value
                    ? 'bg-primary/20 border border-primary-light'
                    : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">
                      {platform.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{platform.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  搜索关键词
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="例如：智能手机、笔记本电脑..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  商品类目
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                抓取数量：{maxItems} 个商品
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={maxItems}
                onChange={(e) => setMaxItems(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary/30 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-light"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>10</span>
                <span>50</span>
                <span>100</span>
                <span>150</span>
                <span>200</span>
              </div>
            </div>

            <button
              onClick={handleStartCrawl}
              disabled={isRunning}
              className={`w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-3 font-medium transition ${isRunning
                ? 'bg-secondary/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-primary-light hover:opacity-90'
                }`}
            >
              <Play size={20} />
              {isRunning ? '抓取进行中...' : '开始抓取任务'}
            </button>
          </div>

          {/* 当前任务进度 */}
          {currentTask && (
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} />
                当前任务
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{currentTask.platform} - {currentTask.keyword}</span>
                    <span>{currentTask.progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-300"
                      style={{ width: `${currentTask.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-text-muted">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentTask.status)}
                    <span>状态: {getStatusText(currentTask.status)}</span>
                  </div>
                  <div className="mt-1">开始时间: {new Date(currentTask.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧任务历史 */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">任务历史</h3>
            <button
              onClick={() => taskHistory.length > 0 && handleDownloadResult(taskHistory[0])}
              disabled={taskHistory.length === 0}
              className="p-2 rounded-lg hover:bg-secondary/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="space-y-4">
            {taskHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-text-muted">暂无历史任务</p>
                <p className="text-sm text-text-muted mt-2">
                  完成任务后会显示在此处
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {taskHistory.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition cursor-pointer"
                    onClick={() => setCurrentTask(task)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${task.status === 'completed' ? 'bg-green-500' : task.status === 'running' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium truncate">{task.platform} - {task.keyword}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted space-y-1">
                      <div>抓取数量: {maxItems}</div>
                      <div>时间: {new Date(task.createdAt).toLocaleString()}</div>
                      {task.finishedAt && (
                        <div>完成: {new Date(task.finishedAt).toLocaleString()}</div>
                      )}
                      {task.error && (
                        <div className="text-red-500 truncate">错误: {task.error}</div>
                      )}
                    </div>
                    {task.status === 'completed' && task.result && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownloadResult(task)
                        }}
                        className="mt-3 w-full py-2 text-xs rounded-lg bg-primary/20 hover:bg-primary/30 transition"
                      >
                        下载结果 ({task.result.count || 0} 条数据)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}