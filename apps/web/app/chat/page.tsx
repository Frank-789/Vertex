'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Bot, User, Sparkles } from 'lucide-react'
import { useChatHistory, useSendMessage } from '@/lib/api/queries'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '你好！我是Vertex AI助手，可以帮您分析电商数据、抓取商品信息、解读文件内容。请问有什么可以帮您？',
      role: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: chatHistory } = useChatHistory()
  const sendMessageMutation = useSendMessage()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (chatHistory?.messages) {
      setMessages(chatHistory.messages)
    }
  }, [chatHistory])

  const handleSend = async () => {
    if (!input.trim() && !file) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // 如果有文件，先上传文件
      let fileUrl = undefined
      if (file) {
        // TODO: 实现文件上传
        console.log('上传文件:', file.name)
        // 模拟上传
        fileUrl = `file://${file.name}`
        setFile(null)
      }

      // 发送消息到API
      const response = await sendMessageMutation.mutateAsync({
        message: input,
        file_url: fileUrl,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.reply || '收到您的消息，正在处理...',
        role: 'assistant',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: '抱歉，消息发送失败，请稍后重试。',
        role: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="h-full flex flex-col">
      {/* 聊天标题栏 */}
      <div className="glass rounded-xl p-4 mb-6 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">智能对话</h1>
              <p className="text-sm text-text-muted">
                与AI助手交流电商数据分析、市场洞察、文件解读
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg glass border border-border hover:bg-secondary/50 transition flex items-center gap-2">
              <Sparkles size={16} />
              创意模式
            </button>
            <button className="px-4 py-2 rounded-lg glass border border-border hover:bg-secondary/50 transition">
              清空历史
            </button>
          </div>
        </div>
      </div>

      {/* 聊天消息区域 */}
      <div className="flex-1 overflow-y-auto glass rounded-2xl p-6 border border-border mb-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-5 ${message.role === 'user'
                    ? 'bg-primary/20 border border-primary/30 rounded-tr-none'
                    : 'glass border border-border rounded-tl-none'
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {message.role === 'user' ? (
                      <User size={16} className="text-primary-light" />
                    ) : (
                      <Bot size={16} className="text-primary-light" />
                    )}
                    <span className="font-medium">
                      {message.role === 'user' ? '您' : 'Vertex AI'}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-green-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="glass border border-border rounded-2xl rounded-tl-none p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={16} className="text-primary-light" />
                  <span className="font-medium">Vertex AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 文件预览 */}
      {file && (
        <div className="glass rounded-xl p-4 mb-4 border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Paperclip className="w-6 h-6 text-primary-light" />
            </div>
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-text-muted">
                {(file.size / 1024).toFixed(1)} KB · 准备上传
              </p>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-red-400 hover:text-red-300 transition"
          >
            移除
          </button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="glass rounded-2xl p-4 border border-border">
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".txt,.docx,.xlsx,.csv,.pdf,.json"
          />
          <button
            onClick={triggerFileInput}
            className="p-3 rounded-xl glass border border-border hover:bg-secondary/50 transition flex-shrink-0"
            title="上传文件"
          >
            <Paperclip size={20} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入消息...（支持文件上传：Excel, CSV, PDF, Word等）"
              className="w-full bg-secondary/50 border border-border rounded-xl py-3 px-4 pr-12 min-h-[60px] max-h-[200px] resize-y focus:outline-none focus:ring-2 focus:ring-primary-light"
              rows={2}
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <span className="text-xs text-text-muted">Enter发送，Shift+Enter换行</span>
              <button
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !file)}
                className={`p-2 rounded-lg ${isLoading || (!input.trim() && !file)
                    ? 'bg-gray-700 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-light'
                  } transition`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-text-muted">快速提问：</span>
          {[
            '帮我分析亚马逊美妆类目',
            '上传Excel文件进行分析',
            '京东手机销量趋势',
            '生成竞品分析报告',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="text-xs px-3 py-1 rounded-full glass border border-border hover:bg-secondary/50 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}