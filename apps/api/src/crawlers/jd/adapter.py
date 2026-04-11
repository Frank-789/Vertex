"""
京东爬虫API适配器
提供简化的API接口，供FastAPI路由调用
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor

from .product_crawler import JDProductCrawler
from .comment_crawler import JDCommentCrawler


class JDCrawlerAdapter:
    """京东爬虫适配器，封装爬虫实例提供统一API"""

    def __init__(self, headless: bool = True, user_data_dir: str = None):
        self.headless = headless
        self.user_data_dir = user_data_dir
        self.product_crawler = None
        self.comment_crawler = None
        self.logger = logging.getLogger(__name__)
        self.executor = ThreadPoolExecutor(max_workers=2)

    async def initialize(self):
        """初始化爬虫实例"""
        try:
            self.product_crawler = JDProductCrawler(
                headless=self.headless,
                user_data_dir=self.user_data_dir
            )
            self.comment_crawler = JDCommentCrawler(
                headless=self.headless,
                user_data_dir=self.user_data_dir
            )
            self.logger.info("京东爬虫适配器初始化成功")
            return True
        except Exception as e:
            self.logger.error(f"京东爬虫适配器初始化失败: {str(e)}")
            return False

    async def search_products(self, keyword: str, max_items: int = 50, **kwargs) -> Dict[str, Any]:
        """搜索商品

        Args:
            keyword: 搜索关键词
            max_items: 最大返回数量
            **kwargs: 其他参数

        Returns:
            搜索结果
        """
        try:
            if not self.product_crawler:
                if not await self.initialize():
                    return self._error_response("爬虫初始化失败")

            # 在单独的线程中运行阻塞的爬虫操作
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                self.executor,
                lambda: asyncio.run(self.product_crawler.search(keyword, max_items, **kwargs))
            )

            return {
                "success": True,
                "platform": "jd",
                "keyword": keyword,
                "count": len(results),
                "results": results,
                "message": f"成功搜索到 {len(results)} 个商品"
            }

        except Exception as e:
            self.logger.error(f"搜索商品失败: {str(e)}")
            return self._error_response(f"搜索失败: {str(e)}")

    async def get_product_comments(self, product_id: str, max_comments: int = 100, **kwargs) -> Dict[str, Any]:
        """获取商品评论

        Args:
            product_id: 商品ID
            max_comments: 最大评论数
            **kwargs: 其他参数

        Returns:
            评论结果
        """
        try:
            if not self.comment_crawler:
                if not await self.initialize():
                    return self._error_response("爬虫初始化失败")

            # 在单独的线程中运行阻塞的爬虫操作
            loop = asyncio.get_event_loop()
            comments = await loop.run_in_executor(
                self.executor,
                lambda: asyncio.run(self.comment_crawler.get_comments(product_id, max_comments, **kwargs))
            )

            return {
                "success": True,
                "platform": "jd",
                "product_id": product_id,
                "count": len(comments),
                "comments": comments,
                "message": f"成功获取 {len(comments)} 条评论"
            }

        except Exception as e:
            self.logger.error(f"获取商品评论失败: {str(e)}")
            return self._error_response(f"获取评论失败: {str(e)}")

    async def login(self, username: str, password: str) -> Dict[str, Any]:
        """登录京东账号

        Args:
            username: 用户名/手机号/邮箱
            password: 密码

        Returns:
            登录结果
        """
        try:
            if not self.product_crawler:
                if not await self.initialize():
                    return self._error_response("爬虫初始化失败")

            # 使用商品爬虫进行登录（评论爬虫共享登录状态）
            loop = asyncio.get_event_loop()
            success = await loop.run_in_executor(
                self.executor,
                lambda: asyncio.run(self.product_crawler.login(username, password))
            )

            if success:
                # 同步登录状态到评论爬虫
                self.comment_crawler.logged_in = True
                return {
                    "success": True,
                    "message": "登录成功",
                    "username": username,
                    "logged_in": True
                }
            else:
                return {
                    "success": False,
                    "message": "登录失败，可能需要验证码或滑块验证",
                    "username": username,
                    "logged_in": False
                }

        except Exception as e:
            self.logger.error(f"登录失败: {str(e)}")
            return self._error_response(f"登录失败: {str(e)}")

    async def get_product_details_batch(self, product_ids: List[str]) -> Dict[str, Any]:
        """批量获取商品详情

        Args:
            product_ids: 商品ID列表

        Returns:
            商品详情结果
        """
        try:
            if not self.product_crawler:
                if not await self.initialize():
                    return self._error_response("爬虫初始化失败")

            loop = asyncio.get_event_loop()
            products = await loop.run_in_executor(
                self.executor,
                lambda: asyncio.run(self.product_crawler.get_product_details(product_ids))
            )

            return {
                "success": True,
                "platform": "jd",
                "count": len(products),
                "products": products,
                "message": f"成功获取 {len(products)} 个商品详情"
            }

        except Exception as e:
            self.logger.error(f"批量获取商品详情失败: {str(e)}")
            return self._error_response(f"获取商品详情失败: {str(e)}")

    async def close(self):
        """关闭所有爬虫实例，释放资源"""
        try:
            if self.product_crawler:
                await self.product_crawler.close()
            if self.comment_crawler:
                await self.comment_crawler.close()
            self.executor.shutdown(wait=False)
            self.logger.info("京东爬虫适配器已关闭")
        except Exception as e:
            self.logger.error(f"关闭爬虫时出错: {str(e)}")

    def _error_response(self, message: str) -> Dict[str, Any]:
        """生成错误响应"""
        return {
            "success": False,
            "platform": "jd",
            "count": 0,
            "message": message,
            "error": True
        }

    async def health_check(self) -> Dict[str, Any]:
        """健康检查"""
        try:
            # 尝试访问京东首页
            if not self.product_crawler:
                if not await self.initialize():
                    return {"healthy": False, "message": "爬虫初始化失败"}

            loop = asyncio.get_event_loop()
            can_access = await loop.run_in_executor(
                self.executor,
                lambda: asyncio.run(self._test_access())
            )

            return {
                "healthy": can_access,
                "platform": "jd",
                "logged_in": self.product_crawler.logged_in if self.product_crawler else False,
                "message": "连接正常" if can_access else "无法访问京东"
            }

        except Exception as e:
            self.logger.error(f"健康检查失败: {str(e)}")
            return {"healthy": False, "message": f"健康检查失败: {str(e)}"}

    async def _test_access(self) -> bool:
        """测试是否能够访问京东"""
        try:
            if not self.product_crawler.browser:
                await self.product_crawler._init_browser()

            self.product_crawler.browser.get("https://www.jd.com/")
            self.product_crawler._human_delay(2, 3)
            return True
        except:
            return False

    async def get_comments(self, product_id: str, max_comments: int = 100) -> List[Dict[str, Any]]:
        """获取商品评论（抽象爬虫接口要求的方法）

        Args:
            product_id: 商品ID
            max_comments: 最大评论数

        Returns:
            评论列表
        """
        try:
            # 调用现有的get_product_comments方法
            result = await self.get_product_comments(product_id, max_comments)
            if result.get("success"):
                return result.get("comments", [])
            else:
                self.logger.error(f"获取评论失败: {result.get('message')}")
                return []
        except Exception as e:
            self.logger.error(f"get_comments方法出错: {str(e)}")
            return []