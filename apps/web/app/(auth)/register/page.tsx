'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }
    checkUser()
  }, [router, supabase])

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 text-center">注册</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#6b21a8',
                brandAccent: '#a855f7',
                inputBackground: 'rgba(255, 255, 255, 0.05)',
                inputBorder: 'rgba(255, 255, 255, 0.1)',
                inputText: '#ffffff',
                labelText: '#9ca3af',
              },
            },
          },
          className: {
            button: 'rounded-lg',
            container: 'w-full',
            input: 'bg-gray-900/50 border-gray-700',
            label: 'text-gray-400',
            message: 'text-red-400',
          },
        }}
        theme="dark"
        view="sign_up"
        providers={[]}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
      />
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          已有账户？{' '}
          <a href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
            登录
          </a>
        </p>
      </div>
    </div>
  )
}