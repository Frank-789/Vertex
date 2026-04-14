"""
Vertex真实AI分析器
支持多个AI API：豆包、Claude、通义千问
"""

import pandas as pd
import requests
import json
import time
from typing import List, Dict, Optional
import os

class AIProductAnalyzer:
    """AI产品分析器 - 真实AI接入"""
    
    def __init__(self):
        # API配置（需要用户自己申请）
        self.apis = {
            'doubao': {
                'endpoint': 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                'api_key': os.getenv('DOUBAO_API_KEY', ''),  # 从环境变量读取
                'model': 'ep-20241224xxxxx'  # 需要替换为实际的endpoint ID
            },
            'claude': {
                'endpoint': 'https://api.anthropic.com/v1/messages',
                'api_key': os.getenv('ANTHROPIC_API_KEY', ''),
                'model': 'claude-3-5-sonnet-20241022'
            },
            'qwen': {
                'endpoint': 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
                'api_key': os.getenv('QWEN_API_KEY', ''),
                'model': 'qwen-plus'
            },
            'deepseek': {
                'endpoint': 'https://api.deepseek.com/v1/chat/completions',
                'api_key': os.getenv('DEEPSEEK_API_KEY', ''),
                'model': 'deepseek-chat'
            }
        }
    
    def analyze_with_ai(self, products_data: List[Dict], config: Dict) -> str:
        """
        使用AI进行产品分析
        
        Args:
            products_data: 商品数据列表
            config: 配置信息
            
        Returns:
            str: AI分析报告
        """
        # 选择AI模型
        ai_model = config.get('ai_model', 'Claude (推荐)')
        
        # 准备数据摘要
        data_summary = self._prepare_data_summary(products_data, config)
        
        # 构建提示词
        prompt = self._build_prompt(data_summary, config)
        
        # 调用AI
        if 'Claude' in ai_model:
            return self._call_claude(prompt)
        elif '豆包' in ai_model:
            return self._call_doubao(prompt)
        elif '通义千问' in ai_model:
            return self._call_qwen(prompt)
        else:
            return self._fallback_analysis(products_data, config)
    
    def _prepare_data_summary(self, products_data: List[Dict], config: Dict) -> str:
        """准备数据摘要"""
        df = pd.DataFrame(products_data)
        
        # 清洗价格
        df['Price_Clean'] = df['Price'].str.replace(r'[^\d.]', '', regex=True).astype(float, errors='ignore')
        df['Rating_Clean'] = df['Rating'].str.extract(r'(\d+\.?\d*)')[0].astype(float, errors='ignore')
        
        valid_prices = df['Price_Clean'].dropna()
        valid_ratings = df['Rating_Clean'].dropna()
        
        summary = f"""
【商品数据概览】
- 类目: {config['category']}
- 商品总数: {len(df)}
- 价格区间: ${valid_prices.min():.2f} - ${valid_prices.max():.2f}
- 平均价格: ${valid_prices.mean():.2f}
- 平均评分: {valid_ratings.mean():.2f}
- 用户资金: {config['budget']}

【TOP 10 商品】
"""
        
        for idx, row in df.head(10).iterrows():
            summary += f"{row['Rank']}. {row['Title'][:50]} - {row['Price']} - {row['Rating']}\n"
        
        return summary
    
    def _build_prompt(self, data_summary: str, config: Dict) -> str:
        """构建AI提示词"""
        prompt = f"""你是一位专业的电商选品分析师。请基于以下数据，为中小电商卖家提供选品建议：

{data_summary}

请从以下几个方面进行分析：

1. **价格竞争力分析**
   - 价格分布是否合理
   - 是否存在价格集中区间
   - 推荐的进货价格范围

2. **市场需求评估**
   - 根据排名和评分判断市场需求
   - 高需求vs高竞争的商品识别

3. **资金安全建议**
   - 用户资金：{config['budget']}
   - 建议单品进货金额（不超过总资金20%）
   - 推荐进货10件的安全价格线

4. **具体选品推荐**
   - 推荐3-5个最适合的商品
   - 说明推荐理由（价格、评分、排名）

5. **风险提示**
   - 需要注意的风险点
   - 避坑建议

请用中文回答，语气专业但友好，给出实用的建议。
"""
        return prompt
    
    def _call_claude(self, prompt: str) -> str:
        """调用Claude API"""
        api_key = self.apis['claude']['api_key']
        
        # 如果没有配置API key，返回提示
        if not api_key:
            return self._get_api_key_guide('Claude')
        
        try:
            headers = {
                'anthropic-version': '2023-06-01',
                'x-api-key': api_key,
                'content-type': 'application/json'
            }
            
            data = {
                'model': self.apis['claude']['model'],
                'max_tokens': 2000,
                'messages': [
                    {'role': 'user', 'content': prompt}
                ]
            }
            
            response = requests.post(
                self.apis['claude']['endpoint'],
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['content'][0]['text']
            else:
                return f"API调用失败: {response.status_code} - {response.text}"
                
        except Exception as e:
            return f"调用Claude API时出错: {str(e)}\n\n" + self._get_api_key_guide('Claude')
    
    def _call_doubao(self, prompt: str) -> str:
        """调用豆包API"""
        api_key = self.apis['doubao']['api_key']
        
        if not api_key:
            return self._get_api_key_guide('豆包')
        
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': self.apis['doubao']['model'],
                'messages': [
                    {'role': 'user', 'content': prompt}
                ]
            }
            
            response = requests.post(
                self.apis['doubao']['endpoint'],
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                return f"API调用失败: {response.status_code}"
                
        except Exception as e:
            return f"调用豆包API时出错: {str(e)}\n\n" + self._get_api_key_guide('豆包')
    
    def _call_qwen(self, prompt: str) -> str:
        """调用通义千问API"""
        api_key = self.apis['qwen']['api_key']
        
        if not api_key:
            return self._get_api_key_guide('通义千问')
        
        try:
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'model': self.apis['qwen']['model'],
                'input': {
                    'messages': [
                        {'role': 'user', 'content': prompt}
                    ]
                }
            }
            
            response = requests.post(
                self.apis['qwen']['endpoint'],
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['output']['text']
            else:
                return f"API调用失败: {response.status_code}"
                
        except Exception as e:
            return f"调用通义千问API时出错: {str(e)}\n\n" + self._get_api_key_guide('通义千问')

    def _estimate_tokens(self, text: str) -> int:
        """粗略估计token数量（英文约4字符=1token，中文约1字符=2tokens）"""
        import re
        english_words = len(re.findall(r'\b[a-zA-Z]+\b', text))
        chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
        return english_words + chinese_chars * 2

    def _truncate_prompt(self, prompt: str, max_tokens: int = 130000) -> str:
        """截断提示词到指定token数量"""
        estimated = self._estimate_tokens(prompt)
        if estimated <= max_tokens:
            return prompt

        # 按比例截断
        ratio = max_tokens / estimated
        new_length = int(len(prompt) * ratio)
        truncated = prompt[:new_length]

        # 记录日志（可以添加logging模块）
        print(f"提示词从{estimated} tokens截断到{self._estimate_tokens(truncated)} tokens")
        return truncated + "\n\n[提示：由于长度限制，部分内容已被截断]"

    def _truncate_prompt_by_half(self, prompt: str) -> str:
        """将提示词截断一半"""
        half_length = len(prompt) // 2
        truncated = prompt[:half_length]
        print(f"提示词截断一半，从{len(prompt)}字符到{len(truncated)}字符")
        return truncated + "\n\n[提示：由于长度限制，内容已被截断]"

    def _call_deepseek(self, prompt: str, max_retries: int = 3) -> str:
        """调用DeepSeek API，支持重试和上下文长度管理"""
        api_key = self.apis['deepseek']['api_key']

        # 调试信息
        print(f"[DEBUG] DeepSeek API Key: {api_key[:10]}... (length: {len(api_key)})")
        print(f"[DEBUG] DeepSeek Endpoint: {self.apis['deepseek']['endpoint']}")
        print(f"[DEBUG] Prompt length: {len(prompt)} chars, estimated tokens: {self._estimate_tokens(prompt)}")

        if not api_key:
            print("错误: DEEPSEEK_API_KEY环境变量未设置")
            return self._get_api_key_guide('DeepSeek')

        # 检查API Key格式
        if not api_key.startswith('sk-'):
            print(f"警告: DeepSeek API Key格式可能不正确: {api_key[:10]}...")

        for attempt in range(max_retries):
            try:
                headers = {
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                }

                # 检查上下文长度，避免超出限制
                estimated_tokens = self._estimate_tokens(prompt)
                if estimated_tokens > 130000:  # 留出安全边际
                    print(f"警告: 提示词过长: {estimated_tokens} tokens，进行截断")
                    prompt = self._truncate_prompt(prompt, max_tokens=130000)
                    estimated_tokens = self._estimate_tokens(prompt)
                    print(f"截断后: {estimated_tokens} tokens")

                # 根据DeepSeek官方文档构建消息（兼容OpenAI格式）
                data = {
                    'model': self.apis['deepseek']['model'],
                    'messages': [
                        {'role': 'system', 'content': '你是一个专业的电商助手，帮助用户解决电商相关的问题。'},
                        {'role': 'user', 'content': prompt}
                    ],
                    'stream': False,
                    'max_tokens': 2000  # 限制回复长度
                }

                response = requests.post(
                    self.apis['deepseek']['endpoint'],
                    headers=headers,
                    json=data,
                    timeout=30
                )

                if response.status_code == 200:
                    result = response.json()
                    return result['choices'][0]['message']['content']

                elif response.status_code == 400:
                    # 处理上下文长度错误
                    error_msg = response.text
                    if "maximum context length" in error_msg:
                        print(f"错误: 上下文长度超限: {error_msg}")
                        # 尝试截断提示词并重试
                        prompt = self._truncate_prompt_by_half(prompt)
                        print(f"第{attempt + 1}次重试: 提示词截断一半")
                        if attempt < max_retries - 1:
                            time.sleep(1)
                            continue
                        else:
                            return "抱歉，消息过长，即使截断后仍超出限制。请简化您的问题。"
                    else:
                        return f"API请求参数错误 (400): {error_msg}"

                elif response.status_code == 401:
                    return f"API Key无效或过期，请检查DEEPSEEK_API_KEY环境变量。\n\n" + self._get_api_key_guide('DeepSeek')

                elif response.status_code == 429:
                    wait_time = 2 ** attempt  # 指数退避
                    print(f"警告: 速率限制，等待{wait_time}秒后重试...")
                    time.sleep(wait_time)
                    continue  # 重试

                else:
                    return f"API调用失败: {response.status_code} - {response.text}"

            except requests.exceptions.Timeout:
                print(f"警告: 请求超时，尝试 {attempt + 1}/{max_retries}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
                else:
                    return "请求超时，请稍后重试"

            except Exception as e:
                print(f"错误: 调用DeepSeek API时出错: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                    continue
                else:
                    return f"调用DeepSeek API时出错: {str(e)}\n\n" + self._get_api_key_guide('DeepSeek')

        return "API调用失败，已达到最大重试次数"

    def _get_api_key_guide(self, model_name: str) -> str:
        """获取API Key配置指南"""
        guides = {
            'Claude': """
## 🔑 如何配置Claude API Key

1. **注册账号**
   - 访问: https://console.anthropic.com/
   - 注册账号（新用户有$5免费额度）

2. **获取API Key**
   - 进入Settings → API Keys
   - 点击"Create Key"
   - 复制API Key

3. **配置到项目**
   方法1：在代码中设置
   ```python
   # 在ai_analyzer.py中找到这行：
   'api_key': 'YOUR_API_KEY_HERE'
   ```
   
   方法2：使用环境变量（推荐）
   ```bash
   export ANTHROPIC_API_KEY='your-api-key'
   ```

4. **费用说明**
   - 新用户: $5免费额度
   - Claude 3.5 Sonnet: $3/百万tokens（输入）
   - 本项目每次分析约消耗0.001-0.01美元
""",
            '豆包': """
## 🔑 如何配置豆包API Key

1. **注册账号**
   - 访问: https://www.volcengine.com/
   - 注册火山引擎账号

2. **开通豆包服务**
   - 进入"模型推理"产品
   - 开通Doubao服务
   - 获取免费额度

3. **获取API Key和Endpoint**
   - 创建推理接入点
   - 复制Endpoint ID和API Key

4. **配置到项目**
   ```python
   # 在ai_analyzer.py中配置：
   'api_key': 'YOUR_API_KEY',
   'model': 'YOUR_ENDPOINT_ID'
   ```

5. **费用说明**
   - 免费额度: 较大
   - 适合中文场景
""",
            '通义千问': """
## 🔑 如何配置通义千问API Key

1. **注册阿里云账号**
   - 访问: https://dashscope.aliyun.com/

2. **开通服务**
   - 开通通义千问服务
   - 获取免费额度

3. **获取API Key**
   - 进入API管理
   - 创建API Key

4. **配置**
   ```python
   'api_key': 'YOUR_API_KEY'
   ```
""",
            'DeepSeek': """
## 🔑 如何配置DeepSeek API Key

1. **注册账号**
   - 访问: https://platform.deepseek.com/
   - 注册DeepSeek账号

2. **获取API Key**
   - 进入API Keys页面
   - 点击"Create API Key"
   - 复制API Key（格式: sk-xxxxxxxx）

3. **配置到项目**
   方法1：环境变量（推荐）
   ```bash
   export DEEPSEEK_API_KEY='sk-your-api-key'
   ```

   方法2：直接在代码中设置
   ```python
   # 在ai_analyzer.py中配置：
   'api_key': 'sk-your-api-key'
   ```

4. **费用说明**
   - 新用户: 免费额度
   - 价格实惠，支持中文
   - API兼容OpenAI格式

5. **API调用示例**
   ```python
   # 使用OpenAI SDK
   from openai import OpenAI

   client = OpenAI(
       api_key='sk-your-api-key',
       base_url="https://api.deepseek.com"
   )

   response = client.chat.completions.create(
       model="deepseek-chat",
       messages=[
           {"role": "system", "content": "You are a helpful assistant"},
           {"role": "user", "content": "Hello"},
       ],
       stream=False
   )
   ```
"""
        }

        return guides.get(model_name, "")
    
    def _fallback_analysis(self, products_data: List[Dict], config: Dict) -> str:
        """备用分析（基于规则）"""
        df = pd.DataFrame(products_data)
        df['Price_Clean'] = df['Price'].str.replace(r'[^\d.]', '', regex=True).astype(float, errors='ignore')
        df['Rating_Clean'] = df['Rating'].str.extract(r'(\d+\.?\d*)')[0].astype(float, errors='ignore')
        
        valid_prices = df['Price_Clean'].dropna()
        valid_ratings = df['Rating_Clean'].dropna()
        
        budget_map = {"<5k": 5000, "5k-10k": 10000, "10k-20k": 20000, ">20k": 30000}
        max_budget = budget_map.get(config['budget'], 10000)
        safe_price_limit = max_budget * 0.2 / 10
        
        report = f"""
## 📊 选品分析报告（基于规则分析）

⚠️ **提示**: 当前使用基础规则分析。配置AI API Key后可获得更智能的分析！

### 一、数据概览
- 商品总数: {len(df)}
- 价格区间: ${valid_prices.min():.2f} - ${valid_prices.max():.2f}
- 平均价格: ${valid_prices.mean():.2f}
- 平均评分: {valid_ratings.mean():.2f}

### 二、价格分析
- 建议进货价格: ≤ ${safe_price_limit:.2f}
- 符合条件商品: {len(df[df['Price_Clean'] <= safe_price_limit])}个

### 三、推荐商品
"""
        
        # 推荐TOP商品
        safe_products = df[
            (df['Price_Clean'] <= safe_price_limit) &
            (df['Rating_Clean'] >= 4.0)
        ].head(5)
        
        for idx, (_, row) in enumerate(safe_products.iterrows(), 1):
            report += f"\n{idx}. {row['Title'][:50]}..."
            report += f"\n   价格: {row['Price']} | 评分: {row['Rating']}"
            report += f"\n   推荐理由: 价格合理，评分良好\n"
        
        report += "\n\n💡 **升级提示**: 配置AI API Key后，您将获得："
        report += "\n   - 更专业的市场分析"
        report += "\n   - 个性化选品建议"
        report += "\n   - 风险评估与避坑指南"
        report += "\n\n查看上方提示了解如何配置API Key"
        
        return report

    def chat(self, message: str, context: Optional[Dict] = None) -> str:
        """
        通用AI聊天方法

        Args:
            message: 用户消息
            context: 可选上下文信息

        Returns:
            str: AI回复
        """
        # 选择AI模型（默认为DeepSeek）
        ai_model = "deepseek"

        # 构建聊天提示
        prompt = self._build_chat_prompt(message, context)

        # 调用AI
        if 'deepseek' in ai_model.lower():
            return self._call_deepseek(prompt)
        elif 'Claude' in ai_model:
            return self._call_claude(prompt)
        elif '豆包' in ai_model:
            return self._call_doubao(prompt)
        elif '通义千问' in ai_model:
            return self._call_qwen(prompt)
        else:
            return self._call_deepseek(prompt)  # 默认使用DeepSeek

    def _build_chat_prompt(self, message: str, context: Optional[Dict] = None) -> str:
        """构建聊天提示词"""
        if context:
            context_str = json.dumps(context, ensure_ascii=False, indent=2)
            prompt = f"""你是一个专业的电商助手，帮助用户解决电商相关的问题。

用户上下文信息：
{context_str}

用户消息：
{message}

请根据上下文和用户消息，提供专业、有用的回复。"""
        else:
            prompt = f"""你是一个专业的电商助手，帮助用户解决电商相关的问题。

用户消息：
{message}

请提供专业、有用的回复。"""

        return prompt


# 测试代码
if __name__ == "__main__":
    analyzer = AIProductAnalyzer()
    
    # 测试数据
    test_data = [
        {'Rank': 1, 'Title': 'Test Product A', 'Price': '$19.99', 'Rating': '4.5 out of 5 stars'},
        {'Rank': 2, 'Title': 'Test Product B', 'Price': '$29.99', 'Rating': '4.3 out of 5 stars'},
    ]
    
    config = {
        'category': 'beauty',
        'budget': '5k-10k',
        'ai_model': 'Claude (推荐)'
    }
    
    result = analyzer.analyze_with_ai(test_data, config)
    print(result)
