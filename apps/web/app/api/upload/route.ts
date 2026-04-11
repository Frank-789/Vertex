import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PYTHON_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // 验证用户
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 获取表单数据（包含文件）
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 })
    }

    // 检查文件类型
    const allowedTypes = [
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'text/csv',
      'application/json',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件类型: ${file.type}` },
        { status: 400 }
      )
    }

    // 检查文件大小（限制10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小超过10MB限制' },
        { status: 400 }
      )
    }

    // 将文件转换为Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 转发到Python后端（使用multipart/form-data）
    const pythonFormData = new FormData()
    pythonFormData.append('file', new Blob([buffer]), file.name)

    const response = await fetch(`${PYTHON_API_URL}/api/v1/upload`, {
      method: 'POST',
      headers: {
        'X-User-Id': user.id,
      },
      body: pythonFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Python后端错误: ${error}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('文件上传API错误:', error)
    return NextResponse.json(
      { error: '文件上传处理失败', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 获取用户上传的文件列表（模拟）
    return NextResponse.json({
      files: [],
      user_id: user.id,
    })
  } catch (error) {
    console.error('获取文件列表错误:', error)
    return NextResponse.json({ error: '获取文件列表失败' }, { status: 500 })
  }
}