"""
亚马逊爬虫API适配器
提供简化的API接口，供FastAPI路由调用
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor

from .crawler_advanced import AmazonBestsellerScraper


class AmazonCrawlerAdapter:
    """亚马逊爬虫适配器，封装爬虫实例提供统一API"""

    def __init__(self, headless: bool = True, user_data_dir: str = None):
        self.headless = headless
        self.user_data_dir = user_data_dir
        self.scraper = None
        self.logger = logging.getLogger(__name__)
        self.executor = ThreadPoolExecutor(max_workers=2)

    async def initialize(self):
        """初始化爬虫实例"""
        try:
            self.scraper = AmazonBestsellerScraper(headless=self.headless)
            self.logger.info("亚马逊爬虫适配器初始化成功")
            return True
        except Exception as e:
            self.logger.error(f"亚马逊爬虫适配器初始化失败: {str(e)}")
            return False

    async def search_products(self, keyword: str, max_items: int = 50, **kwargs) -> Dict[str, Any]:
        """搜索商品

        注意：当前AmazonBestsellerScraper仅支持按类别抓取畅销榜，
        暂不支持关键词搜索。这里将关键词映射到最接近的类别进行搜索。

        Args:
            keyword: 搜索关键词
            max_items: 最大返回数量
            **kwargs: 其他参数

        Returns:
            商品信息列表
        """
        if not self.scraper:
            await self.initialize()

        try:
            # 将关键词映射到类别（简单映射）
            category_mapping = {
                'automotive': 'automotive',
                'baby': 'baby',
                'beauty': 'beauty',
                'diy': 'diy',
                'electronics': 'electronics',
                'fashion': 'fashion',
                'garden': 'lawn-and-garden',
                'health': 'hpc',
                'home': 'home',
                'office': 'office-products',
                'pet': 'pet-supplies',
                'sports': 'sporting-goods'
            }

            # 查找匹配的类别
            selected_category = None
            keyword_lower = keyword.lower()
            for cat_key, cat_value in category_mapping.items():
                if cat_key in keyword_lower:
                    selected_category = cat_value
                    break

            # 默认类别
            if not selected_category:
                selected_category = 'electronics'

            self.logger.info(f"亚马逊爬虫搜索: 关键词='{keyword}' -> 类别='{selected_category}'")

            # 启动浏览器并抓取
            self.scraper.driver = self.scraper._init_driver()
            self.scraper.driver.get(self.scraper.CATEGORY_URLS[selected_category])
            self.scraper.human_delay(3, 5)

            # 设置配送地址
            self.scraper.set_delivery_address()
            self.scraper.human_delay(2, 3)

            # 抓取商品
            products = self.scraper.scrape_page_products(strategy="ranking_badge", target_count=max_items)

            # 标准化数据格式
            standardized_products = []
            for idx, product in enumerate(products):
                standardized_products.append({
                    'platform': 'amazon',
                    'product_id': product.get('product_id', ''),
                    'title': product.get('title', ''),
                    'price': product.get('price', 0),
                    'original_price': product.get('original_price', 0),
                    'rating': product.get('rating', 0),
                    'review_count': product.get('review_count', 0),
                    'image_url': product.get('image_url', ''),
                    'product_url': product.get('url', ''),
                    'category': selected_category,
                    'seller': product.get('seller', ''),
                    'rank': idx + 1,
                    'crawled_at': self.scraper._get_current_time()
                })

            return {
                'success': True,
                'count': len(standardized_products),
                'products': standardized_products,
                'query': {
                    'keyword': keyword,
                    'category': selected_category,
                    'max_items': max_items
                }
            }

        except Exception as e:
            self.logger.error(f"亚马逊搜索失败: {e}")
            return {
                'success': False,
                'error': str(e),
                'count': 0,
                'products': []
            }

    async def get_product_details(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """获取商品详情（待实现）"""
        self.logger.warning("亚马逊商品详情功能待实现")
        return []

    async def get_product_comments(self, product_id: str, max_comments: int = 100) -> List[Dict[str, Any]]:
        """获取商品评论（待实现）"""
        self.logger.warning("亚马逊商品评论功能待实现")
        return []

    async def login(self, username: str, password: str) -> bool:
        """登录亚马逊（待实现）"""
        self.logger.warning("亚马逊登录功能待实现")
        return False

    async def close(self):
        """关闭爬虫，释放资源"""
        if self.scraper and hasattr(self.scraper, 'driver'):
            self.scraper.driver.quit()
            self.logger.info("亚马逊爬虫已关闭")