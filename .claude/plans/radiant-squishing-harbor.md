# VertexAI项目修复计划

## 上下文

项目现状：
1. **前端Vercel部署**：已成功部署，所有页面功能正常
2. **后端Railway部署**：构建失败，主要问题：
   - Dockerfile中使用已弃用的`libappindicator1`包（Debian Trixie中不存在）
   - 聊天API在Railway上工作不正常（本地测试正常）
3. **聊天API问题**：本地测试正常，但Railway部署后失败
4. **用户要求**：
   - 保持爬虫API在Railway上运行
   - 考虑将聊天API移到前端Vercel（参考studylink项目）

## 问题分析

### 1. Railway构建失败
**根本原因**：Dockerfile第15行的`libappindicator1`在Debian Trixie（版本12）中已移除。

**验证**：
- `libappindicator1`是旧的GTK2应用指示器库
- 在Debian Trixie中可能已被`libayatana-appindicator3`或其他包替代
- 检查chromium依赖：可能不再需要此包

### 2. 聊天API问题
**现状**：
- 前端：`apps/web/app/api/chat/route.ts` → 转发到Python后端
- 后端：`apps/api/src/api/router.py` → `ai_analyzer.py` → DeepSeek API
- 本地工作，Railway失败

**可能原因**：
- Railway环境变量配置问题（DEEPSEEK_API_KEY）
- 网络问题（Railway容器出站连接）
- Python依赖问题

### 3. 架构优化机会
**参考studylink项目**：`/Users/lxk/Documents/coding/studylink/lib/deepseek.ts`
- 直接在Vercel前端调用DeepSeek API
- 简化架构，避免后端转发
- 更稳定（已验证studylink项目完美运行）

## 解决方案

### 阶段1：修复Railway Dockerfile（爬虫API）

#### 1.1 简化系统依赖
**修改**：`apps/api/Dockerfile`
- 移除已弃用的`libappindicator1`
- 保留chromium运行的最小依赖集
- 测试chromium是否正常工作

**新依赖列表**（基于Debian Trixie）：
```dockerfile
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    unzip \
    fonts-liberation \
    fonts-freefont-ttf \
    fontconfig \
    libxss1 \
    libnspr4 \
    libnss3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean
```

#### 1.2 验证Chromium安装
保持现有Chromium安装逻辑：
```dockerfile
# 安装Chromium for Selenium
RUN apt-get update \
    && apt-get install -y chromium chromium-driver \
    && ln -sf /usr/bin/chromium /usr/bin/google-chrome \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean
```

#### 1.3 更新Python依赖
检查`requirements.txt`已包含`DrissionPage==4.0.0`（用于JD爬虫）。

### 阶段2：重构聊天API到前端

#### 2.1 创建前端DeepSeek服务
**位置**：`apps/web/lib/deepseek.ts`（参考studylink实现）

**核心功能**：
- 直接调用DeepSeek API（`https://api.deepseek.com/v1/chat/completions`）
- 处理环境变量`NEXT_PUBLIC_DEEPSEEK_API_KEY`
- 支持文件上传：提取文本内容作为上下文
- 错误处理和降级机制（API失败时使用示例响应）
- 保持与现有接口兼容的响应格式

#### 2.2 修改前端聊天路由
**修改**：`apps/web/app/api/chat/route.ts`
- 移除Python后端转发
- 直接调用本地`lib/deepseek.ts`
- 保持现有API接口兼容性

#### 2.3 环境变量迁移
**后端**：移除`DEEPSEEK_API_KEY`依赖（爬虫不需要）
**前端**：添加`NEXT_PUBLIC_DEEPSEEK_API_KEY`到Vercel环境变量

#### 2.4 更新中间件配置
**修改**：`apps/api/src/main.py`的CORS配置
- 移除对聊天端点的特殊处理
- 保持爬虫API的CORS设置

### 阶段3：测试与验证

#### 3.1 本地测试
1. **后端构建**：`docker build`测试新Dockerfile
2. **爬虫API**：测试京东/亚马逊爬虫功能
3. **前端聊天**：测试新的DeepSeek集成
4. **文件上传**：验证文件处理功能

