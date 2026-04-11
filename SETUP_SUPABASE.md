# Supabase 配置详细指引

## 🎯 为什么需要 Supabase？

Supabase 为 Vertex AI 智能体提供：
- ✅ **用户认证**：注册、登录、密码重置
- ✅ **数据库**：存储用户数据、爬虫任务、分析结果
- ✅ **文件存储**：上传的 Excel/CSV/PDF 文件
- ✅ **实时订阅**：实时通知和聊天消息
- ✅ **安全性**：内置权限管理和数据保护

## 📋 配置步骤概览

1. **注册 Supabase 账号**
2. **创建新项目**
3. **获取 API 密钥**
4. **配置数据库表**
5. **更新项目配置文件**

## 🚀 详细步骤

### 步骤 1：注册 Supabase 账号

1. 访问 https://supabase.com
2. 点击右上角 "Start your project"
3. 选择注册方式（推荐使用 GitHub 账号）
4. 完成邮箱验证

### 步骤 2：创建新项目

1. 登录后点击 "New project"
2. 填写项目信息：
   - **Name**: `vertex-ai` (或您喜欢的名称)
   - **Database Password**: 记住这个密码（稍后会用到）
   - **Region**: 选择 `East Asia (Tokyo)` 或离您最近的区域
   - **Pricing Plan**: 选择 **Free** 计划（足够开发使用）

3. 点击 "Create new project"（创建过程需要1-2分钟）

### 步骤 3：获取 API 密钥

项目创建完成后，进入项目控制台：

1. 点击左侧菜单栏的 **Settings**（齿轮图标）
2. 选择 **API**
3. 在 **Project API keys** 部分，您会看到：
   - **Project URL**: 类似 `https://xxxxxxxxxxxx.supabase.co`
   - **anon public**: 以 `eyJ` 开头的长字符串

4. 复制这两个值：
   - `Project URL` → 对应 `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → 对应 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 步骤 4：配置项目环境变量

1. 打开项目文件：`/Users/lxk/Documents/coding/Vertexai/apps/web/.env.local`
2. 更新以下两行：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://您的项目ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=您的anon密钥
   ```
   （**注意**：请用实际值替换上面的示例）

3. 保存文件

### 步骤 5：重启服务

更新环境变量后，需要重启前端服务：

```bash
# 停止当前服务
./stop.sh

# 重新启动
./start.sh
```

### 步骤 6：验证配置

1. 访问 http://localhost:3000
2. 点击右上角 "登录" 或 "注册"
3. 如果看到 Supabase 认证界面，说明配置成功！

## 🗄️ 数据库表设置（可选但推荐）

Supabase 会自动创建必要的用户表。如需更多功能，可以在 **SQL Editor** 中执行以下 SQL：

```sql
-- 创建爬虫任务表
CREATE TABLE IF NOT EXISTS crawler_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB
);

-- 创建文件分析记录表
CREATE TABLE IF NOT EXISTS file_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security（行级安全）
ALTER TABLE crawler_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_analyses ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的数据
CREATE POLICY "用户只能访问自己的爬虫任务"
  ON crawler_tasks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "用户只能访问自己的文件分析"
  ON file_analyses FOR ALL USING (auth.uid() = user_id);
```

## 🔧 故障排除

### 问题 1：认证界面不显示
- **原因**: 环境变量未正确设置
- **解决**: 检查 `.env.local` 文件，确保 URL 和 Key 正确

### 问题 2：注册失败
- **原因**: 可能需要验证邮箱
- **解决**: 检查邮箱垃圾邮件文件夹，或使用临时邮箱测试

### 问题 3：页面显示 "Supabase配置无效"
- **原因**: 配置文件仍包含示例值
- **解决**: 确保已用实际 Supabase 项目值替换 `your-project.supabase.co` 和 `your-anon-key`

### 问题 4：网络连接问题
- **原因**: 网络限制
- **解决**: 尝试使用科学上网工具

## 📱 测试认证功能

配置成功后，您可以：

1. **注册新账号** - 使用邮箱和密码
2. **登录已有账号** - 输入注册时的凭证
3. **查看用户信息** - 点击右上角头像查看用户详情
4. **退出登录** - 测试完整的认证流程

## 🔒 安全建议

1. **保护 API 密钥**: 不要将 `.env.local` 文件提交到 GitHub
2. **使用环境变量**: 生产环境使用 Vercel 的环境变量配置
3. **定期备份**: Supabase 项目设置中可以配置自动备份
4. **监控使用量**: 在 Supabase 控制台查看 API 调用和数据库使用情况

## 🌐 高级功能（可选）

当项目需要更多功能时，可以配置：

1. **第三方登录**: GitHub、Google、微信登录
2. **邮箱模板**: 自定义注册/密码重置邮件
3. **Webhooks**: 数据库变化时触发外部服务
4. **存储桶**: 管理上传的文件
5. **实时订阅**: 实现实时聊天功能

## 💡 小贴士

- **免费计划限制**: 每月 500MB 数据库、1GB 存储、50,000 行月写入量
- **开发测试**: 免费计划完全足够开发阶段使用
- **生产部署**: 如果用户量大，考虑升级到 Pro 计划（$25/月）

## 📞 获取帮助

1. **官方文档**: https://supabase.com/docs
2. **社区支持**: https://github.com/supabase/supabase/discussions
3. **Discord**: https://discord.supabase.com

---

**配置完成后，Vertex AI 将拥有完整的用户认证、数据存储和文件管理功能！**

> 如果您在配置过程中遇到任何问题，请随时告诉我具体错误信息，我会帮您解决。