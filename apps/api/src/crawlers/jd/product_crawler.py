"""
京东商品信息爬虫
基于JD_main3.py重构，提供商品搜索和详情抓取功能
"""

import re
import time
import random
import logging
from typing import Dict, List, Any, Optional
from urllib.parse import urljoin

from .base import JDCrawlerBase
from DrissionPage.common import Actions
from DrissionPage.errors import NoRectError, ElementLostError


class JDProductCrawler(JDCrawlerBase):
    """京东商品爬虫"""

    def __init__(self, headless: bool = True, user_data_dir: str = None):
        super().__init__(headless, user_data_dir)
        self.actions = None
        self.logger = logging.getLogger(__name__)

    async def _init_browser(self):
        """初始化浏览器和Actions"""
        if await super()._init_browser():
            self.actions = Actions(self.browser)
            return True
        return False

    async def search(self, keyword: str, max_items: int = 50, **kwargs) -> List[Dict[str, Any]]:
        """搜索京东商品

        Args:
            keyword: 搜索关键词
            max_items: 最大返回数量
            **kwargs: 其他参数
                - pages: 爬取页数
                - category: 商品类目

        Returns:
            商品信息列表
        """
        if not self.browser:
            if not await self._init_browser():
                return []

        try:
            pages = kwargs.get('pages', 1)
            products = []
            scraped_urls = set()

            # 访问京东首页
            self.browser.get(self.base_url)
            self._human_delay(2, 3)

            # 输入搜索关键词
            if not await self._search_keyword(keyword):
                self.logger.error("搜索失败")
                return []

            for page in range(1, pages + 1):
                if len(products) >= max_items:
                    break

                self.logger.info(f"正在爬取第 {page} 页")

                # 如果是第一页，已经在上一步搜索后进入
                if page > 1:
                    if not await self._go_to_page(page):
                        break
                    self._human_delay(2, 3)

                # 爬取当前页商品
                page_products = await self._crawl_current_page(max_items - len(products), scraped_urls)
                products.extend(page_products)

                self.logger.info(f"第 {page} 页爬取完成，累计 {len(products)} 个商品")

            # 标准化数据
            standardized_products = []
            for product in products:
                standardized = self._standardize_product_data(product, platform="jd")
                standardized_products.append(standardized)

            return standardized_products

        except Exception as e:
            self.logger.error(f"搜索商品时出错: {str(e)}")
            return []
        finally:
            # 关闭详情页标签，返回列表页
            await self._close_detail_tabs()

    async def _search_keyword(self, keyword: str) -> bool:
        """在京东搜索关键词"""
        try:
            # 定位搜索框
            search_box = self.browser.ele('#key', timeout=10)
            if not search_box:
                self.logger.error("未找到搜索框")
                return False

            search_box.clear()
            search_box.input(keyword)
            self._human_delay(1, 2)

            # 点击搜索按钮
            search_button = self.browser.ele('xpath://button[@class="button"]', timeout=5)
            if not search_button:
                # 尝试其他选择器
                search_button = self.browser.ele('css:.button', timeout=5)

            if search_button:
                search_button.click()
                self._human_delay(3, 4)
                self.logger.info(f"搜索关键词: {keyword}")
                return True
            else:
                self.logger.error("未找到搜索按钮")
                return False

        except Exception as e:
            self.logger.error(f"搜索关键词失败: {str(e)}")
            return False

    async def _go_to_page(self, page_num: int) -> bool:
        """跳转到指定页码"""
        try:
            # 尝试找到分页按钮
            page_input = self.browser.ele('css:.input-txt', timeout=5)
            if page_input:
                page_input.clear()
                page_input.input(str(page_num))
                self._human_delay(1, 2)

                # 点击跳转按钮
                go_button = self.browser.ele('css:.btn.btn-default', timeout=5)
                if go_button:
                    go_button.click()
                    return True

            # 备用方法：点击页码链接
            page_link = self.browser.ele(f'text={page_num}', timeout=5)
            if page_link:
                page_link.click()
                return True

            self.logger.warning(f"无法跳转到第 {page_num} 页")
            return False

        except Exception as e:
            self.logger.error(f"跳转页面失败: {str(e)}")
            return False

    async def _crawl_current_page(self, max_items: int, scraped_urls: set) -> List[Dict[str, Any]]:
        """爬取当前页面的商品"""
        products = []
        page_product_count = 0

        while page_product_count < max_items:
            try:
                # 获取当前可见的商品卡片
                product_cards = self.browser.eles('xpath://div[@class="_wrapper_8g5fc_1"]')
                if not product_cards:
                    product_cards = self.browser.eles('xpath://div[contains(@class, "gl-i-wrap")]')
                if not product_cards:
                    product_cards = self.browser.eles('xpath://li[@class="gl-item"]')

                if not product_cards:
                    self.logger.warning("未找到商品卡片")
                    break

                self.logger.debug(f"找到 {len(product_cards)} 个商品卡片")

                for card in product_cards:
                    if page_product_count >= max_items:
                        break

                    try:
                        # 获取商品链接
                        link_element = card.ele('tag:a')
                        product_url = link_element.attr('href')
                        if not product_url:
                            continue

                        # 补全URL
                        if not product_url.startswith('http'):
                            product_url = 'https:' + product_url if product_url.startswith('//') else 'https://item.jd.com/' + product_url

                        # 去重
                        if product_url in scraped_urls:
                            continue

                        # 点击进入详情页
                        product_data = await self._crawl_product_detail(card, product_url)
                        if product_data:
                            products.append(product_data)
                            scraped_urls.add(product_url)
                            page_product_count += 1
                            self.logger.info(f"成功爬取商品: {product_data.get('title', '未知')}")

                    except Exception as e:
                        self.logger.warning(f"处理商品卡片失败: {str(e)}")
                        continue

                # 滚动加载更多商品
                if page_product_count < max_items:
                    self.browser.scroll.down(500)
                    self._human_delay(2, 3)

            except Exception as e:
                self.logger.error(f"爬取当前页时出错: {str(e)}")
                break

        return products

    async def _crawl_product_detail(self, card, product_url: str) -> Optional[Dict[str, Any]]:
        """爬取商品详情页"""
        original_tab = self.browser.tabs[-1]  # 当前标签页

        try:
            # 滚动到元素并点击
            card.scroll.to_center()
            self._human_delay(0.5, 1)
            link_element = card.ele('tag:a')
            link_element.click()
            self._human_delay(3, 4)

            # 切换到新标签页
            new_tab = self.browser.tabs[-1]
            self.browser.change_tab(new_tab)
            self._human_delay(2, 3)

            # 滚动页面确保加载
            self.browser.scroll.to_bottom()
            self._human_delay(1, 2)
            self.browser.scroll.to_top()
            self._human_delay(1, 2)

            # 提取商品信息
            product_data = {
                'product_id': self._extract_product_id(product_url),
                'title': self._extract_title(),
                'price': self._extract_price(),
                'original_price': self._extract_original_price(),
                'brand_name': self._extract_brand(),
                'rating': self._extract_rating(),
                'review_count': self._extract_review_count(),
                'image_url': self._extract_image_url(),
                'product_url': product_url,
                'category': self._extract_category(),
                'seller': self._extract_seller(),
            }

            # 关闭详情页标签，返回列表页
            self.browser.close_tab()
            self.browser.change_tab(original_tab)
            self._human_delay(1, 2)

            return product_data

        except Exception as e:
            self.logger.error(f"爬取商品详情失败: {str(e)}")
            # 尝试恢复原始标签页
            try:
                self.browser.change_tab(original_tab)
            except:
                pass
            return None

    async def _close_detail_tabs(self):
        """关闭所有详情页标签，保留主标签页"""
        try:
            if self.browser and len(self.browser.tabs) > 1:
                # 保留第一个标签页
                main_tab = self.browser.tabs[0]
                for tab in self.browser.tabs[1:]:
                    self.browser.change_tab(tab)
                    self.browser.close_tab()
                self.browser.change_tab(main_tab)
        except Exception as e:
            self.logger.warning(f"关闭标签页时出错: {str(e)}")

    def _extract_product_id(self, url: str) -> str:
        """从URL提取商品ID"""
        match = re.search(r'/(\d+)\.html', url)
        return match.group(1) if match else ""

    def _extract_title(self) -> str:
        """提取商品标题"""
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

    def _extract_price(self) -> float:
        """提取商品价格"""
        try:
            selectors = [
                'xpath://span[@class="price J-p-100000000000"]',
                'xpath://span[contains(@class, "price")]',
                'css:.price',
            ]
            for selector in selectors:
                element = self.browser.ele(selector, timeout=2)
                if element:
                    text = element.text
                    # 提取数字
                    match = re.search(r'[\d,]+\.?\d*', text)
                    if match:
                        price_str = match.group().replace(',', '')
                        return float(price_str)
        except:
            pass
        return 0.0

    def _extract_original_price(self) -> float:
        """提取商品原价"""
        try:
            element = self.browser.ele('xpath://del', timeout=2)
            if element:
                text = element.text
                match = re.search(r'[\d,]+\.?\d*', text)
                if match:
                    price_str = match.group().replace(',', '')
                    return float(price_str)
        except:
            pass
        return 0.0

    def _extract_brand(self) -> str:
        """提取品牌名称"""
        try:
            selectors = [
                'xpath://a[contains(@clstag, "shangpin|keycount|product|pinpai")]',
                'xpath://li[@clstag="shangpin|keycount|product|pinpai_2"]//a',
                'css:.brand',
            ]
            for selector in selectors:
                element = self.browser.ele(selector, timeout=2)
                if element:
                    return self._clean_text(element.text)
        except:
            pass
        return "未知品牌"

    def _extract_rating(self) -> float:
        """提取商品评分"""
        try:
            element = self.browser.ele('xpath://strong[@class="percent-con"]', timeout=2)
            if element:
                text = element.text
                match = re.search(r'\d+\.?\d*', text)
                if match:
                    return float(match.group())
        except:
            pass
        return 0.0

    def _extract_review_count(self) -> int:
        """提取评论数量"""
        try:
            element = self.browser.ele('xpath://div[@id="comment-count"]/a', timeout=2)
            if element:
                text = element.text
                match = re.search(r'\d+', text)
                if match:
                    return int(match.group())
        except:
            pass
        return 0

    def _extract_image_url(self) -> str:
        """提取商品图片URL"""
        try:
            element = self.browser.ele('xpath://img[@id="spec-img"]', timeout=2)
            if element:
                url = element.attr('data-origin')
                if url:
                    return 'https:' + url if not url.startswith('http') else url
        except:
            pass
        return ""

    def _extract_category(self) -> str:
        """提取商品类目"""
        try:
            element = self.browser.ele('xpath://div[@class="crumb fl clearfix"]', timeout=2)
            if element:
                categories = element.eles('tag:a')
                if categories and len(categories) > 1:
                    return self._clean_text(categories[-2].text)
        except:
            pass
        return ""

    def _extract_seller(self) -> str:
        """提取卖家信息"""
        try:
            element = self.browser.ele('xpath://div[@class="name"]/a', timeout=2)
            if element:
                return self._clean_text(element.text)
        except:
            pass
        return "京东自营"

    async def get_product_details(self, product_ids: List[str]) -> List[Dict[str, Any]]:
        """批量获取商品详情"""
        products = []
        for product_id in product_ids:
            try:
                url = f"https://item.jd.com/{product_id}.html"
                # 这里可以优化为批量处理
                # 暂时使用单个访问的方式
                product_data = await self._get_single_product_detail(product_id, url)
                if product_data:
                    products.append(product_data)
            except Exception as e:
                self.logger.error(f"获取商品详情失败 {product_id}: {str(e)}")
        return products

    async def _get_single_product_detail(self, product_id: str, url: str) -> Optional[Dict[str, Any]]:
        """获取单个商品详情"""
        if not self.browser:
            if not await self._init_browser():
                return None

        try:
            self.browser.get(url)
            self._human_delay(3, 4)

            # 滚动页面
            self.browser.scroll.to_bottom()
            self._human_delay(1, 2)
            self.browser.scroll.to_top()
            self._human_delay(1, 2)

            product_data = {
                'product_id': product_id,
                'title': self._extract_title(),
                'price': self._extract_price(),
                'original_price': self._extract_original_price(),
                'brand_name': self._extract_brand(),
                'rating': self._extract_rating(),
                'review_count': self._extract_review_count(),
                'image_url': self._extract_image_url(),
                'product_url': url,
                'category': self._extract_category(),
                'seller': self._extract_seller(),
            }

            return product_data

        except Exception as e:
            self.logger.error(f"获取商品详情失败: {str(e)}")
            return None

    async def get_comments(self, product_id: str, max_comments: int = 100) -> List[Dict[str, Any]]:
        """获取商品评论（由评论爬虫专门处理）"""
        # 这个方法由JDCommentCrawler专门处理
        raise NotImplementedError("评论抓取请使用JDCommentCrawler")