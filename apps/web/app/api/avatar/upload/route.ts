import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 支持的图片类型
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 })
    }

    // 验证文件类型
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件类型，仅支持 JPEG、PNG、GIF、WebP 格式' },
        { status: 400 }
      )
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小不能超过 5MB' },
        { status: 400 }
      )
    }

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // 上传到Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('上传头像失败:', uploadError)
      return NextResponse.json(
        { error: '上传文件失败', details: uploadError.message },
        { status: 500 }
      )
    }

    // 获取公开URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // 更新用户元数据（存储头像URL）
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    })

    if (updateError) {
      console.error('更新用户元数据失败:', updateError)
      // 继续，因为头像上传成功，只是元数据更新失败
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      message: '头像上传成功'
    })

  } catch (error) {
    console.error('头像上传API错误:', error)
    return NextResponse.json(
      { error: '处理上传请求时发生错误', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 从用户元数据获取头像URL
    const avatarUrl = user.user_metadata?.avatar_url || null

    return NextResponse.json({
      avatar_url: avatarUrl,
      has_avatar: !!avatarUrl
    })

  } catch (error) {
    console.error('获取头像API错误:', error)
    return NextResponse.json(
      { error: '获取头像信息时发生错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 从用户元数据获取头像URL
    const avatarUrl = user.user_metadata?.avatar_url
    if (!avatarUrl) {
      return NextResponse.json({ success: true, message: '用户没有头像' })
    }

    // 从URL中提取文件路径
    // Supabase存储URL格式: https://[project].supabase.co/storage/v1/object/public/avatars/[user-id]/[filename]
    const urlParts = avatarUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `${user.id}/${fileName}`

    // 删除存储中的文件
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([filePath])

    if (deleteError) {
      console.error('删除头像文件失败:', deleteError)
      // 继续，尝试更新元数据
    }

    // 清除用户元数据中的头像URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: null }
    })

    if (updateError) {
      console.error('清除用户元数据失败:', updateError)
      return NextResponse.json(
        { error: '清除头像信息失败', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '头像删除成功'
    })

  } catch (error) {
    console.error('删除头像API错误:', error)
    return NextResponse.json(
      { error: '删除头像时发生错误', details: (error as Error).message },
      { status: 500 }
    )
  }
}