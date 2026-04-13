'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Upload, X, Loader2, User, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userId: string
  onUploadSuccess?: (avatarUrl: string) => void
  onUploadError?: (error: string) => void
}

export default function AvatarUpload({
  currentAvatarUrl,
  userId,
  onUploadSuccess,
  onUploadError
}: AvatarUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error')
      setStatusMessage('只支持 JPEG、PNG、GIF、WebP 格式的图片')
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus('error')
      setStatusMessage('图片大小不能超过 5MB')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadStatus('idle')
    setStatusMessage('')
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadStatus('idle')
    setStatusMessage('正在上传...')

    try {
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const response = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || '上传失败')
      }

      setUploadStatus('success')
      setStatusMessage('头像上传成功！')

      // 更新预览URL
      if (data.url) {
        setPreviewUrl(data.url)
      }

      // 调用成功回调
      if (onUploadSuccess && data.url) {
        onUploadSuccess(data.url)
      }

      // 3秒后清除状态消息
      setTimeout(() => {
        setUploadStatus('idle')
        setStatusMessage('')
      }, 3000)

    } catch (error) {
      console.error('上传头像失败:', error)
      setUploadStatus('error')
      setStatusMessage(error instanceof Error ? error.message : '上传失败，请重试')

      if (onUploadError) {
        onUploadError(error instanceof Error ? error.message : '上传失败')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl(currentAvatarUrl || null)
    setUploadStatus('idle')
    setStatusMessage('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm('确定要删除当前头像吗？')) return

    setIsUploading(true)
    setStatusMessage('正在删除...')

    try {
      const response = await fetch('/api/avatar/upload', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || '删除失败')
      }

      setPreviewUrl(null)
      setSelectedFile(null)
      setUploadStatus('success')
      setStatusMessage('头像删除成功')

      // 3秒后清除状态消息
      setTimeout(() => {
        setUploadStatus('idle')
        setStatusMessage('')
      }, 3000)

    } catch (error) {
      console.error('删除头像失败:', error)
      setUploadStatus('error')
      setStatusMessage(error instanceof Error ? error.message : '删除失败')
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* 当前头像预览 */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border bg-gradient-to-br from-primary-light to-accent">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="头像预览"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                <User size={48} />
              </div>
            )}
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 size={32} className="text-white animate-spin" />
            </div>
          )}
        </div>

        <div>
          <div className="mb-4">
            <p className="font-medium">当前头像</p>
            <p className="text-sm text-text-muted">
              {previewUrl ? '已设置自定义头像' : '使用默认头像'}
            </p>
          </div>

          {previewUrl && previewUrl !== currentAvatarUrl && (
            <button
              onClick={handleRemove}
              className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/50 transition mr-3"
              disabled={isUploading}
            >
              取消选择
            </button>
          )}

          {previewUrl && previewUrl === currentAvatarUrl && (
            <button
              onClick={handleDeleteAvatar}
              className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 text-sm font-medium hover:bg-red-500/30 transition"
              disabled={isUploading}
            >
              删除头像
            </button>
          )}
        </div>
      </div>

      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${isDragging ? 'border-primary-light bg-primary/10' : 'border-border bg-secondary/30'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="mb-4">
          <div className="inline-flex p-4 rounded-full bg-primary/20 mb-3">
            <Upload size={24} className="text-primary-light" />
          </div>
          <h3 className="font-semibold mb-2">上传新头像</h3>
          <p className="text-sm text-text-muted mb-4">
            支持 JPG、PNG、GIF、WebP 格式，最大 5MB
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={triggerFileInput}
            className="px-6 py-3 rounded-xl bg-secondary font-medium hover:bg-secondary/50 transition"
            disabled={isUploading}
          >
            选择文件
          </button>

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  上传中...
                </>
              ) : (
                '确认上传'
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-text-muted mt-4">
          或将图片文件拖拽到此处
        </p>

        {/* 选择的文件信息 */}
        {selectedFile && (
          <div className="mt-6 p-4 rounded-xl bg-secondary/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <User size={16} className="text-primary-light" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-text-muted">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="p-1 rounded hover:bg-black/20 transition"
                disabled={isUploading}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 状态消息 */}
      {statusMessage && (
        <div className={`p-4 rounded-xl ${uploadStatus === 'success' ? 'bg-accent/20 text-accent' : uploadStatus === 'error' ? 'bg-red-500/20 text-red-500' : 'bg-secondary/50'}`}>
          <div className="flex items-center gap-3">
            {uploadStatus === 'success' && <Check size={20} />}
            {uploadStatus === 'error' && <X size={20} />}
            <span>{statusMessage}</span>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="p-4 rounded-xl bg-secondary/30">
        <h4 className="font-medium mb-2">头像使用说明</h4>
        <ul className="text-sm text-text-muted space-y-1">
          <li>• 头像将显示在个人资料页面和用户菜单中</li>
          <li>• 建议使用正方形图片，尺寸不小于 256×256 像素</li>
          <li>• 上传的头像会自动压缩和裁剪为圆形</li>
          <li>• 删除头像后将恢复为默认头像（基于用户邮箱首字母）</li>
        </ul>
      </div>
    </div>
  )
}