'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  User,
  LogOut,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'

export default function UserAvatar({ user }: { user: any }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="/login"
          className="px-4 py-2 rounded-lg bg-primary/20 text-primary-light hover:bg-primary/30 transition"
        >
          登录
        </a>
        <a
          href="/register"
          className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-light transition"
        >
          注册
        </a>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-accent flex items-center justify-center text-white font-medium">
          {user.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium">{user.email?.split('@')[0]}</p>
          <p className="text-xs text-text-muted">高级会员</p>
        </div>
        <ChevronDown size={16} className="text-text-muted" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 glass rounded-xl border border-border shadow-2xl py-2 z-50 animate-fadeIn">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-text-muted">账户 ID: {user.id.slice(0, 8)}...</p>
          </div>

          <div className="py-2">
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition"
            >
              <User size={18} />
              <span>个人资料</span>
            </a>
            <a
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition"
            >
              <Settings size={18} />
              <span>系统设置</span>
            </a>
            <a
              href="/billing"
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition"
            >
              <CreditCard size={18} />
              <span>订阅管理</span>
            </a>
            <a
              href="/notifications"
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition"
            >
              <Bell size={18} />
              <span>通知中心</span>
              <span className="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">3</span>
            </a>
          </div>

          <div className="py-2 border-t border-border">
            <a
              href="/help"
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition"
            >
              <HelpCircle size={18} />
              <span>帮助与支持</span>
            </a>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition text-red-400"
            >
              <LogOut size={18} />
              <span>退出登录</span>
            </button>
          </div>

          <div className="px-4 py-2 border-t border-border text-xs text-text-muted">
            <p>最后登录: 刚刚</p>
          </div>
        </div>
      )}
    </div>
  )
}