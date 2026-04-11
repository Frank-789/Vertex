import { create } from 'zustand'

interface CrawlerTask {
  id: string
  platform: string
  category: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  createdAt: Date
}

interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number // 自动消失时间（毫秒），0表示不自动消失
  createdAt: Date
}

type ThemeMode = 'light' | 'dark' | 'system'

interface AppState {
  // 侧边栏状态
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  // 平台选择
  selectedPlatform: string
  setSelectedPlatform: (platform: string) => void

  // 爬虫任务
  crawlerTasks: CrawlerTask[]
  addCrawlerTask: (task: Omit<CrawlerTask, 'id' | 'createdAt'>) => void
  updateCrawlerTask: (id: string, updates: Partial<CrawlerTask>) => void
  removeCrawlerTask: (id: string) => void

  // 主题设置
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void

  // 基于主题模式的实际暗黑模式状态（计算属性）
  darkMode: boolean

  // 文件上传
  uploadProgress: number
  setUploadProgress: (progress: number) => void

  // 错误和通知管理
  notifications: AppNotification[]
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void

  // 全局加载状态
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // 错误处理
  lastError: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  selectedPlatform: 'amazon',
  setSelectedPlatform: (platform) => set({ selectedPlatform: platform }),

  crawlerTasks: [],
  addCrawlerTask: (task) => set((state) => ({
    crawlerTasks: [
      ...state.crawlerTasks,
      {
        ...task,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
      },
    ],
  })),
  updateCrawlerTask: (id, updates) => set((state) => ({
    crawlerTasks: state.crawlerTasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),
  removeCrawlerTask: (id) => set((state) => ({
    crawlerTasks: state.crawlerTasks.filter((task) => task.id !== id),
  })),

  // 主题设置 - 从localStorage初始化
  themeMode: (() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('themeMode') as ThemeMode;
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  })(),

  darkMode: (() => {
    if (typeof window === 'undefined') return true;
    const themeMode = (() => {
      const saved = localStorage.getItem('themeMode') as ThemeMode;
      return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    })();
    if (themeMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return themeMode === 'dark';
  })(),

  setThemeMode: (mode) => {
    const isDark = mode === 'dark' || (mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    set({ themeMode: mode, darkMode: isDark });
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
      // 应用主题
      applyTheme(mode);
    }
  },

  toggleTheme: () => {
    const { themeMode } = get();
    const nextMode: ThemeMode =
      themeMode === 'light' ? 'dark' :
      themeMode === 'dark' ? 'system' : 'light';
    get().setThemeMode(nextMode);
  },

  toggleDarkMode: () => {
    get().toggleTheme();
  },


  uploadProgress: 0,
  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  // 通知管理
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [
      ...state.notifications,
      {
        ...notification,
        id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
      },
    ],
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  clearNotifications: () => set({ notifications: [] }),

  // 全局加载状态
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  // 错误处理
  lastError: null,
  setError: (error) => set({ lastError: error }),
}))

// 应用主题到document
function applyTheme(mode: ThemeMode) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
}

// 监听系统主题变化
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { themeMode } = useAppStore.getState();
    if (themeMode === 'system') {
      applyTheme('system');
    }
  });
}