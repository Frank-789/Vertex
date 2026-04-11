'''
京东商品信息爬虫（优化版）
功能：爬取京东指定关键词的商品信息
字段：品牌名、排名、商品信息、功效类型
特点：采用渐进式下滑爬取，类似小红书逻辑
'''

from DrissionPage import ChromiumPage
from DrissionPage.common import Actions
from DrissionPage.errors import NoRectError, ElementLostError
import random
import time
import re
import csv

# 过滤文本中的特殊字符
def clean_text(text):
    if not text:
        return ""
    # 移除所有非文字字符（保留中文、英文、数字、标点）
    pattern = re.compile(r'[^\u4e00-\u9fa5a-zA-Z0-9.,，。！？!?;；:：""''\'\"()（）《》<>/\\\-_+=\s%￥¥]')
    return pattern.sub('', text).strip()

# 实例化浏览器对象
print("正在启动浏览器...")
wp = ChromiumPage()
ac = Actions(wp)

# 进入京东首页
print("正在打开京东首页...")
wp.get('https://www.jd.com/')
time.sleep(random.uniform(2, 3))

# 输入搜索关键词
search_keyword = input("请输入要搜索的商品关键词（例如：洗面奶）：")

# 定位搜索框并输入关键词
print(f"正在搜索关键词：{search_keyword}")
try:
    # 通过id定位搜索框
    search_box = wp.ele('#key')
    search_box.clear()
    search_box.input(search_keyword)
    time.sleep(1)
    
    # 点击搜索按钮
    search_button = wp.ele('xpath://button[@class="button"]')
    search_button.click()
    time.sleep(random.uniform(3, 4))
    print("搜索成功，进入商品列表页")
except Exception as e:
    print(f"搜索失败：{str(e)}")
    wp.quit()
    exit()

# 创建CSV文件并写入表头
csv_filename = f'{search_keyword}_商品信息.csv'
with open(csv_filename, 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['品牌名', '排名', '商品信息', '功效类型'])
    writer.writeheader()

print(f"CSV文件已创建：{csv_filename}")

# 存储已爬取的商品链接，避免重复
scraped_products = set()
products_data = []

# 设置要爬取的页数
pages_to_scrape = int(input("请输入要爬取的页数："))

# 全局排名计数器
global_rank = 0

# 每页爬取的商品数量
products_per_page = 28

