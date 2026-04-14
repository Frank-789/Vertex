# Railway 部署小白级教程（Python 后端）

## 前置条件：

1. ✅ **已有 GitHub 账号**，且 VertexAI 项目代码已推送到 GitHub（参考 `GITHUB_UPDATE_INSTRUCTIONS.md`）
2. ✅ **有 Railway 账号**（直接用 GitHub 账号登录即可，无需额外注册）
3. ✅ **本地无需安装任何软件**，全程在浏览器操作
4. ✅ **Supabase 账号**（用于头像上传功能，可选但推荐）

## 步骤 1：登录 Railway

1. 打开网址：https://railway.app
2. 点击「**Login with GitHub**」（使用 GitHub 登录）
3. 授权 Railway 访问你的 GitHub 账号（只需允许访问 `Frank-789/Vertex` 仓库即可）
4. 登录成功后，进入 Railway 控制台

## 步骤 2：创建新的 Railway 项目

1. 登录后，页面右上角点击「**+ New Project**」（绿色按钮）
2. 选择「**Deploy from GitHub repo**」（从 GitHub 仓库部署）
3. 在仓库列表中找到 `Frank-789/Vertex`（如果没看到，点击「Configure GitHub App」重新授权，勾选该仓库）
4. 选中仓库后，点击「**Import Repo**」（导入仓库）
5. Railway 会自动开始部署（首次部署可能需要 **1-2 分钟**）

## 步骤 3：配置环境变量（关键步骤）

**部署过程中 / 完成后**，进入项目页面，点击左侧「**Variables**」（变量）选项卡：

### 必需的环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| **PORT** | `8000` | Railway 会自动提供，填 8000 兼容本地 |
| **ALLOWED_ORIGINS** | `http://localhost:3000,https://你的Vercel域名.vercel.app` | 前端域名，多个用英文逗号分隔，**无空格** |
| **DEEPSEEK_API_KEY** | `sk-你的DeepSeek-API密钥` | 智能对话功能必需 |

### 可选的环境变量（推荐配置）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| **SUPABASE_URL** | `你的Supabase项目URL` | 头像上传功能必需 |
| **SUPABASE_ANON_KEY** | `你的Supabase匿名密钥` | 头像上传功能必需 |
| **ENVIRONMENT** | `production` | 环境标识 |
| **RAILWAY_ENVIRONMENT** | `production` | Railway 环境标识 |

### 配置方法：

1. 点击「**+ New Variable**」添加变量
2. 输入「**Name**」（变量名）和「**Value**」（值）
3. 点击「**Add**」保存
4. **添加完成后，Railway 会自动重启部署**（无需手动操作）

### 示例配置：
```
ALLOWED_ORIGINS = http://localhost:3000,https://vertex-ai.vercel.app
DEEPSEEK_API_KEY = sk-1b1de9af40cb41eeaea80fca0861b5e7
PORT = 8000
```

## 步骤 4：获取 Railway 部署的 API 域名

1. 部署完成后，点击左侧「**Deployments**」（部署）选项卡
2. 看到「**Status**」显示「**Success**」即部署成功
3. 点击顶部「**Domains**」（域名）选项卡
4. 会看到 Railway 自动分配的域名（格式：`https://xxxx-xxxx.up.railway.app`）
5. **复制这个域名**（比如 `https://vertex-api.up.railway.app`），保存好（后续要填到前端）

## 步骤 5：测试部署是否成功

1. **测试根端点**：
   - 访问 `https://你的Railway域名/`
   - 应显示：`{"message": "Vertex AI API服务运行中", "status": "healthy"}`

2. **测试健康检查**：
   - 访问 `https://你的Railway域名/health`
   - 应显示：`{"status": "ok"}`

3. **测试API功能**（可选）：
   - 访问 `https://你的Railway域名/api/v1/chat?message=你好`
   - 应返回AI聊天响应

## 步骤 6：更新前端（Vercel）的 API 地址

1. 打开 Vercel 官网：https://vercel.com，登录后找到你的 Vertex 前端项目
2. 点击项目 → 左侧「**Settings**」（设置）→ 「**Environment Variables**」（环境变量）
3. 找到 `NEXT_PUBLIC_API_URL` 变量（没有就新建）
4. 值填步骤 4 复制的 Railway 域名（比如 `https://vertex-api.up.railway.app`）
5. 点击「**Save**」保存
6. 点击顶部「**Deployments**」→ 选择最新的部署记录 → 点击「**Redeploy**」（重新部署），确保前端使用新的 API 地址

## 步骤 7：验证最终效果

打开你的 Vercel 前端域名（比如 `https://vertex.vercel.app`），测试核心功能：

### ✅ 必测功能：
1. **未登录状态访问 `/chat`** → 能正常聊天，无登录弹窗
2. **聊天发送消息** → 无「发送失败」提示
3. **所有页面**（`/profile`、`/dashboard`、`/features` 等）→ 无 404 错误

