# VertexAI 项目部署指南

## 已解决的问题

基于你的请求，我已经完成了以下修复：

### 1. 本地构建问题 ✅
- **问题**: `@tailwindcss/postcss` 模块缺失导致构建失败
- **解决方案**: 更新 `postcss.config.mjs` 配置，使用 `tailwindcss` 而不是 `@tailwindcss/postcss`
- **验证**: 本地开发服务器现在可以正常启动 (`npm run dev`)

### 2. 智能对话无需登录 ✅
- **问题**: `/chat` 路径需要登录才能访问
- **解决方案**:
  - 修改 `apps/web/middleware.ts` 移除 `/chat` 从受保护路径
  - 修改 `apps/web/app/api/chat/route.ts` 支持匿名用户访问
  - 匿名用户会获得临时会话ID
- **效果**: 未登录用户现在可以访问聊天功能

### 3. 缺失页面路由 ✅
- **问题**: UserAvatar 组件中的链接指向不存在的页面 (404错误)
- **解决方案**: 创建了以下页面:
  - `/profile` - 个人资料页面 (集成头像上传)
  - `/billing` - 订阅管理页面
  - `/notifications` - 通知中心页面
  - `/help` - 帮助与支持页面
  - `/guide` - 使用指南页面
  - `/features` - 功能特性页面
- **效果**: 所有页面链接现在都可以正常访问

### 4. 头像上传功能 ✅
- **问题**: 设置页面有"更换头像"按钮但无实际功能
- **解决方案**:
  - 创建头像上传API端点 (`/api/avatar/upload`)
  - 创建前端上传组件 (`components/ui/AvatarUpload.tsx`)
  - 集成到设置页面个人资料选项卡
- **要求**: 需要在Supabase中创建 `avatars` 存储桶

### 5. Python后端适配Railway部署 ✅
- **问题**: Python后端代码需要适配云部署环境
- **解决方案**:
  - 修改 `apps/api/src/main.py` 支持环境变量 `PORT`
  - 更新 `apps/api/Dockerfile` 支持环境变量
  - 创建 `Procfile` 和 `runtime.txt` 用于Railway部署
  - 更新CORS配置支持动态域名

## Railway 部署步骤 (Python后端)

### 第一步: 准备部署
1. **确保代码已提交到GitHub** (仓库: Frank-789/Vertex)
2. **检查Python后端配置**:
   - `apps/api/requirements.txt` - Python依赖
   - `apps/api/Dockerfile` - Docker配置
   - `apps/api/Procfile` - Railway启动命令

