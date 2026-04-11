import { ArrowRight, Bot, Database, FileText, Sparkles, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: '智能对话',
      description: '与AI助手交流，获取电商数据分析、市场趋势、竞品洞察',
      color: 'from-purple-500 to-pink-500',
      href: '/chat',
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: '多平台爬虫',
      description: '支持亚马逊、京东、淘宝、eBay等主流电商平台数据抓取',
      color: 'from-blue-500 to-cyan-500',
      href: '/crawler',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: '文件分析',
      description: '上传Excel、CSV、PDF等文件，AI自动解析并生成报告',
      color: 'from-green-500 to-emerald-500',
      href: '/files',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: '创意工坊',
      description: '自定义分析流程，分享模板，协作编辑，AI生成脚本',
      color: 'from-orange-500 to-red-500',
      href: '/workshop',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: '数据可视化',
      description: '交互式图表、实时仪表板、趋势预测与报告生成',
      color: 'from-indigo-500 to-purple-500',
      href: '/visualization',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: '团队协作',
      description: '多人协同分析、权限管理、项目分享与版本控制',
      color: 'from-rose-500 to-pink-500',
      href: '/team',
    },
  ]

  const quickActions = [
    { label: '开始对话', action: '前往聊天界面', href: '/chat' },
    { label: '抓取亚马逊数据', action: '选择类目并启动爬虫', href: '/crawler?platform=amazon' },
    { label: '上传文件分析', action: '支持Excel/CSV/PDF', href: '/files' },
    { label: '浏览创意模板', action: '查看社区热门分析流程', href: '/workshop' },
  ]

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <div className="glass rounded-2xl p-8 border border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              欢迎使用 <span className="gradient-text">Vertex AI</span>
            </h1>
            <p className="text-text-muted text-lg">
              高级电商智能体平台 · 数据爬取 · AI分析 · 可视化报告
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/chat"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium flex items-center gap-2 hover:opacity-90 transition"
            >
              开始使用 <ArrowRight size={18} />
            </Link>
            <Link
              href="/guide"
              className="px-6 py-3 rounded-xl glass border border-border font-medium hover:bg-secondary/50 transition"
            >
              查看指南
            </Link>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div>
        <h2 className="text-xl font-bold mb-4">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              href={action.href}
              className="glass rounded-xl p-5 border border-border hover:border-primary-light transition group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-primary-light"></div>
                </div>
                <ArrowRight className="text-text-muted group-hover:text-primary-light transition" />
              </div>
              <h3 className="font-semibold mb-1">{action.label}</h3>
              <p className="text-sm text-text-muted">{action.action}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 核心功能 */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">核心功能</h2>
          <Link href="/features" className="text-primary-light hover:text-primary transition text-sm">
            查看全部功能 →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Link
              key={idx}
              href={feature.href}
              className="glass rounded-2xl p-6 border border-border hover:border-primary-light transition group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5`}>
                <div className="text-white">{feature.icon}</div>
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-text-muted mb-4">{feature.description}</p>
              <div className="flex items-center text-primary-light group-hover:gap-2 transition-all">
                <span className="font-medium">开始使用</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-border lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">平台数据概览</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-text-muted">今日活跃用户</p>
              <p className="text-2xl font-bold">1,248</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-text-muted">爬虫任务数</p>
              <p className="text-2xl font-bold">356</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-text-muted">分析报告</p>
              <p className="text-2xl font-bold">892</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-text-muted">创意模板</p>
              <p className="text-2xl font-bold">127</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-border">
          <h3 className="text-lg font-bold mb-4">最近活动</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary-light"></div>
              <div>
                <p className="text-sm">用户 @alex 创建了新的分析流程</p>
                <p className="text-xs text-text-muted">2分钟前</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <div>
                <p className="text-sm">亚马逊美妆类目爬取任务完成</p>
                <p className="text-xs text-text-muted">15分钟前</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm">新用户注册欢迎</p>
                <p className="text-xs text-text-muted">1小时前</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
