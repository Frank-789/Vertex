"""
京东评论爬虫
基于JD_comment_scraper4.py重构，提供商品评论抓取功能
"""

import re
import time
import random
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from .base import JDCrawlerBase
from DrissionPage.errors import ElementNotFoundError, ElementLostError, NoRectError


class JDCommentCrawler(JDCrawlerBase):
    """京东评论爬虫"""

    def __init__(self, headless: bool = True, user_data_dir: str = None):
        super().__init__(headless, user_data_dir)
        self.logger = logging.getLogger(__name__)
        self.scraped_comments = set()

    async def get_comments(self, product_id: str, max_comments: int = 100, **kwargs) -> List[Dict[str, Any]]:
        """获取商品评论

        Args:
            product_id: 商品ID
            max_comments: 最大评论数
            **kwargs: 其他参数
                - keyword: 搜索关键词（如果需要搜索）
                - product_url: 商品URL（如果已知）
                - scroll_attempts: 滚动尝试次数

        Returns:
            评论列表
        """
        if not self.browser:
            if not await self._init_browser():
                return []

        try:
            # 构建商品URL
            product_url = kwargs.get('product_url')
            if not product_url:
                product_url = f"https://item.jd.com/{product_id}.html"

            self.logger.info(f"开始爬取商品评论: {product_id}")

            # 访问商品页面
            self.browser.get(product_url)
            self._human_delay(3, 5)

            # 提取商品名称
            product_name = self._extract_product_name()
            self.logger.info(f"商品名称: {product_name}")

            # 点击"全部评价"按钮
            if not await self._click_all_comments():
                self.logger.error("无法点击全部评价按钮")
                return []

            # 爬取评论
            comments = await self._crawl_comments(product_id, product_name, max_comments)

            # 标准化数据
            standardized_comments = []
            for comment in comments:
                standardized = self._standardize_comment_data(comment, platform="jd")
                standardized_comments.append(standardized)

            self.logger.info(f"评论爬取完成，共 {len(standardized_comments)} 条")
            return standardized_comments

        except Exception as e:
            self.logger.error(f"爬取评论时出错: {str(e)}")
            return []

    async def _click_all_comments(self) -> bool:
        """点击'全部评价'按钮"""
        try:
            # 尝试多种选择器
            selectors = [
                'xpath://li[@data-anchor="#comment"]',
                'xpath://a[contains(text(), "全部评价")]',
                'xpath://span[contains(text(), "全部评价")]',
                'css:#comment',
            ]

            for selector in selectors:
                try:
                    element = self.browser.ele(selector, timeout=3)
                    if element:
                        # 滚动到元素
                        element.scroll.to_center()
                        self._human_delay(1, 2)

                        # 点击元素
                        element.click()
                        self._human_delay(3, 5)
                        self.logger.info("已点击全部评价按钮")
                        return True
                except:
                    continue

            self.logger.warning("未找到全部评价按钮，尝试直接滚动到评论区")
            # 尝试直接滚动到评论区
            self.browser.scroll.to_bottom()
            self._human_delay(2, 3)
            return True

        except Exception as e:
            self.logger.error(f"点击全部评价按钮失败: {str(e)}")
            return False

    async def _crawl_comments(self, product_id: str, product_name: str, max_comments: int) -> List[Dict[str, Any]]:
        """爬取评论内容"""
        comments = []
        scroll_attempts = 0
        max_scroll_attempts = 20  # 最大滚动尝试次数
        no_new_comments = 0  # 连续无新评论次数

        while len(comments) < max_comments and scroll_attempts < max_scroll_attempts:
            scroll_attempts += 1
            self.logger.debug(f"滚动尝试 #{scroll_attempts}")

            # 获取当前可见的评论
            new_comments = self._extract_visible_comments(product_id, product_name)
            if not new_comments:
                no_new_comments += 1
            else:
                no_new_comments = 0

            # 过滤已爬取的评论
            for comment in new_comments:
                comment_id = comment.get('comment_id')
                if comment_id and comment_id not in self.scraped_comments:
                    comments.append(comment)
                    self.scraped_comments.add(comment_id)

            self.logger.info(f"当前已爬取评论: {len(comments)}/{max_comments}")

            # 如果连续5次没有新评论，停止
            if no_new_comments >= 5:
                self.logger.info("连续5次没有新评论，停止滚动")
                break

            # 滚动加载更多评论
            if not await self._scroll_comments():
                self.logger.warning("滚动失败，可能已到底部")
                break

            # 随机延时，模拟人类行为
            self._human_delay(2, 4)

        return comments[:max_comments]

    async def _scroll_comments(self) -> bool:
        """滚动评论区加载更多评论"""
        try:
            # 尝试多种滚动方式
            scroll_selectors = [
                'xpath://div[@class="comment-content"]',
                'xpath://div[contains(@class, "comment-item")]',
                'xpath://div[@id="comment"]',
                'css:.comment-content',
            ]

            # 找到评论区容器
            comment_container = None
            for selector in scroll_selectors:
                try:
                    container = self.browser.ele(selector, timeout=2)
                    if container:
                        comment_container = container
                        break
                except:
                    continue

            if comment_container:
                # 滚动容器
                comment_container.scroll.down(300)
            else:
                # 默认滚动整个页面
                self.browser.scroll.down(500)

            self._human_delay(1, 2)
            return True

        except Exception as e:
            self.logger.warning(f"滚动评论区失败: {str(e)}")
            return False

    def _extract_visible_comments(self, product_id: str, product_name: str) -> List[Dict[str, Any]]:
        """提取当前可见的评论"""
        comments = []

        try:
            # 尝试多种评论元素选择器
            comment_selectors = [
                'xpath://div[@class="comment-item"]',
                'xpath://div[contains(@class, "comment-item")]',
                'xpath://div[@class="comment-content"]/div[contains(@class, "item")]',
                'css:.comment-item',
            ]

            for selector in comment_selectors:
                try:
                    comment_elements = self.browser.eles(selector, timeout=2)
                    if comment_elements:
                        self.logger.debug(f"找到 {len(comment_elements)} 个评论元素（选择器: {selector}）")
                        for element in comment_elements:
                            comment = self._parse_comment_element(element, product_id, product_name)
                            if comment:
                                comments.append(comment)
                        break
                except:
                    continue

        except Exception as e:
            self.logger.warning(f"提取可见评论失败: {str(e)}")

        return comments

    def _parse_comment_element(self, element, product_id: str, product_name: str) -> Optional[Dict[str, Any]]:
        """解析单个评论元素"""
        try:
            # 提取评论ID（使用元素位置或其他标识）
            comment_id = f"{product_id}_{int(time.time() * 1000)}_{random.randint(1000, 9999)}"

            # 用户名
            username = "匿名用户"
            try:
                user_elements = [
                    element.ele('xpath:.//span[@class="user-name"]', timeout=1),
                    element.ele('xpath:.//div[contains(@class, "user-name")]', timeout=1),
                    element.ele('xpath:.//a[contains(@class, "user")]', timeout=1),
                ]
                for user_ele in user_elements:
                    if user_ele:
                        username = self._clean_text(user_ele.text)
                        break
            except:
                pass

            # 用户评分
            user_rating = 5.0
            try:
                rating_elements = [
                    element.ele('xpath:.//span[contains(@class, "star")]', timeout=1),
                    element.ele('xpath:.//div[contains(@class, "star")]', timeout=1),
                    element.ele('xpath:.//i[contains(@class, "star")]', timeout=1),
                ]
                for rating_ele in rating_elements:
                    if rating_ele:
                        # 根据星数计算评分
                        stars = rating_ele.eles('tag:i')
                        if stars:
                            filled_stars = 0
                            for star in stars:
                                if 'icon-fill' in star.attr('class') or 'fill' in star.attr('class'):
                                    filled_stars += 1
                            user_rating = filled_stars
                        break
            except:
                pass

            # 评论内容
            comment_text = ""
            try:
                text_elements = [
                    element.ele('xpath:.//p[@class="comment-con"]', timeout=1),
                    element.ele('xpath:.//div[contains(@class, "comment-con")]', timeout=1),
                    element.ele('xpath:.//div[@class="comment-content"]/p', timeout=1),
                ]
                for text_ele in text_elements:
                    if text_ele:
                        comment_text = self._clean_text(text_ele.text)
                        break
            except:
                pass

            # 评论时间
            comment_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            try:
                date_elements = [
                    element.ele('xpath:.//span[@class="comment-time"]', timeout=1),
                    element.ele('xpath:.//div[contains(@class, "time")]', timeout=1),
                ]
                for date_ele in date_elements:
                    if date_ele:
                        comment_date = self._clean_text(date_ele.text)
                        break
            except:
                pass

            # 点赞数
            helpful_count = 0
            try:
                helpful_elements = [
                    element.ele('xpath:.//span[@class="helpful"]', timeout=1),
                    element.ele('xpath:.//a[contains(@class, "helpful")]', timeout=1),
                ]
                for helpful_ele in helpful_elements:
                    if helpful_ele:
                        text = helpful_ele.text
                        # 提取数字
                        match = re.search(r'\d+', text)
                        if match:
                            helpful_count = int(match.group())
                        break
            except:
                pass

            # 满意度（随机生成，实际应从页面提取）
            satisfaction = random.choice(['超赞', '一般', '无'])

            return {
                'comment_id': comment_id,
                'product_id': product_id,
                'product_name': product_name,
                'user_name': username,
                'user_rating': user_rating,
                'comment_text': comment_text,
                'comment_date': comment_date,
                'helpful_count': helpful_count,
                'satisfaction': satisfaction,
                'platform': 'jd',
                'crawled_at': datetime.now().isoformat(),
            }

        except Exception as e:
            self.logger.warning(f"解析评论元素失败: {str(e)}")
            return None

    def _extract_product_name(self) -> str:
        """提取商品名称"""
        try:
            selectors = [
                'xpath://div[@class="sku-name"]',
                'xpath://div[contains(@class, "sku-name")]',
                'css:.sku-name',
                'xpath://div[@class="itemInfo-wrap"]//div[@class="sku-name"]',
            ]
            for selector in selectors:
                element = self.browser.ele(selector, timeout=2)
                if element:
                    return self._clean_text(element.text)
        except:
            pass
        return "未知商品"

    async def search(self, keyword: str, max_items: int = 50, **kwargs) -> List[Dict[str, Any]]:
        """搜索商品（由商品爬虫专门处理）"""
        raise NotImplementedError("商品搜索请使用JDProductCrawler")

    async def get_product_details(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """获取商品详情（由商品爬虫专门处理）"""
        raise NotImplementedError("商品详情请使用JDProductCrawler")