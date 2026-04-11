"""
爬虫工厂模块
提供统一的爬虫实例创建接口，支持多平台扩展
"""

import logging
from typing import Dict, Any, Optional, Type
from abc import ABC

from .base.abstract_crawler import AbstractCrawler

logger = logging.getLogger(__name__)

# 注册所有可用的爬虫适配器
_crawler_adapters = {}
_crawler_classes = {}

def register_crawler(platform: str, adapter_class=None, crawler_class=None):
    """注册爬虫适配器或爬虫类

    Args:
        platform: 平台名称，如 'jd', 'amazon', 'taobao' 等
        adapter_class: 爬虫适配器类（推荐）
        crawler_class: 直接爬虫类
    """
    if adapter_class:
        _crawler_adapters[platform.lower()] = adapter_class
        logger.info(f"注册爬虫适配器: {platform} -> {adapter_class.__name__}")

    if crawler_class:
        _crawler_classes[platform.lower()] = crawler_class
        logger.info(f"注册爬虫类: {platform} -> {crawler_class.__name__}")


def get_crawler_adapter(platform: str, **kwargs) -> Optional[Any]:
    """获取指定平台的爬虫适配器实例

    Args:
        platform: 平台名称
        **kwargs: 传递给适配器构造函数的参数

    Returns:
        爬虫适配器实例，如果平台未注册则返回None
    """
    platform = platform.lower()

    if platform not in _crawler_adapters:
        logger.warning(f"未找到平台 {platform} 的爬虫适配器")
        return None

    try:
        adapter_class = _crawler_adapters[platform]
        instance = adapter_class(**kwargs)
        logger.info(f"创建 {platform} 爬虫适配器实例成功")
        return instance
    except Exception as e:
        logger.error(f"创建 {platform} 爬虫适配器实例失败: {e}")
        return None


def get_crawler(platform: str, **kwargs) -> Optional[AbstractCrawler]:
    """获取指定平台的爬虫实例

    Args:
        platform: 平台名称
        **kwargs: 传递给爬虫构造函数的参数

    Returns:
        爬虫实例，如果平台未注册则返回None
    """
    platform = platform.lower()

    if platform not in _crawler_classes:
        logger.warning(f"未找到平台 {platform} 的爬虫类")
        return None

    try:
        crawler_class = _crawler_classes[platform]
        instance = crawler_class(**kwargs)
        logger.info(f"创建 {platform} 爬虫实例成功")
        return instance
    except Exception as e:
        logger.error(f"创建 {platform} 爬虫实例失败: {e}")
        return None


def get_available_platforms() -> list:
    """获取所有已注册的平台列表

    Returns:
        平台名称列表
    """
    platforms = set(_crawler_adapters.keys()) | set(_crawler_classes.keys())
    return sorted(list(platforms))


def is_platform_supported(platform: str) -> bool:
    """检查平台是否支持

    Args:
        platform: 平台名称

    Returns:
        是否支持该平台
    """
    platform = platform.lower()
    return platform in _crawler_adapters or platform in _crawler_classes


# 自动注册已安装的爬虫模块
try:
    from .jd.adapter import JDCrawlerAdapter
    from .jd.product_crawler import JDProductCrawler
    register_crawler("jd", adapter_class=JDCrawlerAdapter, crawler_class=JDProductCrawler)
    logger.info("京东爬虫已自动注册")
except ImportError as e:
    logger.warning(f"京东爬虫导入失败，未注册: {e}")

try:
    from .amazon.crawler_advanced import AmazonBestsellerScraper
    register_crawler("amazon", crawler_class=AmazonBestsellerScraper)
    logger.info("亚马逊爬虫已自动注册")
except ImportError as e:
    logger.warning(f"亚马逊爬虫导入失败，未注册: {e}")


# 定义支持的平台常量
SUPPORTED_PLATFORMS = {
    "amazon": "亚马逊",
    "jd": "京东",
    "taobao": "淘宝",
    "ebay": "eBay",
    "pdd": "拼多多",
}

__all__ = [
    "register_crawler",
    "get_crawler_adapter",
    "get_crawler",
    "get_available_platforms",
    "is_platform_supported",
    "SUPPORTED_PLATFORMS",
]