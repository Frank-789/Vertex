'use client'

import { useState } from 'react'
import { User, Mail, Briefcase, Building, Calendar, MapPin } from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: '张三',
    email: 'zhangsan@example.com',
    position: '数据分析师',
    department: '电商分析部',
    bio: '专注于电商数据分析和市场趋势研究，擅长使用AI工具提升分析效率。',
    location: '上海',
    joinDate: '2024-01-15',
    phone: '+86 138 0013 8000',
  })

  const handleSave = () => {
    setIsEditing(false)
    // TODO: 实际保存到API
    console.log('保存个人资料:', profile)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">个人资料</h1>
        <p className="text-text-muted">
          管理您的个人资料和账户信息
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：头像和个人信息概览 */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-light to-accent mb-4 flex items-center justify-center text-white text-4xl font-bold">
                {profile.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold mb-1">{profile.name}</h2>
              <p className="text-text-muted mb-4">{profile.position}</p>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="w-full px-4 py-2 rounded-xl bg-primary/20 text-primary-light font-medium hover:bg-primary/30 transition mb-4"
              >
                {isEditing ? '取消编辑' : '编辑资料'}
              </button>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-text-muted" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase size={16} className="text-text-muted" />
                  <span>{profile.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-text-muted" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-text-muted" />
                  <span>加入于 {profile.joinDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：编辑表单 */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6">详细资料</h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">姓名</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">邮箱</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">职位</label>
                  <input
                    type="text"
                    value={profile.position}
                    onChange={(e) => setProfile({...profile, position: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">部门</label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">所在地</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">电话</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">个人简介</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  disabled={!isEditing}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition disabled:opacity-50"
                />
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition"
                >
                  保存更改
                </button>
              )}
            </div>
          </div>

          {/* 账户安全部分 */}
          <div className="glass rounded-2xl p-6 mt-6">
            <h3 className="text-lg font-semibold mb-6">账户安全</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <p className="font-medium">双重验证 (2FA)</p>
                  <p className="text-sm text-text-muted">增强账户安全性</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-primary/20 text-primary-light text-sm font-medium hover:bg-primary/30 transition">
                  启用
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <p className="font-medium">更改密码</p>
                  <p className="text-sm text-text-muted">定期更新密码确保安全</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                  更改
                </button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
                <div>
                  <p className="font-medium">登录历史</p>
                  <p className="text-sm text-text-muted">查看最近的登录活动</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition">
                  查看
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}