### 第二步: 部署到Railway
1. **访问** [railway.app](https://railway.app) 并注册/登录
2. **创建新项目** → "Deploy from GitHub repo"
3. **授权Railway访问GitHub账号**
4. **选择仓库** `Frank-789/Vertex`
5. **配置部署**:
   - Railway会自动检测为Python项目
   - 如果使用Docker，Railway会使用 `Dockerfile`
   - 如果需要环境变量，在Railway控制台添加:
     - `PORT` (Railway自动提供)
     - `ALLOWED_ORIGINS` (可选，默认包含 `http://localhost:3000,http://localhost:8501`)
     - 其他Supabase环境变量 (如果需要)

### 第三步: 获取部署URL
1. 部署完成后，在Railway控制台找到 **"Domains"** 部分
2. 复制提供的URL，类似: `https://vertex-api.up.railway.app`
3. 测试API是否正常工作:
   - 访问 `https://[your-railway-url]/` 应返回 `{"message": "Vertex AI API服务运行中", "status": "healthy"}`
   - 访问 `https://[your-railway-url]/health` 应返回 `{"status": "ok"}`

### 第四步: 更新前端配置
1. **在Vercel项目设置中**:
   - 进入项目 → Settings → Environment Variables
   - 添加/更新 `NEXT_PUBLIC_API_URL` 变量
   - 值设置为Railway提供的URL (例如: `https://vertex-api.up.railway.app`)
2. **重新部署Vercel项目**:
   - 在Vercel控制台触发重新部署
   - 或推送代码更改到GitHub

### 第五步: 验证部署
1. **检查Vercel日志**:
   - 进入Vercel项目 → Functions标签
   - 查看 `/api/chat` 和 `/api/crawl` 的调用日志
   - 应该没有 `ECONNREFUSED` 错误
2. **测试功能**:
   - 访问你的Vercel域名
   - 测试聊天功能 (应该不再有"消息发送失败"错误)
   - 测试爬虫功能 (需要登录)

## 头像上传功能设置

### Supabase 存储桶配置
1. **登录Supabase控制台** (你的Supabase项目)
2. **进入Storage** → Create new bucket
3. **桶名称**: `avatars`
4. **权限设置**:
   - 公共访问: 启用 (用于头像公开访问)
   - 或使用细粒度权限策略
5. **创建桶**

### 测试头像上传
1. 登录到Vertex AI应用
2. 点击用户头像 → 系统设置
3. 选择"个人资料"选项卡
4. 使用头像上传组件:
   - 拖放图片或点击"选择文件"
   - 支持 JPG, PNG, GIF, WebP (最大5MB)
   - 确认上传

## 故障排除

### 常见问题1: Railway部署失败
- **症状**: 部署过程中出错
- **可能原因**: 缺少依赖、Python版本不兼容
- **解决方案**:
  - 检查 `apps/api/requirements.txt` 文件是否完整
  - 在Railway项目设置中指定Python版本 (如 `python-3.11`)
  - 查看Railway部署日志中的具体错误信息

### 常见问题2: API调用超时
- **症状**: 前端调用后端API超时
- **可能原因**: Railway免费套餐有资源限制
- **解决方案**:
  - 优化Python后端性能
  - 考虑升级到Railway付费套餐
  - 添加前端超时处理和重试机制

### 常见问题3: CORS错误
- **症状**: 浏览器控制台显示CORS错误
- **可能原因**: 后端CORS配置不正确
- **解决方案**:
  - 在Railway环境变量中添加 `ALLOWED_ORIGINS`
  - 包含你的Vercel域名 (如 `https://your-vercel-app.vercel.app`)
  - 格式: `http://localhost:3000,https://your-vercel-app.vercel.app`

### 常见问题4: 头像上传失败
- **症状**: 上传头像时出现错误
- **可能原因**: Supabase存储桶未创建或权限不足
- **解决方案**:
  - 确认 `avatars` 存储桶已创建
  - 检查存储桶权限设置为公开
  - 验证Supabase环境变量是否正确配置

## 本地开发

### 启动前端
```bash
cd /Users/lxk/Documents/coding/Vertexai/apps/web
npm run dev
```
访问: http://localhost:3000

### 启动Python后端 (本地测试)
```bash
cd /Users/lxk/Documents/coding/Vertexai/apps/api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```
访问: http://localhost:8000

### 环境变量配置
创建 `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=你的Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
```

## 成功标准检查清单

- [ ] Python后端在Railway正常运行
- [ ] 前端可以成功调用所有API端点
- [ ] 本地开发服务器正常启动
- [ ] 所有页面路由可访问 (无404错误)
- [ ] 未登录用户可以访问聊天功能
- [ ] 头像上传功能正常工作
- [ ] Vercel日志中无 `ECONNREFUSED` 错误

## 后续优化建议

1. **错误处理增强**:
   - 添加全局错误边界
   - 实现Toast通知系统
   - 添加API调用重试机制

2. **性能优化**:
   - 图片压缩和优化
   - 代码分割和懒加载
   - API响应缓存

3. **功能扩展**:
   - 完善个人资料保存功能
   - 添加团队协作功能
   - 实现数据分析报告导出

4. **监控和日志**:
   - 添加应用性能监控
   - 实现用户行为分析
   - 设置错误追踪

## 技术支持

如果遇到问题:
1. 检查Vercel和Railway的部署日志
2. 查看浏览器开发者工具的控制台
3. 验证环境变量配置
4. 参考本指南的故障排除部分

祝你部署顺利！