'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, BarChart3, File, Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  uploadTime: string
  progress?: number
  error?: string
}

export default function FilesPage() {
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: '1',
      name: '销售数据.xlsx',
      type: 'excel',
      size: 2.4 * 1024 * 1024, // 2.4 MB
      status: 'completed',
      uploadTime: '2024-04-09 14:30:22'
    },
    {
      id: '2',
      name: '用户评论.csv',
      type: 'csv',
      size: 1.8 * 1024 * 1024, // 1.8 MB
      status: 'completed',
      uploadTime: '2024-04-09 11:15:10'
    },
    {
      id: '3',
      name: '产品描述.txt',
      type: 'text',
      size: 0.5 * 1024 * 1024, // 0.5 MB
      status: 'processing',
      uploadTime: '2024-04-10 09:45:33',
      progress: 75
    },
    {
      id: '4',
      name: '市场报告.pdf',
      type: 'pdf',
      size: 5.2 * 1024 * 1024, // 5.2 MB
      status: 'error',
      uploadTime: '2024-04-10 08:20:15',
      error: '文件格式不受支持'
    }
  ])
  const [dragActive, setDragActive] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'excel': return '📊'
      case 'csv': return '📈'
      case 'pdf': return '📄'
      case 'text': return '📝'
      default: return '📁'
    }
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-500'
      case 'processing': return 'bg-blue-500/20 text-blue-500'
      case 'uploading': return 'bg-yellow-500/20 text-yellow-500'
      case 'error': return 'bg-red-500/20 text-red-500'
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed': return '完成'
      case 'processing': return '处理中'
      case 'uploading': return '上传中'
      case 'error': return '错误'
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      handleFileUpload(file)
    }
  }, [])

  const handleFileUpload = (file: File) => {
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.split('/')[1] || 'unknown',
      size: file.size,
      status: 'uploading',
      uploadTime: new Date().toISOString(),
      progress: 0
    }

    setFiles(prev => [newFile, ...prev])

    // 模拟上传进度
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === newFile.id) {
          const progress = (f.progress || 0) + 10
          if (progress >= 100) {
            clearInterval(interval)
            return {
              ...f,
              status: 'processing',
              progress: 100
            }
          }
          return { ...f, progress }
        }
        return f
      }))
    }, 200)

    // 模拟处理完成
    setTimeout(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === newFile.id && f.status === 'processing') {
          return {
            ...f,
            status: 'completed',
            progress: 100
          }
        }
        return f
      }))
    }, 3000)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleDownload = (file: UploadedFile) => {
    alert(`下载文件: ${file.name}`)
    // 实际实现中这里会触发文件下载
  }

  const handleAnalyze = (file: UploadedFile) => {
    alert(`开始分析文件: ${file.name}`)
    // 实际实现中这里会调用分析API
  }

  const supportedFormats = [
    { name: 'Excel', extensions: ['.xlsx', '.xls'], color: 'bg-green-500' },
    { name: 'CSV', extensions: ['.csv'], color: 'bg-blue-500' },
    { name: 'PDF', extensions: ['.pdf'], color: 'bg-red-500' },
    { name: 'Text', extensions: ['.txt', '.md'], color: 'bg-yellow-500' },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">文件分析</h1>
        <p className="text-text-muted">
          上传并分析多种格式文件，提取关键信息并进行AI智能分析
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 文件上传卡片 */}
        <div className="glass rounded-2xl p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">文件上传</h3>
          <p className="text-sm text-text-muted mb-4">
            支持Excel、CSV、TXT、PDF等多种格式文件上传
          </p>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
              dragActive
                ? 'border-primary-light bg-primary/10'
                : 'border-border hover:border-primary-light'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileInput}
              accept=".xlsx,.xls,.csv,.txt,.pdf,.md"
            />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary-light" />
            </div>
            <p className="text-text-muted">点击或拖拽文件到此处</p>
            <p className="text-xs text-text-muted mt-2">最大文件大小: 50MB</p>
          </div>

          {/* 支持格式 */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-3">支持格式:</p>
            <div className="flex flex-wrap gap-2">
              {supportedFormats.map(format => (
                <div
                  key={format.name}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30"
                >
                  <div className={`w-2 h-2 rounded-full ${format.color}`}></div>
                  <span className="text-sm">{format.name}</span>
                  <span className="text-xs text-text-muted">
                    {format.extensions.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 内容解析卡片 */}
        <div className="glass rounded-2xl p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">内容解析</h3>
          <p className="text-sm text-text-muted mb-4">
            自动识别文件内容，提取结构化数据并进行清洗
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">支持格式:</span>
              <span>.xlsx, .csv, .txt, .pdf</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">最大行数:</span>
              <span>10,000 行</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">编码检测:</span>
              <span>UTF-8, GBK 等</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">自动类型推断:</span>
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs">已启用</span>
            </div>
          </div>
        </div>

        {/* AI智能分析卡片 */}
        <div className="glass rounded-2xl p-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI智能分析</h3>
          <p className="text-sm text-text-muted mb-4">
            基于AI模型进行数据洞察、趋势预测和智能建议
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-light"></div>
              <span className="text-sm">关键指标提取</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="text-sm">趋势分析与预测</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">自动化报告生成</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-sm">情感分析（评论数据）</span>
            </div>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">最近上传的文件</h3>
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary-light text-white text-sm font-medium hover:opacity-90 transition"
          >
            上传新文件
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-text-muted border-b border-border">
                <th className="pb-3">文件名</th>
                <th className="pb-3">类型</th>
                <th className="pb-3">大小</th>
                <th className="pb-3">状态</th>
                <th className="pb-3">上传时间</th>
                <th className="pb-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    暂无文件，点击"上传新文件"开始上传
                  </td>
                </tr>
              ) : (
                files.map(file => (
                  <tr key={file.id} className="text-sm hover:bg-secondary/30 transition">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(file.type)}</span>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-text-muted">ID: {file.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-secondary/30">
                        {file.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4">{formatFileSize(file.size)}</td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(file.status)}`}>
                          {getStatusText(file.status)}
                        </span>
                        {file.status === 'uploading' || file.status === 'processing' ? (
                          <div className="w-24 h-1 bg-secondary/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary-light transition-all"
                              style={{ width: `${file.progress || 0}%` }}
                            ></div>
                          </div>
                        ) : file.status === 'error' ? (
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={12} />
                            <span>{file.error}</span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4">{file.uploadTime}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAnalyze(file)}
                          disabled={file.status !== 'completed'}
                          className={`px-3 py-1 rounded-lg text-sm transition ${
                            file.status === 'completed'
                              ? 'bg-gradient-to-r from-primary to-primary-light text-white hover:opacity-90'
                              : 'bg-secondary/30 text-text-muted cursor-not-allowed'
                          }`}
                        >
                          分析
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={file.status !== 'completed'}
                          className="p-2 rounded-lg hover:bg-secondary/50 transition disabled:opacity-50"
                          title="下载"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}