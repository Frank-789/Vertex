'use client'

import { useState } from 'react'
import { Search, Filter, Sparkles, TrendingUp, Users, Download, Share2, Edit3, Play, Plus } from 'lucide-react'
import { useWorkshopTemplates } from '@/lib/api/queries'

interface Template {
  id: string
  name: string
  description: string
  category: string
  downloads: number
  author: string
  tags: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
}

export default function WorkshopPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedComplexity, setSelectedComplexity] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: templatesData } = useWorkshopTemplates()

  // 模拟模板数据
  const templates: Template[] = [
    {
      id: '1',
      name: '亚马逊热销商品分析',
      description: '自动爬取亚马逊各类目热销商品，分析价格、评价、销量趋势',
      category: 'amazon',
      downloads: 1240,
      author: '电商专家Alex',
      tags: ['爬虫', '数据分析', '可视化'],
      complexity: 'intermediate',
    },
    {
      id: '2',
      name: '竞品价格监控模板',
      description: '监控竞争对手价格变化，自动预警，生成价格策略报告',
      category: 'jd',
      downloads: 890,
      author: '价格策略师',
      tags: ['监控', '预警', '报告'],
      complexity: 'beginner',
    },
    {
      id: '3',
      name: '用户评论情感分析',
      description: '分析商品评论情感倾向，提取关键反馈，生成情感报告',
      category: 'taobao',
      downloads: 567,
      author: 'AI研究员',
      tags: ['NLP', '情感分析', '评论挖掘'],
      complexity: 'advanced',
    },
    {
      id: '4',
      name: '电商选品策略生成器',
      description: '基于市场数据生成选品建议，评估竞争程度，预测销售潜力',
      category: 'general',
      downloads: 2100,
      author: '选品大师',
      tags: ['选品', '市场分析', '预测'],
      complexity: 'intermediate',
    },
    {
      id: '5',
      name: '社交媒体热度追踪',
      description: '追踪社交媒体上的产品讨论热度，识别爆款趋势',
      category: 'social',
      downloads: 743,
      author: '社交媒体分析师',
      tags: ['社交媒体', '趋势', '热度'],
      complexity: 'intermediate',
    },
    {
      id: '6',
      name: '库存预测与优化',
      description: '基于销售历史预测库存需求，优化库存水平，减少缺货',
      category: 'inventory',
      downloads: 432,
      author: '供应链专家',
      tags: ['预测', '库存', '优化'],
      complexity: 'advanced',
    },
  ]

  const categories = [
    { id: 'all', name: '全部类目' },
    { id: 'amazon', name: '亚马逊' },
    { id: 'jd', name: '京东' },
    { id: 'taobao', name: '淘宝' },
    { id: 'ebay', name: 'eBay' },
    { id: 'social', name: '社交媒体' },
    { id: 'inventory', name: '库存管理' },
    { id: 'general', name: '通用分析' },
  ]

  const complexities = [
    { id: 'all', name: '全部难度' },
    { id: 'beginner', name: '入门' },
    { id: 'intermediate', name: '中级' },
    { id: 'advanced', name: '高级' },
  ]

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesComplexity = selectedComplexity === 'all' || template.complexity === selectedComplexity
    return matchesSearch && matchesCategory && matchesComplexity
  })

  return (
    <div className="space-y-6">
      {/* 标题和操作栏 */}
      <div className="glass rounded-2xl p-6 border border-border">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">创意工坊</h1>
                <p className="text-text-muted">探索、创建、分享电商分析模板和流程</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-3 rounded-xl glass border border-border hover:bg-secondary/50 transition flex items-center gap-2">
              <Share2 size={18} />
              分享模板
            </button>
            <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:opacity-90 transition flex items-center gap-2">
              <Plus size={18} />
              新建模板
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="glass rounded-2xl p-6 border border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="搜索模板、标签、作者..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-12 focus:outline-none focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-secondary/50 border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="bg-secondary/50 border border-border rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-light"
            >
              {complexities.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
            <div className="flex bg-secondary/50 border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-primary/20 text-primary-light' : 'hover:bg-secondary/50'}`}
              >
                网格
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-primary/20 text-primary-light' : 'hover:bg-secondary/50'}`}
              >
                列表
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 模板展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="glass rounded-2xl p-6 border border-border hover:border-primary-light transition group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${template.complexity === 'beginner'
                      ? 'bg-green-500/20 text-green-400'
                      : template.complexity === 'intermediate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                    {template.complexity === 'beginner' ? '入门' :
                      template.complexity === 'intermediate' ? '中级' : '高级'}
                  </span>
                  <span className="px-2 py-1 rounded text-xs glass border border-border">
                    {categories.find(c => c.id === template.category)?.name}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary-light transition">
                  {template.name}
                </h3>
              </div>
              <TrendingUp className="text-text-muted" size={20} />
            </div>

            <p className="text-text-muted mb-4">{template.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs glass border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs">
                  {template.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{template.author}</p>
                  <p className="text-xs text-text-muted">
                    <Download size={12} className="inline mr-1" />
                    {template.downloads} 次使用
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg glass border border-border hover:bg-secondary/50 transition">
                  <Play size={16} />
                </button>
                <button className="p-2 rounded-lg glass border border-border hover:bg-secondary/50 transition">
                  <Edit3 size={16} />
                </button>
                <button className="p-2 rounded-lg glass border border-border hover:bg-secondary/50 transition">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 创建新模板提示 */}
      <div className="glass rounded-2xl p-8 border border-dashed border-primary/30 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-primary-light" />
        </div>
        <h3 className="text-xl font-bold mb-2">创建您的第一个模板</h3>
        <p className="text-text-muted mb-6 max-w-2xl mx-auto">
          使用AI助手生成自定义分析流程，或从零开始构建。分享给社区，帮助他人解决问题。
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 rounded-xl glass border border-border hover:bg-secondary/50 transition flex items-center gap-2">
            <Sparkles size={18} />
            AI生成模板
          </button>
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition flex items-center gap-2">
            <Plus size={18} />
            从空白创建
          </button>
        </div>
      </div>
    </div>
  )
}