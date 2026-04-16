/**
 * DeepSeek API服务封装
 * 用于VertexAI项目聊天功能
 * 环境变量: NEXT_PUBLIC_DEEPSEEK_API_KEY
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';

export interface DeepSeekChatRequest {
  message: string;
  fileContent?: string;  // 可选文件内容
  context?: Record<string, any>;  // 额外上下文
}

export interface DeepSeekChatResponse {
  reply: string;
  file_uploaded: boolean;
  ai_used: boolean;
  error?: string;
  details?: Record<string, any>;
}

/**
 * 调用DeepSeek API进行聊天
 */
export async function chatWithDeepSeek(request: DeepSeekChatRequest): Promise<DeepSeekChatResponse> {
  const { message, fileContent, context } = request;
  const file_uploaded = !!fileContent;

  try {
    // 如果没有API Key，返回降级响应
    if (!API_KEY || API_KEY.trim() === '') {
      console.warn('DeepSeek API Key未设置，使用示例响应');
      return {
        reply: getFallbackResponse(message, fileContent),
        file_uploaded,
        ai_used: false,
        error: 'API_KEY_NOT_SET',
        details: { message: '请配置NEXT_PUBLIC_DEEPSEEK_API_KEY环境变量' }
      };
    }

    // 构建提示词
    const prompt = buildPrompt(message, fileContent, context);

    // 调用DeepSeek API（带超时）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    let response: Response;
    try {
      response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一个专业的电商助手，帮助用户解决电商相关的问题。
              你的专业知识包括：
              - 电商平台分析（亚马逊、京东等）
              - 商品选品和定价策略
              - 市场趋势预测
              - 用户行为分析
              - 营销策略建议

              请提供专业、实用、具体的建议。`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API调用失败:', response.status, errorText);

      // 处理特定错误
      if (response.status === 401) {
        return {
          reply: 'API密钥无效或过期，请检查配置。',
          file_uploaded,
          ai_used: false,
          error: 'AUTH_ERROR',
          details: { status: response.status, message: '认证失败' }
        };
      } else if (response.status === 429) {
        return {
          reply: '请求过于频繁，请稍后再试。',
          file_uploaded,
          ai_used: false,
          error: 'RATE_LIMIT',
          details: { status: response.status, message: '速率限制' }
        };
      } else if (response.status === 400) {
        // 可能是上下文长度问题
        if (errorText.includes('maximum context length') || errorText.includes('context length')) {
          return {
            reply: '消息内容过长，请简化您的问题。',
            file_uploaded,
            ai_used: false,
            error: 'CONTEXT_TOO_LONG',
            details: { status: response.status, message: '上下文长度超限' }
          };
        }
      }

      // 其他错误
      return {
        reply: `抱歉，AI服务暂时不可用（错误: ${response.status}）。`,
        file_uploaded,
        ai_used: false,
        error: 'API_ERROR',
        details: { status: response.status, message: errorText.substring(0, 200) }
      };
    }

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content || '抱歉，我没有得到有效的回复。';

    return {
      reply: aiReply,
      file_uploaded,
      ai_used: true,
      details: {
        model: data.model,
        usage: data.usage
      }
    };

  } catch (error) {
    console.error('DeepSeek聊天处理异常:', error);

    // 检查是否是超时错误
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        reply: '请求超时，请稍后重试。',
        file_uploaded,
        ai_used: false,
        error: 'TIMEOUT',
        details: { message: '请求超过30秒未响应' }
      };
    }

    return {
      reply: `抱歉，处理您的请求时发生错误: ${error instanceof Error ? error.message : '未知错误'}`,
      file_uploaded,
      ai_used: false,
      error: 'NETWORK_ERROR',
      details: { message: error instanceof Error ? error.message : String(error) }
    };
  }
}

/**
 * 构建提示词
 */
function buildPrompt(message: string, fileContent?: string, context?: Record<string, any>): string {
  let prompt = `用户消息：${message}\n\n`;

  if (fileContent) {
    // 限制文件内容长度，避免超出token限制
    const maxFileLength = 3000;
    const truncatedContent = fileContent.length > maxFileLength
      ? fileContent.substring(0, maxFileLength) + '...（内容已截断）'
      : fileContent;
    prompt += `文件内容（作为参考上下文）：\n${truncatedContent}\n\n`;
  }

  if (context) {
    prompt += `额外上下文信息：\n${JSON.stringify(context, null, 2)}\n\n`;
  }

  prompt += `请根据以上信息提供专业、有用的电商相关建议。`;

  return prompt;
}

/**
 * 降级响应（无API Key时使用）
 */
function getFallbackResponse(message: string, fileContent?: string): string {
  const baseResponse = `我收到您的消息: "${message}"`;

  if (fileContent) {
    const preview = fileContent.length > 100 ?
      fileContent.substring(0, 100) + '...' :
      fileContent;
    return `${baseResponse}，并收到了文件内容（预览: ${preview}）。\n\n（注意：DeepSeek API密钥未配置，如需完整功能请设置NEXT_PUBLIC_DEEPSEEK_API_KEY环境变量。）`;
  }

  return `${baseResponse}。\n\n（注意：DeepSeek API密钥未配置，如需AI回复请设置NEXT_PUBLIC_DEEPSEEK_API_KEY环境变量。）`;
}

/**
 * 估算文本的token数量（近似值）
 */
export function estimateTokens(text: string): number {
  // 简单估算：英文~4字符/token，中文~2字符/token
  // 这是一个粗略估计，实际使用中应更精确
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 2 + otherChars / 4);
}

/**
 * 检查API Key是否配置
 */
export function isDeepSeekConfigured(): boolean {
  return !!API_KEY && API_KEY.trim() !== '';
}