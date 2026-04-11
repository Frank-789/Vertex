'use client'

import { Users, UserPlus, Share2, MessageSquare, Clock } from 'lucide-react'

export default function TeamPage() {
  const members = [
    { id: 1, name: '张伟', role: '管理员', email: 'zhangwei@example.com', status: '在线' },
    { id: 2, name: '李娜', role: '成员', email: 'lina@example.com', status: '在线' },
    { id: 3, name: '王刚', role: '成员', email: 'wanggang@example.com', status: '离线' },
    { id: 4, name: '赵敏', role: '观察员', email: 'zhaomin@example.com', status: '在线' },
  ]

  const projects = [
    { id: 1, name: '亚马逊竞品分析', members: 3, updated: '2小时前' },
    { id: 2, name: '京东市场调研', members: 2, updated: '1天前' },
    { id: 3, name: 'Q4销售报告', members: 4, updated: '3天前' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">团队协作</h1>
        <p className="text-text-muted">
          管理团队成员，共享分析项目，实现高效协作
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧成员管理 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users size={20} />
                团队成员
              </h3>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition">
                <UserPlus size={16} />
                邀请成员
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-text-muted border-b border-border">
                    <th className="pb-3">姓名</th>
                    <th className="pb-3">角色</th>
                    <th className="pb-3">邮箱</th>
                    <th className="pb-3">状态</th>
                    <th className="pb-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="text-sm border-b border-border/30 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-light to-accent"></div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${member.role === '管理员' ? 'bg-purple-500/20 text-purple-500' : 'bg-secondary/50'}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 text-text-muted">{member.email}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${member.status === '在线' ? 'bg-green-500' : 'bg-text-muted'}`}></div>
                          <span>{member.status}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <button className="px-3 py-1 rounded-lg bg-secondary/30 text-sm hover:bg-secondary/50 transition">
                          管理
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <MessageSquare size={20} />
              团队聊天
            </h3>
            <div className="h-64 border border-dashed border-border rounded-xl flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-text-muted mb-2">团队聊天功能待集成</p>
              <p className="text-sm text-text-muted text-center max-w-md">
                实时团队沟通，支持文件共享和项目讨论
              </p>
            </div>
          </div>
        </div>

        {/* 右侧项目共享 */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Share2 size={20} />
                共享项目
              </h3>
              <button className="px-4 py-2 rounded-lg bg-secondary/30 text-sm font-medium hover:bg-secondary/50 transition">
                新建项目
              </button>
            </div>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{project.name}</h4>
                    <span className="px-2 py-1 rounded-full text-xs bg-secondary/50">
                      {project.members}人
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock size={12} />
                    <span>更新于 {project.updated}</span>
                  </div>
                </div>
              ))}
              <div className="p-4 rounded-lg border border-dashed border-border text-center cursor-pointer hover:border-primary-light transition">
                <p className="text-text-muted">+ 创建新项目</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">权限说明</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-purple-500">管</span>
                </div>
                <div>
                  <p className="text-sm font-medium">管理员</p>
                  <p className="text-xs text-text-muted">可管理成员、项目、系统设置</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-light">成</span>
                </div>
                <div>
                  <p className="text-sm font-medium">成员</p>
                  <p className="text-xs text-text-muted">可创建、编辑项目，查看团队数据</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-text-muted">观</span>
                </div>
                <div>
                  <p className="text-sm font-medium">观察员</p>
                  <p className="text-xs text-text-muted">仅可查看项目，无编辑权限</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">团队统计</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">成员总数</span>
                <span className="font-medium">{members.length} 人</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">在线成员</span>
                <span className="font-medium">{members.filter(m => m.status === '在线').length} 人</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">项目总数</span>
                <span className="font-medium">{projects.length} 个</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">活跃项目</span>
                <span className="font-medium">1 个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}