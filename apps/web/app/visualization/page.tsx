'use client'

import { BarChart3, LineChart, PieChart, Filter, Download, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useVisualizationData, useVisualizationStats, useExportChart } from '@/lib/api/queries'
import { useAppStore } from '@/lib/store/useAppStore'

// Recharts图表组件
function SimpleChart({ type, dataType, data: externalData }: { type: string; dataType: string; data?: any[] }) {
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 生成模拟数据
  const generateMockData = () => {
    setIsLoading(true)

    // 模拟API调用延迟
    setTimeout(() => {
      let data = []
      const categories = ['京东', '亚马逊', '淘宝', 'eBay', '拼多多']

      if (dataType === 'sales') {
        // 销售额数据
        data = categories.map((cat, i) => ({
          name: cat,
          value: Math.floor(Math.random() * 10000) + 5000,
          color: i === 0 ? '#8b5cf6' : i === 1 ? '#10b981' : i === 2 ? '#3b82f6' : i === 3 ? '#f59e0b' : '#ef4444'
        }))
      } else if (dataType === 'reviews') {
        // 评论数据
        data = categories.map((cat, i) => ({
          name: cat,
          value: Math.floor(Math.random() * 500) + 100,
          color: i === 0 ? '#8b5cf6' : i === 1 ? '#10b981' : i === 2 ? '#3b82f6' : i === 3 ? '#f59e0b' : '#ef4444'
        }))
      } else if (dataType === 'prices') {
        // 价格数据
        data = categories.map((cat, i) => ({
          name: cat,
          value: Math.floor(Math.random() * 500) + 50,
          color: i === 0 ? '#8b5cf6' : i === 1 ? '#10b981' : i === 2 ? '#3b82f6' : i === 3 ? '#f59e0b' : '#ef4444'
        }))
      } else if (dataType === 'categories') {
        // 类目数据
        data = ['电子产品', '服饰', '家居', '美妆', '食品'].map((cat, i) => ({
          name: cat,
          value: Math.floor(Math.random() * 100) + 20,
          color: i === 0 ? '#8b5cf6' : i === 1 ? '#10b981' : i === 2 ? '#3b82f6' : i === 3 ? '#f59e0b' : '#ef4444'
        }))
      }

      setChartData(data)
      setIsLoading(false)
    }, 300)
  }

  // 初始化数据
  useEffect(() => {
    if (externalData && externalData.length > 0) {
      // 使用外部数据
      setIsLoading(false)
      setChartData(externalData)
    } else {
      // 生成模拟数据
      generateMockData()
    }
  }, [type, dataType, externalData])

  // 渲染Recharts图表
  const renderRechartsChart = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">加载中...</div>
        </div>
      )
    }

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">暂无数据</div>
        </div>
      )
    }

    const chartProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' && (
          <RechartsLineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8b5cf6" activeDot={{ r: 8 }} />
          </RechartsLineChart>
        )}
        {type === 'bar' && (
          <RechartsBarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#10b981" />
          </RechartsBarChart>
        )}
        {type === 'pie' && (
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        )}
      </ResponsiveContainer>
    )
  }

  return (
    <div className="relative" style={{ width: '100%', height: '400px' }}>
      {renderRechartsChart()}
    </div>
  )
}


