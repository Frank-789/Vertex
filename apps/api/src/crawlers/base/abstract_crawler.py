from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime


class AbstractCrawler(ABC):
    """抽象爬虫接口，定义所有平台爬虫的统一方法"""

    @abstractmethod
    def __init__(self, headless: bool = True, **kwargs):
        """初始化爬虫

        Args:
            headless: 是否使用无头模式
            **kwargs: 平台特定参数
        """
        pass

    @abstractmethod
    async def search(self, keyword: str, max_items: int = 50, **kwargs) -> List[Dict[str, Any]]:
        """搜索商品

        Args:
            keyword: 搜索关键词
            max_items: 最大返回数量
            **kwargs: 平台特定参数

        Returns:
            商品信息列表
        """
        pass

    @abstractmethod
    async def get_product_details(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """获取商品详情

        Args:
            product_ids: 商品ID列表

        Returns:
            商品详情列表
        """
        pass

    @abstractmethod
    async def get_comments(self, product_id: str, max_comments: int = 100) -> List[Dict[str, Any]]:
        """获取商品评论

        Args:
            product_id: 商品ID
            max_comments: 最大评论数

        Returns:
            评论列表
        """
        pass

    @abstractmethod
    async def login(self, username: str, password: str) -> bool:
        """登录平台

        Args:
            username: 用户名
            password: 密码

        Returns:
            是否登录成功
        """
        pass

    @abstractmethod
    async def close(self):
        """关闭爬虫，释放资源"""
        pass

    def _standardize_product_data(self, raw_data: Dict[str, Any], platform: str) -> Dict[str, Any]:
        """标准化商品数据格式

        Args:
            raw_data: 原始数据
            platform: 平台名称

        Returns:
            标准化后的数据
        """
        return {
            "platform": platform,
            "product_id": raw_data.get("product_id", ""),
            "title": raw_data.get("title", ""),
            "price": float(raw_data.get("price", 0)),
            "original_price": float(raw_data.get("original_price", 0)),
            "rating": float(raw_data.get("rating", 0)),
            "review_count": int(raw_data.get("review_count", 0)),
            "image_url": raw_data.get("image_url", ""),
            "product_url": raw_data.get("product_url", ""),
            "category": raw_data.get("category", ""),
            "seller": raw_data.get("seller", ""),
            "crawled_at": datetime.now().isoformat(),
            "raw_data": raw_data  # 保留原始数据
        }

    def _standardize_comment_data(self, raw_data: Dict[str, Any], platform: str) -> Dict[str, Any]:
        """标准化评论数据格式

        Args:
            raw_data: 原始数据
            platform: 平台名称

        Returns:
            标准化后的数据
        """
        return {
            "platform": platform,
            "comment_id": raw_data.get("comment_id", ""),
            "product_id": raw_data.get("product_id", ""),
            "user_name": raw_data.get("user_name", ""),
            "user_rating": float(raw_data.get("user_rating", 0)),
            "comment_text": raw_data.get("comment_text", ""),
            "comment_date": raw_data.get("comment_date", ""),
            "helpful_count": int(raw_data.get("helpful_count", 0)),
            "crawled_at": datetime.now().isoformat(),
            "raw_data": raw_data  # 保留原始数据
        }