#!/usr/bin/env python3
"""
测试router.py中的导入逻辑
"""

import sys
import logging

sys.path.insert(0, 'src')

# 模拟router.py中的导入逻辑
try:
    from crawlers.jd.adapter import JDCrawlerAdapter
    JD_CRAWLER_AVAILABLE = True
    print(f"✅ JDCrawlerAdapter导入成功，JD_CRAWLER_AVAILABLE={JD_CRAWLER_AVAILABLE}")
except ImportError as e:
    logging.warning(f"京东爬虫模块导入失败: {e}")
    JD_CRAWLER_AVAILABLE = False
    print(f"❌ JDCrawlerAdapter导入失败，JD_CRAWLER_AVAILABLE={JD_CRAWLER_AVAILABLE}")

# 测试是否真的可以实例化
if JD_CRAWLER_AVAILABLE:
    try:
        adapter = JDCrawlerAdapter(headless=True)
        print("✅ JDCrawlerAdapter实例化成功")
    except Exception as e:
        print(f"❌ JDCrawlerAdapter实例化失败: {e}")

print("\n完整sys.path:")
for p in sys.path:
    print(f"  {p}")

print(f"\n当前工作目录: {sys.path[0]}")