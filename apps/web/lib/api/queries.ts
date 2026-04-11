import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// API基础URL
const API_BASE = '/api'

// 聊天相关
export const useChatHistory = () => {
  return useQuery({
    queryKey: ['chat', 'history'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/chat`)
      if (!response.ok) throw new Error('获取聊天历史失败')
      return response.json()
    },
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ message, file_url }: { message: string; file_url?: string }) => {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, file_url }),
      })
      if (!response.ok) throw new Error('发送消息失败')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'history'] })
    },
  })
}

// 爬虫相关
export const useCrawlerTasks = () => {
  return useQuery({
    queryKey: ['crawler', 'tasks'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/crawl`)
      if (!response.ok) throw new Error('获取爬虫任务失败')
      return response.json()
    },
  })
}

export const useStartCrawler = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ platform, category, max_items }: { platform: string; category: string; max_items?: number }) => {
      const response = await fetch(`${API_BASE}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, category, max_items }),
      })
      if (!response.ok) throw new Error('启动爬虫失败')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawler', 'tasks'] })
    },
  })
}

// 文件上传
export const useFileUpload = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('文件上传失败')
      return response.json()
    },
  })
}

// 获取任务状态
export const useTaskStatus = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/crawl?task_id=${taskId}`)
      if (!response.ok) throw new Error('获取任务状态失败')
      return response.json()
    },
    refetchInterval: 5000, // 5秒轮询
    enabled: !!taskId,
  })
}

// 创意工坊模板
export const useWorkshopTemplates = () => {
  return useQuery({
    queryKey: ['workshop', 'templates'],
    queryFn: async () => {
      // 暂时返回模拟数据
      return {
        templates: [
          { id: '1', name: '亚马逊热销分析', category: 'amazon', downloads: 1240 },
          { id: '2', name: '竞品价格监控', category: 'jd', downloads: 890 },
          { id: '3', name: '用户评论情感分析', category: 'taobao', downloads: 567 },
          { id: '4', name: '电商选品策略', category: 'general', downloads: 2100 },
        ],
      }
    },
  })
}

// 可视化相关
export const useVisualizationData = (params: {
  timeRange?: string;
  platforms?: string[];
  categories?: string[];
}) => {
  return useQuery({
    queryKey: ['visualization', 'data', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.timeRange) queryParams.append('time_range', params.timeRange);
      if (params.platforms) params.platforms.forEach(p => queryParams.append('platforms', p));
      if (params.categories) params.categories.forEach(c => queryParams.append('categories', c));

      const response = await fetch(`${API_BASE}/visualization/data?${queryParams}`);
      if (!response.ok) throw new Error('获取可视化数据失败');
      return response.json();
    },
    refetchInterval: 30000, // 30秒轮询
  });
};

export const useVisualizationStats = () => {
  return useQuery({
    queryKey: ['visualization', 'stats'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/visualization/stats`);
      if (!response.ok) throw new Error('获取可视化统计失败');
      return response.json();
    },
  });
};

export const useExportChart = () => {
  return useMutation({
    mutationFn: async ({ format, data }: { format: 'png' | 'pdf' | 'csv'; data: any }) => {
      const response = await fetch(`${API_BASE}/visualization/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, data }),
      });
      if (!response.ok) throw new Error('图表导出失败');
      return response.blob();
    },
  });
};

// AI配置相关
export const useAIConfig = () => {
  return useQuery({
    queryKey: ['ai', 'config'],
    queryFn: async () => {
      // 先从localStorage获取，如果没有则从API获取
      const localConfig = localStorage.getItem('ai_config');
      if (localConfig) {
        return JSON.parse(localConfig);
      }

      const response = await fetch(`${API_BASE}/ai-config`);
      if (!response.ok) throw new Error('获取AI配置失败');
      const data = await response.json();
      localStorage.setItem('ai_config', JSON.stringify(data));
      return data;
    },
  });
};

export const useUpdateAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: any) => {
      // 更新localStorage
      localStorage.setItem('ai_config', JSON.stringify(config));

      // 同步到后端
      const response = await fetch(`${API_BASE}/ai-config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('更新AI配置失败');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'config'] });
    },
  });
};

export const useTestAIAPIKey = () => {
  return useMutation({
    mutationFn: async ({ provider, apiKey }: { provider: string; apiKey: string }) => {
      const response = await fetch(`${API_BASE}/ai-config/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey }),
      });
      if (!response.ok) throw new Error('API密钥测试失败');
      return response.json();
    },
  });
};

export const useAIConfigUsage = () => {
  return useQuery({
    queryKey: ['ai', 'config', 'usage'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/ai-config/usage`);
      if (!response.ok) throw new Error('获取使用统计失败');
      return response.json();
    },
    refetchInterval: 60000, // 1分钟轮询
  });
};

// 团队相关
export const useTeamMembers = (teamId?: string) => {
  return useQuery({
    queryKey: ['team', 'members', teamId],
    queryFn: async () => {
      const url = teamId ? `${API_BASE}/team/members?team_id=${teamId}` : `${API_BASE}/team/members`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('获取团队成员失败');
      return response.json();
    },
    enabled: !!teamId,
  });
};

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberData: any) => {
      const response = await fetch(`${API_BASE}/team/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      if (!response.ok) throw new Error('创建成员失败');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members', variables.teamId] });
    },
  });
};

export const useUpdateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, memberData }: { memberId: string; memberData: any }) => {
      const response = await fetch(`${API_BASE}/team/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });
      if (!response.ok) throw new Error('更新成员失败');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`${API_BASE}/team/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('删除成员失败');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', 'members'] });
    },
  });
};

export const useTeamProjects = (teamId: string) => {
  return useQuery({
    queryKey: ['team', 'projects', teamId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/team/projects?team_id=${teamId}`);
      if (!response.ok) throw new Error('获取团队项目失败');
      return response.json();
    },
    enabled: !!teamId,
  });
};

// 设置相关
export const useUserSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/settings`);
      if (!response.ok) throw new Error('获取用户设置失败');
      return response.json();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch(`${API_BASE}/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('更新个人资料失败');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationSettings: any) => {
      const response = await fetch(`${API_BASE}/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationSettings),
      });
      if (!response.ok) throw new Error('更新通知设置失败');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
};

export const useExportUserData = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/settings/export`);
      if (!response.ok) throw new Error('导出用户数据失败');
      return response.blob();
    },
  });
};