for page in range(1, pages_to_scrape + 1):
    print(f"\n{'='*50}")
    print(f"正在爬取第 {page} 页")
    print(f"{'='*50}")
    
    # 等待页面加载
    time.sleep(random.uniform(2, 3))
    
    # 当前页已爬取的商品数
    page_product_count = 0
    
    # 存储当前页已处理的商品链接，避免重复
    processed_in_page = set()
    
    # 采用类似小红书的逻辑：不断获取当前可见的商品，爬取后继续滚动加载
    while page_product_count < products_per_page:
        try:
            # 获取当前页面可见的商品卡片（使用图片中的定位）
            product_cards = wp.eles('xpath://div[@class="_wrapper_8g5fc_1"]')
            
            # 如果找不到，尝试备用选择器
            if not product_cards:
                product_cards = wp.eles('xpath://div[contains(@class, "gl-i-wrap")]')
            
            if not product_cards:
                product_cards = wp.eles('xpath://li[@class="gl-item"]')
            
            print(f"当前找到 {len(product_cards)} 个商品卡片")
            
            # 遍历当前可见的商品卡片
            for card in product_cards:
                # 如果已经爬取够28个，跳出循环
                if page_product_count >= products_per_page:
                    break
                
                try:
                    # 获取商品链接，用于去重
                    try:
                        link_element = card.ele('tag:a')
                        product_url = link_element.attr('href')
                        
                        # 确保链接是完整的URL
                        if product_url and not product_url.startswith('http'):
                            product_url = 'https:' + product_url if product_url.startswith('//') else 'https://item.jd.com/' + product_url
                        
                        # 跳过已爬取的商品（全局去重）
                        if product_url in scraped_products:
                            continue
                        
                        # 跳过当前页已处理的商品
                        if product_url in processed_in_page:
                            continue
                        
                        scraped_products.add(product_url)
                        processed_in_page.add(product_url)
                        
                    except Exception as e:
                        print(f"获取商品链接失败：{str(e)}")
                        continue
                    
                    # 全局排名递增
                    global_rank += 1
                    page_product_count += 1
                    
                    print(f"\n处理第 {page_product_count} 个商品（全局排名：{global_rank}）...")
                    
                    # 点击进入商品详情页
                    try:
                        # 滚动到元素位置，确保可见
                        card.scroll.to_center()
                        time.sleep(0.5)
                        
                        # 点击商品卡片
                        link_element.click()
                        time.sleep(random.uniform(3, 4))
                        
                        # 切换到新标签页
                        wp.get_tab(-1)
                        time.sleep(2)
                        
                    except NoRectError:
                        print("元素无位置，跳过")
                        global_rank -= 1
                        page_product_count -= 1
                        continue
                    except Exception as e:
                        print(f"点击商品失败：{str(e)}")
                        global_rank -= 1
                        page_product_count -= 1
                        continue
                    
                    # 爬取商品详情
                    try:
                        # 滚动页面以确保所有元素加载
                        wp.scroll.to_bottom()
                        time.sleep(1)
                        wp.scroll.to_top()
                        time.sleep(1)
                        
                        # 1. 获取品牌名称
                        brand_name = "无"
                        try:
                            # 尝试多种选择器
                            brand_element = wp.ele('xpath://a[contains(@clstag, "shangpin|keycount|product|pinpai")]', timeout=2)
                            if brand_element:
                                brand_name = clean_text(brand_element.text)
                            
                            # 备用方法
                            if not brand_name or brand_name == "无":
                                brand_element = wp.ele('xpath://li[@clstag="shangpin|keycount|product|pinpai_2"]//a', timeout=2)
                                if brand_element:
                                    brand_name = clean_text(brand_element.text)
                        except:
                            print("未找到品牌名称")
                        
                        # 2. 获取商品信息/标题
                        product_info = "无"
                        try:
                            # 多种选择器尝试
                            title_selectors = [
                                'xpath://div[@class="sku-name"]',
                                'xpath://div[contains(@class, "sku-name")]',
                                'xpath://div[@class="itemInfo-wrap"]//div[@class="sku-name"]',
                                'css:.sku-name',
                                'css:.itemInfo-wrap .sku-name'
                            ]
                            
                            for selector in title_selectors:
                                try:
                                    title_element = wp.ele(selector, timeout=1)
                                    if title_element:
                                        product_info = clean_text(title_element.text)
                                        break
                                except:
                                    continue
                                    
                        except:
                            print("未找到商品信息")
                        
                        # 3. 获取功效类型
                        efficacy_type = "无"
                        try:
                            # 尝试在商品详情中查找"功效"、"清洁"等关键词
                            efficacy_selectors = [
                                'xpath://div[@class="text" and contains(text(), "清洁")]',
                                'xpath://div[@class="text" and contains(text(), "功效")]',
                                'xpath://div[contains(@class, "goods-base")]//div[contains(@class, "text")]',
                                'xpath://div[@class="Ptable-item"]//div[contains(text(), "功效")]',
                            ]
                            
                            for selector in efficacy_selectors:
                                try:
                                    efficacy_element = wp.ele(selector, timeout=1)
                                    if efficacy_element:
                                        efficacy_type = clean_text(efficacy_element.text)
                                        break
                                except:
                                    continue
                            
                            # 如果还是找不到，尝试从商品规格参数中提取
                            if efficacy_type == "无":
                                try:
                                    params = wp.eles('xpath://div[@class="Ptable-item"]')
                                    for param in params:
                                        param_text = param.text
                                        if "功效" in param_text or "清洁" in param_text:
                                            efficacy_type = clean_text(param_text)
                                            break
                                except:
                                    pass
                                    
                        except:
                            print("未找到功效类型")
                        
                        # 打印爬取的信息
                        print(f"品牌名：{brand_name}")
                        print(f"排名：{global_rank}")
                        print(f"商品信息：{product_info[:50]}...")
                        print(f"功效类型：{efficacy_type}")
                        
                        # 存储数据
                        product_data = {
                            '品牌名': brand_name,
                            '排名': global_rank,
                            '商品信息': product_info,
                            '功效类型': efficacy_type
                        }
                        
                        # 实时写入CSV
                        with open(csv_filename, 'a', encoding='utf-8-sig', newline='') as f:
                            writer = csv.DictWriter(f, fieldnames=['品牌名', '排名', '商品信息', '功效类型'])
                            writer.writerow(product_data)
                        
                        products_data.append(product_data)
                        print(f"✓ 商品数据已保存")
                        
                    except Exception as e:
                        print(f"爬取商品详情失败：{str(e)}")
                    
                    finally:
                        # 关闭当前标签页，返回列表页
                        try:
                            wp.close_tabs()
                            wp.get_tab(1)  # 切换回第一个标签页
                            time.sleep(random.uniform(1, 2))
                        except:
                            # 如果关闭失败，尝试返回
                            wp.back()
                            time.sleep(random.uniform(1, 2))
                    
                    # 渐进式滚动策略（类似小红书）
                    # 前10个：不滚动
                    # 10个后：每爬取2-3个就滚动一点
                    if page_product_count >= 10 and page_product_count % 3 == 0:
                        print("下滑加载更多商品...")
                        wp.scroll.down(300)  # 下滑300像素
                        time.sleep(random.uniform(1, 2))
                    
                except ElementLostError:
                    print("元素已失效，跳过")
                    continue
                except Exception as e:
                    print(f"处理商品时出错：{str(e)}")
                    # 确保返回列表页
                    try:
                        wp.get_tab(1)
                    except:
                        pass
                    continue
            
            # 如果已经爬取够28个，跳出循环
            if page_product_count >= products_per_page:
                print(f"\n已完成本页 {products_per_page} 个商品的爬取")
                break
            
            # 如果当前页面没有足够的商品，继续滚动加载
            if len(product_cards) == 0 or page_product_count < products_per_page:
                print("继续滚动加载更多商品...")
                wp.scroll.down(500)
                time.sleep(random.uniform(2, 3))
            
        except Exception as e:
            print(f"获取商品列表失败：{str(e)}")
            break
    
    # 翻页操作
    if page < pages_to_scrape:
        try:
            print("\n准备翻到下一页...")
            
            # 滚动到页面底部，确保翻页按钮可见
            wp.scroll.to_bottom()
            time.sleep(random.uniform(2, 3))
            
            # 多种翻页按钮选择器
            next_page_selectors = [
                'xpath://div[contains(@class, "pagination_next")]',
                'xpath://span[@class="p-num"]//a[contains(text(), "下一页")]',
                'xpath://a[contains(text(), "下一页")]',
                'css:.pagination_next_1jczn_8',
                'xpath://div[@class="pagination_next_1jczn_8"]'
            ]
            
            next_clicked = False
            for selector in next_page_selectors:
                try:
                    next_button = wp.ele(selector, timeout=2)
                    if next_button:
                        # 滚动到按钮位置
                        next_button.scroll.to_center()
                        time.sleep(1)
                        next_button.click()
                        next_clicked = True
                        print("成功翻页")
                        time.sleep(random.uniform(3, 4))
                        
                        # 翻页后滚动到顶部，准备爬取下一页
                        wp.scroll.to_top()
                        time.sleep(1)
                        break
                except:
                    continue
            
            if not next_clicked:
                print("未找到下一页按钮，爬取结束")
                break
                
        except Exception as e:
            print(f"翻页失败：{str(e)}")
            break

print(f"\n{'='*50}")
print(f"爬取完成！")
print(f"共获取 {len(products_data)} 条商品数据")
print(f"数据已保存到：{csv_filename}")
print(f"{'='*50}")

# 关闭浏览器
try:
    wp.quit()
except:
    pass