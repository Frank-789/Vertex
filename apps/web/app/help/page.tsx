'use client'

import { useState } from 'react'
import { HelpCircle, Book, MessageSquare, Phone, Mail, Search, ChevronRight, ExternalLink } from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('getting-started')

  const categories = [
    {
      id: 'getting-started',
      name: '快速开始',
      description: '新手指南和基本操作',
      icon: Book,
      articles: [
        { id: 1, title: '如何创建第一个AI对话', views: '1.2k' },
        { id: 2, title: '文件上传和分析指南', views: '856' },
        { id: 3, title: '电商数据爬取教程', views: '642' },
        { id: 4, title: '团队协作功能使用', views: '423' },
      ],
    },
    {
      id: 'ai-chat',
      name: '智能对话',
      description: 'AI聊天功能相关',
      icon: MessageSquare,
      articles: [
        { id: 5, title: '如何优化AI回答质量', views: '2.1k' },
        { id: 6, title: '文件对话功能详解', views: '1.3k' },
        { id: 7, title: '自定义AI配置指南', views: '987' },
        { id: 8, title: '对话历史管理', views: '754' },
      ],
    },
    {
      id: 'crawler',
      name: '数据爬取',
      description: '电商平台爬虫使用',
      icon: ExternalLink,
      articles: [
        { id: 9, title: '京东商品爬取指南', views: '1.5k' },
        { id: 10, title: '淘宝数据获取教程', views: '1.2k' },
        { id: 11, title: '亚马逊数据分析', views: '932' },
        { id: 12, title: '爬虫任务管理和监控', views: '687' },
      ],
    },
    {
      id: 'billing',
      name: '账户与订阅',
      description: '付费和账户管理',
      icon: HelpCircle,
      articles: [
        { id: 13, title: '订阅计划对比', views: '2.3k' },
        { id: 14, title: '如何升级或降级套餐', views: '1.1k' },
        { id: 15, title: '发票和账单管理', views: '856' },
        { id: 16, title: '账户安全设置', views: '721' },
      ],
    },
  ]

  const faqs = [
    {
      question: 'Vertex AI支持哪些文件格式？',
      answer: '支持PDF、Word、Excel、TXT、图片等多种格式。具体请查看文件分析功能说明。',
    },
    {
      question: '爬虫功能是否合法？',
      answer: '我们的爬虫严格遵守robots.txt协议和网站使用条款，仅用于合法的数据分析和研究目的。',
    },
    {
      question: '如何提高AI回答的准确性？',
      answer: '提供更详细的上下文信息、上传相关参考文件、使用更具体的提问方式都可以提高回答质量。',
    },
    {
      question: '数据存储在哪里？安全吗？',
      answer: '所有数据都存储在加密的云端服务器，我们采用银行级安全标准保护您的数据隐私。',
    },
    {
      question: '支持团队协作吗？',
      answer: '专业版和企业版支持团队协作功能，可以创建团队、分配角色、共享分析结果。',
    },
    {
      question: '如何联系技术支持？',
      answer: '可通过在线客服、邮件support@vertex-ai.com或工作时间拨打400-123-4567联系我们。',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">帮助与支持</h1>
        <p className="text-text-muted">
          获取使用帮助、文档和技术支持
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="搜索帮助文档、常见问题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {['AI对话', '文件分析', '数据爬取', '团队协作', '账户设置'].map((tag) => (
              <button
                key={tag}
                className="px-3 py-1 rounded-full bg-secondary/50 text-sm hover:bg-secondary transition"
                onClick={() => setSearchQuery(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要帮助内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 左侧：帮助分类 */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">帮助文档</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <div
                    key={category.id}
                    className={`p-6 rounded-xl border-2 transition cursor-pointer ${activeCategory === category.id ? 'border-primary-light bg-primary/10' : 'border-border bg-secondary/30 hover:bg-secondary/50'}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 rounded-full bg-primary/20">
                        <Icon size={20} className="text-primary-light" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{category.name}</h4>
                        <p className="text-sm text-text-muted">{category.description}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {category.articles.slice(0, 3).map((article) => (
                        <div
                          key={article.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/30 transition"
                        >
                          <span className="text-sm">{article.title}</span>
                          <ChevronRight size={16} className="text-text-muted" />
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                      查看全部 {category.articles.length} 篇文章
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 右侧：联系方式 */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold mb-6">联系我们</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="p-3 rounded-full bg-primary/20">
                  <MessageSquare size={20} className="text-primary-light" />
                </div>
                <div>
                  <p className="font-medium">在线客服</p>
                  <p className="text-sm text-text-muted">实时在线解答</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="p-3 rounded-full bg-primary/20">
                  <Phone size={20} className="text-primary-light" />
                </div>
                <div>
                  <p className="font-medium">电话支持</p>
                  <p className="text-sm text-text-muted">400-123-4567</p>
                  <p className="text-xs text-text-muted">工作日 9:00-18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <div className="p-3 rounded-full bg-primary/20">
                  <Mail size={20} className="text-primary-light" />
                </div>
                <div>
                  <p className="font-medium">邮件支持</p>
                  <p className="text-sm text-text-muted">support@vertex-ai.com</p>
                  <p className="text-xs text-text-muted">24小时内回复</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="font-medium mb-4">紧急问题</h4>
              <p className="text-sm text-text-muted mb-4">
                如遇系统故障或紧急问题，请优先通过在线客服联系我们。
              </p>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
                联系在线客服
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 常见问题 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">常见问题 (FAQ)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 rounded-xl bg-secondary/30">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-primary/20">
                  <HelpCircle size={16} className="text-primary-light" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">{faq.question}</h4>
                  <p className="text-sm text-text-muted">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition">
            查看更多常见问题
          </button>
        </div>
      </div>

      {/* 社区和资源 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="glass rounded-2xl p-6">
          <h4 className="font-semibold mb-4">视频教程</h4>
          <p className="text-sm text-text-muted mb-4">
            观看我们的视频教程，快速上手各项功能。
          </p>
          <button className="w-full py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
            观看教程
          </button>
        </div>
        <div className="glass rounded-2xl p-6">
          <h4 className="font-semibold mb-4">开发者文档</h4>
          <p className="text-sm text-text-muted mb-4">
            API接口文档和开发指南，支持二次开发。
          </p>
          <button className="w-full py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
            查看API文档
          </button>
        </div>
        <div className="glass rounded-2xl p-6">
          <h4 className="font-semibold mb-4">用户社区</h4>
          <p className="text-sm text-text-muted mb-4">
            加入我们的用户社区，交流使用经验。
          </p>
          <button className="w-full py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
            加入社区
          </button>
        </div>
      </div>
    </div>
  )
}