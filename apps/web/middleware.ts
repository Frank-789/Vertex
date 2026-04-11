import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 检查Supabase配置是否有效（不是示例值）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 如果配置是示例值或未设置，跳过认证检查
  const isInvalidConfig = !supabaseUrl || !supabaseKey ||
                         supabaseUrl.includes('your-project') ||
                         supabaseKey.includes('your-anon-key')

  if (isInvalidConfig) {
    // 配置无效，跳过所有认证检查
    console.warn('Supabase配置无效，跳过认证中间件')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 保护需要认证的路由
    const protectedPaths = ['/chat', '/workshop', '/dashboard']
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (isProtected && !user) {
      // 重定向到登录页面
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // 如果已登录用户访问登录/注册页面，重定向到首页
    const authPaths = ['/login', '/register']
    const isAuthPath = authPaths.includes(request.nextUrl.pathname)
    if (isAuthPath && user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (error) {
    console.error('Supabase认证错误:', error)
    // 出错时跳过认证
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}