### ✅ 进阶测试（需登录）：
4. **登录后进入「个人资料」** → 能上传头像（需先配置 Supabase）
5. **文件上传功能** → 聊天页面能上传文件
6. **数据可视化页面** → `/visualization` 页面正常显示

## 小白避坑指南

### 🚫 问题 1：部署失败怎么办？

**解决方法：**
1. 点击 Railway 项目的「**Deployments**」→ 查看「**Build Logs**」（构建日志）
2. 红色文字是错误原因

**常见错误及解决：**

- **Python 版本不对**：
  ```bash
  # 项目已有 runtime.txt 指定 python-3.11
  # 如果还有问题，检查 runtime.txt 内容
  ```

- **依赖缺失**：
  ```bash
  # 检查 apps/api/requirements.txt 是否包含所有需要的包
  # 补充后重新提交推送
  ```

- **Docker 构建失败**：
  ```bash
  # 检查 apps/api/Dockerfile 语法
  # 确认没有硬编码的路径
  ```

### 🚫 问题 2：CORS 跨域错误？

**错误现象：** 前端控制台显示 `Access-Control-Allow-Origin` 错误

**解决方法：**
1. 确认 `ALLOWED_ORIGINS` 变量包含你的前端域名
2. **格式必须是英文逗号分隔，无空格**：
   - ✅ 正确：`https://vertex-ai.vercel.app,http://localhost:3000`
   - ❌ 错误：`https://vertex-ai.vercel.app, http://localhost:3000`（有空格）
3. 重新部署后端

### 🚫 问题 3：头像上传失败？

**前提条件：**
1. 在 Supabase 控制台创建 `avatars` 存储桶
2. 设置存储桶权限为公开（Public）

**检查步骤：**
1. 确认 Railway 环境变量已正确配置 Supabase 信息
2. 检查 Supabase 存储桶名称是否为 `avatars`
3. 测试 Supabase 连接：
   ```bash
   curl -X POST https://你的Supabase域名.supabase.co/rest/v1/ \
     -H "apikey: 你的匿名密钥" \
     -H "Content-Type: application/json"
   ```

### 🚫 问题 4：API 调用超时？

**原因：** Railway 免费套餐有资源限制（512MB RAM，有限CPU）

**优化方案：**
1. **前端添加超时重试机制**（已在项目中实现）
2. **优化 API 响应时间**：
   - 减少大文件处理
   - 添加缓存机制
3. **考虑升级到付费套餐**（Hobby 套餐 $5/月）

### 🚫 问题 5：聊天功能返回配置指南？

**现象：** 聊天返回「如何配置DeepSeek API Key」指南

**原因：** DeepSeek API 密钥无效或未配置

**解决：**
1. 检查 Railway 环境变量 `DEEPSEEK_API_KEY` 是否设置
2. 确认密钥格式：`sk-xxxxxxxxxxxxxxxx`
3. 在 DeepSeek 平台验证密钥是否有效：https://platform.deepseek.com/

## 监控和维护

### 日常检查：
1. **Railway 控制台**：查看 CPU、内存使用情况
2. **部署日志**：定期检查错误日志
3. **API 健康检查**：设置自动监控（如 UptimeRobot）

### 备份策略：
1. **环境变量备份**：导出 Railway 环境变量到本地
2. **数据库备份**（如果使用）：
   - Supabase 提供自动备份
   - Railway PostgreSQL 附加服务也有备份功能

### 更新部署：
1. **代码更新**：推送到 GitHub 后 Railway 会自动部署
2. **手动重启**：在 Railway 控制台点击「**Redeploy**」
3. **回滚**：在「Deployments」中选择之前的版本回滚

## 技术支持

- 📚 **Railway 官方文档**：https://docs.railway.app
- 📚 **项目部署指南**：查看项目根目录 `DEPLOYMENT_GUIDE.md`
- 🐛 **遇到问题先查看**：
  1. Railway 部署日志
  2. Vercel 函数日志
  3. 浏览器开发者工具控制台

- 🔧 **快速故障排除流程**：
  1. 检查环境变量配置
  2. 查看部署日志
  3. 测试 API 端点
  4. 检查前端-后端连接

## 费用说明

### Railway 免费套餐限制：
- ✅ 512MB RAM
- ✅ 有限 CPU 资源
- ✅ 每月 $5 信用额度（足够中小项目）
- ✅ 自动 HTTPS、全球 CDN
- ❌ 无自定义域名（需付费）
- ❌ 有休眠策略（不活跃时休眠）

### 升级建议：
- **个人项目**：免费套餐足够
- **小型团队**：Hobby 套餐（$5/月）
- **生产环境**：Standard 套餐（$20/月起）

---

**部署时间**：首次约 3-5 分钟，后续更新约 1-2 分钟  
**成功率**：按照本教程步骤，成功率 >95%  
**技术支持**：遇到问题先查看 Railway 文档和项目日志