export default function VisualizationPage() {
  const [selectedChart, setSelectedChart] = useState('line')
  const [selectedData, setSelectedData] = useState('sales')
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['jd', 'amazon', 'taobao', 'ebay'])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['electronics', 'clothing', 'home', 'beauty', 'food'])
  const [autoRefresh, setAutoRefresh] = useState(false)

  const { addNotification, setLoading } = useAppStore()

  // API查询
  const { data: visualizationData, isLoading: dataLoading, refetch: refetchData } = useVisualizationData({
    timeRange,
    platforms: selectedPlatforms,
    categories: selectedCategories
  })

  const { data: statsData, isLoading: statsLoading } = useVisualizationStats()

  const { mutate: exportChart, isPending: isExporting } = useExportChart()

  const chartTypes = [
    { id: 'line', name: '折线图', icon: LineChart, color: 'bg-blue-500' },
    { id: 'bar', name: '柱状图', icon: BarChart3, color: 'bg-green-500' },
    { id: 'pie', name: '饼图', icon: PieChart, color: 'bg-purple-500' },
  ]

  const dataSets = [
    { id: 'sales', name: '销售额趋势' },
    { id: 'reviews', name: '评论数量' },
    { id: 'prices', name: '价格分布' },
    { id: 'categories', name: '类目占比' },
  ]

  const platformOptions = [
    { id: 'jd', name: '京东' },
    { id: 'amazon', name: '亚马逊' },
    { id: 'taobao', name: '淘宝' },
    { id: 'ebay', name: 'eBay' },
    { id: 'pinduoduo', name: '拼多多' }
  ]

  const categoryOptions = [
    { id: 'electronics', name: '电子产品' },
    { id: 'clothing', name: '服饰' },
    { id: 'home', name: '家居' },
    { id: 'beauty', name: '美妆' },
    { id: 'food', name: '食品' }
  ]

  // 处理平台选择变化
  const handlePlatformChange = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId))
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId])
    }
  }

  // 处理类目选择变化
  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId))
    } else {
      setSelectedCategories([...selectedCategories, categoryId])
    }
  }

  // 处理导出图表
  const handleExportChart = (format: 'png' | 'pdf' | 'csv') => {
    exportChart(
      { format, data: visualizationData },
      {
        onSuccess: (blob) => {
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `visualization_${format}.${format}`
          a.click()
          window.URL.revokeObjectURL(url)
          addNotification({
            type: 'success',
            title: '导出成功',
            message: `图表已导出为${format.toUpperCase()}格式`
          })
        },
        onError: (error) => {
          addNotification({
            type: 'error',
            title: '导出失败',
            message: error.message || '图表导出失败'
          })
        }
      }
    )
  }

  // 处理刷新数据
  const handleRefreshData = () => {
    refetchData()
    addNotification({
      type: 'info',
      title: '数据刷新',
      message: '正在刷新可视化数据...'
    })
  }

  // 转换API数据为图表数据
  const transformDataForChart = () => {
    if (!visualizationData?.aggregated_data || visualizationData.aggregated_data.length === 0) {
      return []
    }

    const aggregatedData = visualizationData.aggregated_data

    // 根据selectedData选择要显示的字段
    let dataField = 'total_sales'
    let labelField = 'platform'

    if (selectedData === 'reviews') {
      dataField = 'total_reviews'
    } else if (selectedData === 'prices') {
      dataField = 'avg_price'
    } else if (selectedData === 'categories') {
      dataField = 'total_sales' // 对于类目，默认使用销售额
      labelField = 'category'
    }

    // 按平台或类目分组汇总
    const groupedData: Record<string, number> = {}

    aggregatedData.forEach((item: any) => {
      const key = item[labelField]
      const value = item[dataField]

      if (!groupedData[key]) {
        groupedData[key] = 0
      }
      groupedData[key] += value
    })

    // 转换为图表数据格式
    const chartData = Object.entries(groupedData).map(([name, value], index) => {
      const colors = ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#6366f1', '#ec4899']
      return {
        name,
        value: Math.round(value * 100) / 100, // 保留两位小数
        color: colors[index % colors.length]
      }
    })

    // 按值排序（从大到小）
    return chartData.sort((a, b) => b.value - a.value)
  }

  // 获取图表数据
  const chartData = transformDataForChart()

  // 统计卡片数据
  const dataPointCount = visualizationData?.total_records || 0
  const platformCount = selectedPlatforms.length
  const updateFrequency = autoRefresh ? '实时' : '手动'

  // 时间范围显示文本
  const getTimeRangeText = () => {
    switch (timeRange) {
      case '7d': return '7天'
      case '30d': return '30天'
      case '90d': return '90天'
      case '1y': return '1年'
      default: return timeRange
    }
  }

  // 统计信息
  const statsSummary = statsData?.stats?.summary || {
    total_sales: 0,
    total_reviews: 0,
    avg_price: 0,
    avg_conversion: 0,
    platform_count: 0,
    category_count: 0
  }

  // 自动刷新效果
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (autoRefresh) {
      interval = setInterval(() => {
        refetchData()
      }, 30000) // 30秒刷新一次
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, refetchData])

  // 设置全局加载状态
  useEffect(() => {
    setLoading(dataLoading || statsLoading)
  }, [dataLoading, statsLoading, setLoading])

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">可视化分析</h1>
        <p className="text-text-muted">
          交互式数据可视化，多维度分析电商数据趋势和分布
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧控制面板 */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Filter size={20} />
              图表配置
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">图表类型</label>
                <div className="space-y-2">
                  {chartTypes.map((chart) => (
                    <button
                      key={chart.id}
                      onClick={() => setSelectedChart(chart.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${selectedChart === chart.id
                        ? 'bg-primary/20 border border-primary-light'
                        : 'bg-secondary/30 hover:bg-secondary/50'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${chart.color} flex items-center justify-center`}>
                        <chart.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium">{chart.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">数据集</label>
                <div className="space-y-2">
                  {dataSets.map((dataset) => (
                    <button
                      key={dataset.id}
                      onClick={() => setSelectedData(dataset.id)}
                      className={`w-full text-left p-3 rounded-lg transition ${selectedData === dataset.id
                        ? 'bg-primary/20 border border-primary-light'
                        : 'bg-secondary/30 hover:bg-secondary/50'
                        }`}
                    >
                      <span className="text-sm font-medium">{dataset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">数据筛选</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">时间范围</label>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border focus:border-primary-light focus:outline-none"
                >
                  <option value="7d">最近7天</option>
                  <option value="30d">最近30天</option>
                  <option value="90d">最近90天</option>
                  <option value="1y">最近1年</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">平台筛选</label>
                <div className="space-y-2">
                  {platformOptions.map((platform) => (
                    <label key={platform.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => handlePlatformChange(platform.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{platform.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">类目筛选</label>
                <div className="space-y-2">
                  {categoryOptions.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧图表区域 */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold">数据可视化图表</h3>
                <p className="text-sm text-text-muted">
                  {chartTypes.find(c => c.id === selectedChart)?.name} -{' '}
                  {dataSets.find(d => d.id === selectedData)?.name}
                </p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition">
                <Download size={16} />
                导出图表
              </button>
            </div>

            {/* 交互式图表 */}
            <div className="relative">
              <SimpleChart type={selectedChart} dataType={selectedData} data={chartData} />

              {/* 图表控制栏 */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    const event = new Event('refreshChart')
                    window.dispatchEvent(event)
                  }}
                  className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition"
                  title="刷新数据"
                >
                  <RefreshCw size={16} className="text-text-muted" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="auto-refresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-border"
                  />
                  <label htmlFor="auto-refresh" className="text-text-muted cursor-pointer">
                    自动刷新
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-muted mb-1">数据点数量</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-muted mb-1">时间范围</p>
                <p className="text-2xl font-bold">7天</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-muted mb-1">平台数量</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-sm text-text-muted mb-1">更新频率</p>
                <p className="text-2xl font-bold">实时</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">数据统计</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">总数据量</span>
                  <span className="font-medium">0 条记录</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">数据完整性</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">更新日期</span>
                  <span className="font-medium">2024-04-10</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">数据来源</span>
                  <span className="font-medium">爬虫抓取</span>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">导出选项</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PNG 图片</span>
                    <span className="text-xs text-text-muted">高清图像</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">PDF 报告</span>
                    <span className="text-xs text-text-muted">可打印格式</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CSV 数据</span>
                    <span className="text-xs text-text-muted">原始数据</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}