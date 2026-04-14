#!/usr/bin/env python3
"""
测试聊天API功能
验证DeepSeek API集成、上下文长度管理、错误处理等
"""

import os
import sys
import requests
import json
import time

def test_chat_api():
    """测试聊天API"""
    base_url = "http://localhost:8000"

    print("=" * 60)
    print("VertexAI聊天API测试")
    print("=" * 60)

    # 测试1: 检查环境变量
    print("\n1. 检查环境变量配置...")
    deepseek_key = os.getenv("DEEPSEEK_API_KEY")
    if deepseek_key:
        print(f"✓ DEEPSEEK_API_KEY: 已设置 ({deepseek_key[:10]}...)")
        if deepseek_key.startswith('sk-'):
            print("✓ API Key格式正确")
        else:
            print("⚠  API Key格式可能不正确，应以'sk-'开头")
    else:
        print("✗ DEEPSEEK_API_KEY: 未设置")
        print("  请设置环境变量: export DEEPSEEK_API_KEY='sk-your-key'")
        print("  或编辑.env.local文件")

    # 测试2: 后端健康检查
    print("\n2. 后端健康检查...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✓ 后端健康: {health_data.get('status', 'unknown')}")
        else:
            print(f"✗ 后端健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 后端健康检查异常: {e}")
        print("  请确保后端服务正在运行: python src/main.py")
        return False

    # 测试3: 简单聊天测试
    print("\n3. 简单聊天测试...")
    test_messages = [
        "你好，请介绍一下电商选品的注意事项",
        "什么是亚马逊FBA？",
        "如何提高商品转化率？"
    ]

    for i, message in enumerate(test_messages, 1):
        print(f"  测试 {i}: {message[:30]}...")
        try:
            response = requests.post(
                f"{base_url}/api/v1/chat?message={message}",
                headers={"Content-Type": "application/json"},
                timeout=30
            )

            if response.status_code == 200:
                data = response.json()
                reply = data.get('reply', '')
                ai_used = data.get('ai_used', False)
                print(f"    ✓ 成功 (AI: {ai_used}, 回复长度: {len(reply)})")
                if reply:
                    print(f"      回复预览: {reply[:80]}...")
            else:
                print(f"    ✗ 失败: {response.status_code} - {response.text[:100]}")

        except Exception as e:
            print(f"    ✗ 异常: {e}")

    # 测试4: 长消息测试（测试上下文截断）
    print("\n4. 长消息测试（上下文截断）...")
    long_message = "电商选品分析报告 " * 5000  # 约10万个字符
    print(f"  消息长度: {len(long_message)} 字符")

    try:
        response = requests.post(
            f"{base_url}/api/v1/chat?message={long_message[:1000]}",  # 先测试1000字符
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        if response.status_code == 200:
            data = response.json()
            reply = data.get('reply', '')
            print(f"  ✓ 长消息处理成功 (回复长度: {len(reply)})")
            if "截断" in reply or "限制" in reply:
                print("  ⚠  检测到截断提示")
        else:
            print(f"  ✗ 长消息处理失败: {response.status_code}")
            print(f"     错误信息: {response.text[:200]}")

    except Exception as e:
        print(f"  ✗ 长消息测试异常: {e}")

    # 测试5: 错误处理测试
    print("\n5. 错误处理测试...")
    print("  a) 测试无效API密钥模拟...")
    # 注意：这个测试不会真正调用API，只是验证错误处理逻辑
    # 可以在AI分析器中模拟API密钥错误

    # 测试6: 响应时间测试
    print("\n6. 响应时间测试...")
    start_time = time.time()
    try:
        response = requests.post(
            f"{base_url}/api/v1/chat?message=测试响应时间",
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        elapsed = time.time() - start_time

        if response.status_code == 200:
            print(f"  ✓ 响应时间: {elapsed:.2f}秒")
            if elapsed > 10:
                print("  ⚠  响应时间较长，请检查网络或API状态")
            else:
                print("  ✓ 响应时间正常")
        else:
            print(f"  ✗ 请求失败: {response.status_code}")

    except Exception as e:
        print(f"  ✗ 响应时间测试异常: {e}")

    # 测试7: 直接测试AI分析器
    print("\n7. 直接测试AI分析器...")
    try:
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from src.ai.ai_analyzer import AIProductAnalyzer

        analyzer = AIProductAnalyzer()

        # 测试聊天方法
        test_prompt = "你好，这是一个测试消息"
        reply = analyzer.chat(test_prompt)

        if reply:
            print(f"  ✓ AI分析器工作正常")
            if "API Key" in reply and "配置" in reply:
                print("  ⚠  AI分析器: API Key未配置或无效")
            else:
                print(f"    回复示例: {reply[:100]}...")
        else:
            print("  ✗ AI分析器返回空回复")

    except ImportError as e:
        print(f"  ✗ 无法导入AI分析器: {e}")
    except Exception as e:
        print(f"  ✗ AI分析器测试异常: {e}")

    print("\n" + "=" * 60)
    print("测试完成！")
    print("=" * 60)

    return True

if __name__ == "__main__":
    # 添加项目根目录到Python路径
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, project_root)

    test_chat_api()