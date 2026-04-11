'use client'

import { useState } from 'react'
import { Bot, Key, Settings, Zap, BarChart } from 'lucide-react'

export default function AIConfigPage() {
  const [activeModel, setActiveModel] = useState('deepseek')
  const [apiKeys, setApiKeys] = useState({
    deepseek: 'sk-1b1de9af40cb41eeaea80fca0861b5e7',
    doubao: '',
    tongyi: '',
  })
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)

  const models = [
    {
      id: 'deepseek',
      name: 'DeepSeek',
      description: '深度求索AI，支持长文本和代码生成',
      icon: '🔍',
      color: 'bg-blue-500',
    },
    {
      id: 'doubao',
      name: '豆包',
      description: '字节跳动AI助手，中文优化',
      icon: '🎵',
      color: 'bg-red-500',
    },
    {
      id: 'tongyi',
      name: '通义千问',
      description: '阿里云大语言模型',
      icon: '✨',
      color: 'bg-green-500',
    },
    {
      id: 'claude',
      name: 'Claude',
      description: 'Anthropic AI助手，安全性高',
      icon: '🤖',
      color: 'bg-purple-500',
    },
  ]

  const handleSaveConfig = () => {
    alert('配置已保存（演示功能）')
  }

  const handleTestAPI = () => {
    alert('API测试功能待实现')
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">AI配置</h1>
        <p className="text-text-muted">
          配置多AI模型参数，管理API密钥，优化智能分析效果
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧模型选择 */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bot size={20} />
              AI模型选择
            </h3>
            <div className="space-y-3">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => setActiveModel(model.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition ${activeModel === model.id
                    ? 'bg-primary/20 border border-primary-light'
                    : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${model.color} flex items-center justify-center`}>
                    <span className="text-white text-lg">{model.icon}</span>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-text-muted">{model.description}</p>
                  </div>
                  {activeModel === model.id && (
                    <div className="w-2 h-2 rounded-full bg-primary-light"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart size={20} />
              使用统计
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">本月使用量</span>
                  <span className="font-medium">0 tokens</span>
                </div>
                <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-light" style={{ width: '0%' }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-xl p-3">
                  <p className="text-xs text-text-muted mb-1">API调用</p>
                  <p className="text-xl font-bold">0</p>
                </div>
                <div className="bg-secondary/30 rounded-xl p-3">
                  <p className="text-xs text-text-muted mb-1">平均响应</p>
                  <p className="text-xl font-bold">0ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间参数配置 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Key size={20} />
                API密钥管理
              </h3>
              <button
                onClick={handleTestAPI}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition"
              >
                <Zap size={16} />
                测试连接
              </button>
            </div>
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model.id} className="space-y-2">
                  <label className="block text-sm font-medium">
                    {model.name} API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKeys[model.id as keyof typeof apiKeys] || ''}
                      onChange={(e) => setApiKeys({ ...apiKeys, [model.id]: e.target.value })}
                      placeholder={`输入${model.name} API密钥`}
                      className="flex-1 px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                    />
                    <button className="px-4 py-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition">
                      显示
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Settings size={20} />
              模型参数配置
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">温度 (Temperature)</label>
                  <span className="text-text-muted">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-secondary/30 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-light"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>精确 (0)</span>
                  <span>平衡 (0.5)</span>
                  <span>创意 (1)</span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  控制输出随机性，值越高回答越多样
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <label className="font-medium">最大 Token 数</label>
                  <span className="text-text-muted">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-2 bg-secondary/30 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-light"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>500</span>
                  <span>2000</span>
                  <span>4000</span>
                </div>
                <p className="text-xs text-text-muted mt-2">
                  控制生成文本的最大长度
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">系统提示词</label>
              <textarea
                placeholder="例如：你是一个电商数据分析专家，擅长从数据中提取商业洞察..."
                className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/30 border border-border focus:border-primary-light focus:outline-none transition"
                defaultValue="你是一个电商数据分析专家，擅长从商品数据、评论信息和市场趋势中提取商业洞察。请用专业但易懂的语言回答用户问题。"
              />
              <p className="text-xs text-text-muted mt-2">
                指导AI如何回答用户问题，可自定义角色和语气
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">配置状态</h3>
                <p className="text-sm text-text-muted">
                  当前使用模型: {models.find(m => m.id === activeModel)?.name}
                </p>
              </div>
              <button
                onClick={handleSaveConfig}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}