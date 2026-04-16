import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { chatWithDeepSeek, DeepSeekChatRequest } from '@/lib/deepseek'

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
    const { message, file_url, file_content } = body

    if (!message) {
      return NextResponse.json({ error: '消息内容不能为空' }, { status: 400 })
    }

    // 准备DeepSeek请求
    const deepseekRequest: DeepSeekChatRequest = {
      message,
      fileContent: file_content, // 直接使用文件内容
      context: {
        user_id: userId,
        file_url: file_url || null
      }
    };

    // 如果有file_url但没有file_content，可以尝试获取文件内容
    // 注意：这里简化处理，实际可能需要调用文件上传API获取内容
    // 当前版本假设前端已提供file_content或文件内容已在前端提取

    // 调用DeepSeek API
    const result = await chatWithDeepSeek(deepseekRequest);

    // 返回标准化响应（保持与之前兼容）
    return NextResponse.json({
      reply: result.reply,
      file_uploaded: result.file_uploaded,
      ai_used: result.ai_used,
      ...(result.error && { error: result.error }),
      ...(result.details && { details: result.details })
    });
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