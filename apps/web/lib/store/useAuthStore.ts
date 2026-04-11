import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  checkAuth: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ isLoading: loading }),

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, isLoading: false })
    } catch (error) {
      console.error('检查认证状态失败:', error)
      set({ user: null, isLoading: false })
    }
  },

  signOut: async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      set({ user: null })
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  },
}))