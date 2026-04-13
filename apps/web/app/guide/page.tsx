'use client'

import { useState } from 'react'
import { BookOpen, Play, ChevronRight, Check, Clock, Users, BarChart } from 'lucide-react'

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = [
    {
      id: 'getting-started',
      title: '快速开始',
      description: '新用户入门指南',
      steps: [
        { id: 1, title: '注册与登录', duration: '5分钟', completed: true },
        { id: 2, title: '界面导览', duration: '10分钟', completed: true },
        { id: 3, title: '创建第一个项目', duration: '15分钟', completed: false },
      ],
    },
    {
      id: 'ai-chat',
      title: '智能对话',
      description: '掌握AI对话功能',
      steps: [
        { id: 4, title: '基础对话技巧', duration: '10分钟', completed: true },
        { id: 5, title: '文件对话功能', duration: '15分钟', completed: false },
        { id: 6, title: '高级提示词编写', duration: '20分钟', completed: false },
      ],
    },
    {
      id: 'crawler',
      title: '数据爬取',
      description: '电商数据获取指南',
      steps: [
        { id: 7, title: '京东爬虫入门', duration: '20分钟', completed: false },
        { id: 8, title: '淘宝数据采集', duration: '25分钟', completed: false },
        { id: 9, title: '爬虫任务管理', duration: '15分钟', completed: false },
      ],
    },
    {
      id: 'analysis',
      title: '数据分析',
      description: '数据分析和可视化',
      steps: [
        { id: 10, title: '基础数据分析', duration: '20分钟', completed: false },
        { id: 11, title: '高级可视化技巧', duration: '25分钟', completed: false },
        { id: 12, title: '团队协作分析', duration: '15分钟', completed: false },
      ],
    },
  ]

  const tutorials = [
    {
      id: 1,
      title: '电商数据分析全流程',
      description: '从数据爬取到分析报告的完整流程',
      duration: '45分钟',
      level: '中级',
      students: 1234,
      thumbnail: '数据分析',
    },
    {
      id: 2,
      title: 'AI对话高效工作流',
      description: '如何利用AI对话提升工作效率',
      duration: '30分钟',
      level: '初级',
      students: 2345,
      thumbnail: 'AI对话',
    },
    {
      id: 3,
      title: '多平台数据整合',
      description: '整合京东、淘宝等多平台数据的技巧',
      duration: '60分钟',
      level: '高级',
      students: 876,
      thumbnail: '数据整合',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">使用指南</h1>
        <p className="text-text-muted">
          系统化的学习路径和教程，助您快速掌握Vertex AI
        </p>
      </div>

      {/* 学习路径 */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">学习路径</h3>
            <p className="text-text-muted">按照推荐顺序学习，效果更佳</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
              进度: 25%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`p-6 rounded-xl border-2 transition cursor-pointer ${activeSection === section.id ? 'border-primary-light bg-primary/10' : 'border-border bg-secondary/30 hover:bg-secondary/50'}`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <BookOpen size={20} className="text-primary-light" />
                </div>
                <div>
                  <h4 className="font-semibold">{section.title}</h4>
                  <p className="text-sm text-text-muted">{section.description}</p>
                </div>
              </div>
              <div className="space-y-3">
                {section.steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-black/20"
                  >
                    <div className="flex items-center gap-3">
                      {step.completed ? (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-border"></div>
                      )}
                      <span className="text-sm">{step.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <Clock size={12} />
                      {step.duration}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition flex items-center justify-center gap-2">
                开始学习
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 视频教程 */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">视频教程</h3>
            <p className="text-text-muted">观看视频教程，直观学习各项功能</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary-light text-sm font-medium hover:bg-primary/30 transition">
            查看全部教程
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutorials.map((tutorial) => (
            <div key={tutorial.id} className="rounded-xl overflow-hidden border border-border bg-secondary/30 hover:bg-secondary/50 transition">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <Play size={48} className="text-primary-light mx-auto mb-2" />
                  <p className="font-medium">{tutorial.thumbnail}</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-semibold mb-2">{tutorial.title}</h4>
                <p className="text-sm text-text-muted mb-4">{tutorial.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-text-muted" />
                      <span>{tutorial.duration}</span>
                    </div>
                    <div className="px-2 py-1 rounded bg-primary/20 text-primary-light text-xs">
                      {tutorial.level}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-text-muted" />
                    <span>{tutorial.students}</span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
                  立即学习
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最佳实践 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">最佳实践</h3>
          <div className="space-y-4">
            {[
              {
                title: '高效数据爬取',
                tips: ['选择合适的爬取时间', '设置合理的请求间隔', '使用关键词过滤', '定期检查爬虫状态'],
              },
              {
                title: '优质AI对话',
                tips: ['提供详细的上下文', '使用具体的提问方式', '上传相关参考文件', '迭代优化提示词'],
              },
              {
                title: '团队协作效率',
                tips: ['明确分工和权限', '统一数据分析标准', '定期同步进度', '建立知识库'],
              },
            ].map((practice, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-secondary/30">
                <h4 className="font-medium mb-3">{practice.title}</h4>
                <ul className="space-y-2">
                  {practice.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-accent" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-6">学习资源</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium mb-2">官方文档</h4>
              <p className="text-sm text-text-muted mb-3">完整的功能说明和API文档</p>
              <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                访问文档
              </button>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium mb-2">示例项目</h4>
              <p className="text-sm text-text-muted mb-3">实际应用案例和模板</p>
              <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                查看示例
              </button>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30">
              <h4 className="font-medium mb-2">社区论坛</h4>
              <p className="text-sm text-text-muted mb-3">与其他用户交流经验</p>
              <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                加入讨论
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 学习进度统计 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-6">学习进度</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">3</div>
            <p className="text-text-muted">已完成课程</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">12</div>
            <p className="text-text-muted">总课程数</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">8h 30m</div>
            <p className="text-text-muted">总学习时长</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">25%</div>
            <p className="text-text-muted">整体进度</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>学习进度</span>
            <span>25%</span>
          </div>
          <div className="w-full h-3 bg-secondary/30 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-light" style={{ width: '25%' }}></div>
          </div>
        </div>
        <div className="text-center mt-6">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition">
            继续学习
          </button>
        </div>
      </div>
    </div>
  )
}