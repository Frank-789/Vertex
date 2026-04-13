import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PYTHON_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // 验证用户，允许匿名访问
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // 为匿名用户生成临时ID
    let userId: string
    if (authError || !user) {
      // 生成匿名用户ID，基于时间戳和随机数
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 10)
      userId = `anon_${timestamp}_${random}`
    } else {
      userId = user.id
    }

    // 获取请求数据
    const body = await request.json()
    const { message, file_url } = body

    if (!message) {
      return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 })
    }

    // 转发到Python后端
    const response = await fetch(`${PYTHON_API_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
      },
      body: JSON.stringify({ message, file_url, user_id: userId }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Python后端错误: ${error}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('聊天API错误:', error)
    return NextResponse.json(
      { error: '处理聊天请求时发生错误', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userId: string
    if (!user) {
      // 匿名用户返回空历史
      return NextResponse.json({
        messages: [],
        user_id: 'anonymous',
      })
    } else {
      userId = user.id
    }

    // 获取聊天历史（这里可以从数据库获取，暂时返回空）
    return NextResponse.json({
      messages: [],
      user_id: userId,
    })
  } catch (error) {
    console.error('获取聊天历史错误:', error)
    return NextResponse.json({ error: '获取聊天历史失败' }, { status: 500 })
  }
}