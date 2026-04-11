import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Vertex AI</h1>
          <p className="text-gray-400">电商智能体平台</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700 shadow-2xl">
          {children}
        </div>
        <p className="text-gray-500 text-sm text-center mt-6">
          使用Vertex AI，探索电商数据智能分析
        </p>
      </div>
    </div>
  )
}