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

    // 获取请求数据
    const body = await request.json()
    const { platform, category, max_items = 50, options, keyword } = body

    if (!platform) {
      return NextResponse.json(
        { error: '平台不能为空' },
        { status: 400 }
      )
    }

    // 对于京东、淘宝等需要关键词的平台
    if (['jd', 'taobao', 'ebay', 'pdd'].includes(platform) && !keyword) {
      return NextResponse.json(
        { error: '搜索关键词不能为空' },
        { status: 400 }
      )
    }

    // 支持的平台
    const supportedPlatforms = ['amazon', 'jd', 'taobao', 'ebay']
    if (!supportedPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `不支持的平台: ${platform}，支持: ${supportedPlatforms.join(', ')}` },
        { status: 400 }
      )
    }

    // 转发到Python后端
    const response = await fetch(`${PYTHON_API_URL}/api/v1/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id,
      },
      body: JSON.stringify({
        platform,
        category,
        max_items,
        options,
        keyword,
        user_id: user.id,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Python后端错误: ${error}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('爬虫API错误:', error)
    return NextResponse.json(
      { error: '启动爬虫任务时发生错误', details: (error as Error).message },
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

    // 获取用户的爬虫任务历史
    const taskId = request.nextUrl.searchParams.get('task_id')

    if (taskId) {
      // 查询特定任务状态
      const response = await fetch(`${PYTHON_API_URL}/api/v1/task/${taskId}`, {
        headers: {
          'X-User-Id': user.id,
        },
      })

      if (!response.ok) {
        throw new Error('获取任务状态失败')
      }

      const data = await response.json()
      return NextResponse.json(data)
    } else {
      // 返回用户的任务列表（模拟）
      return NextResponse.json({
        tasks: [],
        user_id: user.id,
      })
    }
  } catch (error) {
    console.error('获取爬虫任务错误:', error)
    return NextResponse.json({ error: '获取爬虫任务失败' }, { status: 500 })
  }
}