import subprocess
import time
import sys
import os
import requests

# 启动uvicorn进程
proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
    cwd=os.path.dirname(os.path.abspath(__file__)),
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

try:
    # 等待服务启动
    time.sleep(3)

    # 测试根端点
    print("测试根端点...")
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"根端点测试失败: {e}")

    # 测试健康端点
    print("\n测试健康端点...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"健康端点测试失败: {e}")

    # 测试京东爬虫端点（GET请求）
    print("\n测试京东爬虫搜索端点...")
    try:
        response = requests.get("http://localhost:8000/api/v1/crawl/jd/search?keyword=test&max_items=10", timeout=5)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text[:200]}")
    except Exception as e:
        print(f"京东爬虫端点测试失败: {e}")

finally:
    # 终止进程
    proc.terminate()
    proc.wait(timeout=2)
    print("\n服务已停止")