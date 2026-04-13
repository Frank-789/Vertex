'use client'

import { MessageSquare, Crawl, FileText, Users, BarChart, Settings, Zap, Shield, Globe, Cpu } from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      id: 'ai-chat',
      title: '智能对话',
      description: '基于先进AI模型的智能对话系统，支持多轮对话、上下文理解和文件对话。',
      icon: MessageSquare,
      capabilities: [
        '多轮上下文对话',
        '文件内容理解和对话',
        '自定义AI配置',
        '对话历史管理',
        '实时流式响应',
      ],
      useCases: [
        '数据分析咨询',
        '文档内容解读',
        '代码编写辅助',
        '创意写作支持',
      ],
    },
    {
      id: 'crawler',
      title: '数据爬取',
      description: '多平台电商数据爬取工具，支持京东、淘宝、亚马逊等主流电商平台。',
      icon: Crawl,
      capabilities: [
        '多平台支持（京东、淘宝、亚马逊等）',
        '智能反爬虫绕过',
        '数据清洗和格式化',
        '定时爬取任务',
        '实时进度监控',
      ],
      useCases: [
        '竞品分析',
        '价格监控',
        '市场趋势分析',
        '商品数据收集',
      ],
    },
    {
      id: 'file-analysis',
      title: '文件分析',
      description: '多格式文件智能分析，支持PDF、Word、Excel、图片等格式的内容提取和分析。',
      icon: FileText,
      capabilities: [
        '多格式支持（PDF、Word、Excel、图片等）',
        'OCR文字识别',
        '表格数据提取',
        '文档结构分析',
        '批量处理',
      ],
      useCases: [
        '合同文档分析',
        '财务报表解读',
        '研究文献总结',
        '数据表格处理',
      ],
    },
    {
      id: 'team-collaboration',
      title: '团队协作',
      description: '完整的团队协作功能，支持团队管理、任务分配、数据共享和权限控制。',
      icon: Users,
      capabilities: [
        '团队创建和管理',
        '角色和权限分配',
        '任务分配和追踪',
        '数据共享和协作',
        '实时评论和反馈',
      ],
      useCases: [
        '团队数据分析项目',
        '跨部门协作',
        '客户服务团队',
        '研发团队协作',
      ],
    },
    {
      id: 'visualization',
      title: '数据可视化',
      description: '丰富的数据可视化工具，将数据转化为直观的图表和报告。',
      icon: BarChart,
      capabilities: [
        '多种图表类型（柱状图、折线图、饼图等）',
        '交互式图表',
        '自定义仪表板',
        '报告生成和导出',
        '实时数据更新',
      ],
      useCases: [
        '业务数据监控',
        '分析报告制作',
        '数据演示展示',
        '实时数据看板',
      ],
    },
    {
      id: 'automation',
      title: '工作流自动化',
      description: '自动化工作流设计，将重复性任务自动化，提升工作效率。',
      icon: Zap,
      capabilities: [
        '可视化工作流设计',
        '条件触发和分支',
        '第三方服务集成',
        '定时任务执行',
        '错误处理和重试',
      ],
      useCases: [
        '数据采集自动化',
        '报告自动生成',
        '通知自动化',
        '数据处理流水线',
      ],
    },
  ]

  const technicalFeatures = [
    {
      icon: Cpu,
      title: '高性能架构',
      description: '基于微服务架构，支持高并发处理和水平扩展。',
    },
    {
      icon: Shield,
      title: '企业级安全',
      description: '端到端加密，多重认证，符合GDPR等数据安全标准。',
    },
    {
      icon: Globe,
      title: '多语言支持',
      description: '支持中英文界面和内容处理，未来支持更多语言。',
    },
    {
      icon: Settings,
      title: '高度可配置',
      description: '灵活的配置选项，支持定制化部署和功能扩展。',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">功能特性</h1>
        <p className="text-xl text-text-muted max-w-3xl mx-auto">
          Vertex AI 集成了先进的AI技术和数据分析工具，为您提供一站式的智能数据解决方案
        </p>
      </div>

      {/* 主要功能 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.id} className="glass rounded-2xl p-6 border border-border hover:border-primary-light/30 transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                    <Icon size={24} className="text-primary-light" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-text-muted mb-6">{feature.description}</p>

                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-sm text-text-muted">主要能力</h4>
                  <ul className="space-y-2">
                    {feature.capabilities.map((capability, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-primary-light"></div>
                        </div>
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-sm text-text-muted">应用场景</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.useCases.map((useCase, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-secondary/50 text-xs"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 技术特性 */}
      <div className="glass rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">技术特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technicalFeatures.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div key={idx} className="text-center">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                  <Icon size={32} className="text-primary-light" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-muted text-sm">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 功能对比 */}
      <div className="glass rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">版本功能对比</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 font-semibold">功能</th>
                <th className="text-left py-4 font-semibold text-center">免费版</th>
                <th className="text-left py-4 font-semibold text-center bg-primary/10">专业版</th>
                <th className="text-left py-4 font-semibold text-center">企业版</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: '智能对话次数', free: '100次/月', pro: '无限', enterprise: '无限' },
                { feature: '文件分析', free: '基础功能', pro: '高级功能', enterprise: '全部功能' },
                { feature: '数据爬取', free: '限量', pro: '无限', enterprise: '无限+定制' },
                { feature: '团队协作成员', free: '1人', pro: '最多5人', enterprise: '不限' },
                { feature: '存储空间', free: '1GB', pro: '10GB', enterprise: '不限' },
                { feature: 'API调用', free: '有限', pro: '无限', enterprise: '无限+优先' },
                { feature: '技术支持', free: '社区支持', pro: '优先支持', enterprise: '专属支持' },
                { feature: '定制功能', free: '不支持', pro: '有限支持', enterprise: '完全支持' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border/30">
                  <td className="py-4">{row.feature}</td>
                  <td className="py-4 text-center">{row.free}</td>
                  <td className="py-4 text-center bg-primary/10 font-medium">{row.pro}</td>
                  <td className="py-4 text-center">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-center mt-8">
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
            选择适合您的版本
          </button>
        </div>
      </div>

      {/* 集成和API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">API集成</h3>
          <p className="text-text-muted mb-6">
            Vertex AI 提供完整的RESTful API，支持与现有系统无缝集成。
          </p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium mb-2">RESTful API</h4>
              <p className="text-sm text-text-muted">标准的HTTP接口，支持JSON格式数据</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium mb-2">Webhook支持</h4>
              <p className="text-sm text-text-muted">实时事件通知和回调机制</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium mb-2">SDK支持</h4>
              <p className="text-sm text-text-muted">Python、JavaScript等主流语言SDK</p>
            </div>
          </div>
          <button className="w-full mt-6 py-3 rounded-xl border border-border font-medium hover:bg-secondary/50 transition">
            查看API文档
          </button>
        </div>

        <div className="glass rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6">第三方集成</h3>
          <p className="text-text-muted mb-6">
            与您常用的工具和服务无缝连接，构建完整的工作流程。
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { name: 'Slack', color: 'bg-purple-500/20 text-purple-300' },
              { name: 'Notion', color: 'bg-gray-500/20 text-gray-300' },
              { name: 'Google Sheets', color: 'bg-green-500/20 text-green-300' },
              { name: 'Zapier', color: 'bg-blue-500/20 text-blue-300' },
              { name: 'Microsoft Teams', color: 'bg-blue-500/20 text-blue-300' },
              { name: 'Salesforce', color: 'bg-blue-500/20 text-blue-300' },
              { name: 'Dropbox', color: 'bg-blue-500/20 text-blue-300' },
              { name: '更多...', color: 'bg-secondary text-text-muted' },
            ].map((service, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl text-center ${service.color}`}
              >
                {service.name}
              </div>
            ))}
          </div>
          <button className="w-full py-3 rounded-xl border border-border font-medium hover:bg-secondary/50 transition">
            查看全部集成
          </button>
        </div>
      </div>

      {/* 开始使用 */}
      <div className="glass rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
        <p className="text-text-muted text-lg mb-8 max-w-2xl mx-auto">
          立即注册，体验Vertex AI的强大功能，提升您的数据分析和AI应用能力。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
            免费试用
          </button>
          <button className="px-8 py-3 rounded-xl border border-border font-medium hover:bg-secondary/50 transition">
            联系销售
          </button>
        </div>
      </div>
    </div>
  )
}