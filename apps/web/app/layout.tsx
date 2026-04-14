import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import UserAvatar from "@/components/layout/UserAvatar";
import { createClient } from "@/lib/supabase/server";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Vertex AI - 电商智能体",
  description: "高级电商数据爬取、分析与智能问答平台",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-screen bg-background text-foreground flex">
        <Providers>
          {/* 侧边栏 */}
          <Sidebar user={user} />

          {/* 主内容区域 */}
          <main className="flex-1 flex flex-col">
            {/* 顶部导航栏 */}
            <header className="glass border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-pulse-glow"></div>
                  <span className="font-semibold">Vertex AI</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary-light">
                    Beta
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* 搜索框占位 */}
                <div className="hidden md:block w-64">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="搜索或输入指令..."
                      className="w-full bg-secondary/50 border border-border rounded-lg py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">
                      ⌘
                    </div>
                  </div>
                </div>

                {/* 用户头像 */}
                <UserAvatar user={user} />
              </div>
            </header>

            {/* 页面内容 */}
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>

            {/* 页脚 */}
            <footer className="border-t border-border py-4 px-6 text-sm text-text-muted">
              <div className="flex justify-between items-center">
                <div>
                  © 2026 Vertex AI. 电商智能体平台.
                  <span className="ml-2">当前版本 v1.0.0</span>
                </div>
                <div className="flex gap-4">
                  <a href="#" className="hover:text-primary-light transition">帮助</a>
                  <a href="#" className="hover:text-primary-light transition">文档</a>
                  <a href="#" className="hover:text-primary-light transition">状态</a>
                </div>
              </div>
            </footer>
          </main>
        </Providers>
      </body>
    </html>
  );
}