#### 3.2 部署测试
1. **Railway**：推送到GitHub，验证构建成功
2. **Vercel**：自动部署，验证聊天功能
3. **端到端**：测试前端到后端爬虫API的通信

### 阶段4：清理与优化

#### 4.1 后端清理
- 移除`ai_analyzer.py`中DeepSeek相关代码（保留其他AI分析功能）
- 更新`router.py`，移除chat端点或标记为弃用

#### 4.2 前端优化
- 添加聊天历史存储（Supabase）
- 改进错误提示和加载状态
- 添加API密钥配置界面

## 实施步骤

### 步骤1：修复Dockerfile
1. 编辑`apps/api/Dockerfile`
2. 移除`libappindicator1`
3. 简化其他依赖（如果可能）
4. 本地测试构建：`docker build -t vertex-api .`

### 步骤2：创建前端DeepSeek服务
1. 创建`apps/web/lib/deepseek.ts`
2. 实现类似studylink的API调用
3. 扩展文件上传支持：
   - 接收文件内容（文本文件直接读取，其他格式有限支持）
   - 将文件内容作为上下文添加到提示词
   - 或调用单独的文件处理API（如果需要复杂解析）

### 步骤3：修改前端聊天路由
1. 编辑`apps/web/app/api/chat/route.ts`
2. 替换为直接调用`deepseek.ts`
3. 保持接口兼容

### 步骤4：更新环境变量
1. Vercel：添加`NEXT_PUBLIC_DEEPSEEK_API_KEY`
2. Railway：确保`ALLOWED_ORIGINS`包含Vercel域名

### 步骤5：清理后端代码
1. 可选：标记后端chat端点为弃用
2. 确保爬虫API不受影响

### 步骤6：测试
1. 本地全功能测试
2. 部署到GitHub
3. 验证Railway构建成功
4. 验证Vercel聊天功能

## 风险与缓解

### 风险1：Chromium在简化依赖下工作不正常
**缓解**：
- 保留核心依赖（libxss1, libnspr4, libnss3, libasound2, libatk-bridge2.0-0, libgtk-3-0）
- 测试爬虫功能

### 风险2：前端API密钥暴露
**缓解**：
- 使用`NEXT_PUBLIC_`前缀，这是Next.js标准做法
- Vercel环境变量受保护
- 考虑添加API使用限制

### 风险3：文件上传功能丢失
**缓解**：
- 在`deepseek.ts`中实现文件内容提取
- 或将文件上传保持在后端处理

### 风险4：架构变更影响现有用户
**缓解**：
- 保持API接口兼容
- 逐步迁移，可先并行运行

## 成功标准

1. **Railway构建成功**：无`libappindicator1`错误
2. **爬虫API正常工作**：京东/亚马逊搜索返回数据
3. **前端聊天正常工作**：直接调用DeepSeek API返回响应
4. **文件上传正常**：支持文件上下文聊天
5. **部署验证**：Vercel和Railway都正常运行

## 文件修改清单

### 必须修改
1. `apps/api/Dockerfile` - 移除libappindicator1，简化依赖
2. `apps/web/lib/deepseek.ts` - 新建，DeepSeek API服务
3. `apps/web/app/api/chat/route.ts` - 修改为直接调用DeepSeek
4. Vercel环境变量 - 添加`NEXT_PUBLIC_DEEPSEEK_API_KEY`

### 可选修改
1. `apps/api/src/api/router.py` - 标记chat端点为弃用
2. `apps/api/src/ai/ai_analyzer.py` - 移除DeepSeek代码
3. `apps/web/.env.local` - 添加本地开发API密钥

## 时间估计

### 阶段1：1-2小时
- Dockerfile修复和测试

### 阶段2：2-3小时
- 前端DeepSeek服务实现
- 路由修改

### 阶段3：1-2小时
- 测试和调试

### 阶段4：1小时
- 清理和文档

**总计**：5-8小时

## 备注

此计划优先解决Railway构建失败问题，同时优化架构将聊天API移到前端。参考studylink项目的成功经验，该方案应能提供更稳定的聊天功能。

如果时间紧迫，可先实施阶段1（修复Dockerfile），确保爬虫API在Railway上运行。聊天API可稍后优化。