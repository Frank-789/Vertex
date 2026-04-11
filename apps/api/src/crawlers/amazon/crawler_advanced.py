from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
from webdriver_manager.chrome import ChromeDriverManager
import time
import random
import csv
import re
from datetime import datetime
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='amazon_scraper.log'
)

class AmazonBestsellerScraper:
    
    CATEGORY_URLS = {
        "automotive": "https://www.amazon.sg/gp/bestsellers/automotive/ref=zg_bs_nav_automotive_0",
        "baby": "https://www.amazon.sg/gp/bestsellers/baby/ref=zg_bs_nav_baby_0",
        "beauty": "https://www.amazon.sg/gp/bestsellers/beauty/ref=zg_bs_nav_beauty_0",
        "diy": "https://www.amazon.sg/gp/bestsellers/diy/ref=zg_bs_nav_diy_0",
        "electronics": "https://www.amazon.sg/gp/bestsellers/electronics/ref=zg_bs_nav_electronics_0",
        "fashion": "https://www.amazon.sg/gp/bestsellers/fashion/ref=zg_bs_nav_fashion_0",
        "lawn-and-garden": "https://www.amazon.sg/gp/bestsellers/lawn-and-garden/ref=zg_bs_nav_lawn-and-garden_0",
        "hpc": "https://www.amazon.sg/gp/bestsellers/hpc/ref=zg_bs_nav_hpc_0",
        "home": "https://www.amazon.sg/gp/bestsellers/home/ref=zg_bs_nav_home_0",
        "biss": "https://www.amazon.sg/gp/bestsellers/biss/ref=zg_bs_nav_biss_0",
        "office-products": "https://www.amazon.sg/gp/bestsellers/office-products/ref=zg_bs_nav_office-products_0",
        "pet-supplies": "https://www.amazon.sg/gp/bestsellers/pet-supplies/ref=zg_bs_nav_pet-supplies_0",
        "sporting-goods": "https://www.amazon.sg/gp/bestsellers/sporting-goods/ref=zg_bs_nav_sporting-goods_0"
    }
    
    CATEGORY_NAMES = {
        "automotive": "Automotive",
        "baby": "Baby Products",
        "beauty": "Beauty",
        "diy": "DIY & Tools",
        "electronics": "Electronics",
        "fashion": "Fashion",
        "lawn-and-garden": "Garden",
        "hpc": "Health, Household & Personal Care",
        "home": "Home",
        "biss": "Musical Instruments",
        "office-products": "Office Products",
        "pet-supplies": "Pet Supplies",
        "sporting-goods": "Sporting Goods"
    }
    
    def __init__(self, headless=False, postal_code="640548"):
        self.options = Options()
        self.postal_code = postal_code
        
        self.options.add_argument("--disable-blink-features=AutomationControlled")
        self.options.add_experimental_option("excludeSwitches", ["enable-automation"])
        self.options.add_experimental_option("useAutomationExtension", False)
        
        prefs = {"profile.managed_default_content_settings.images": 2}
        self.options.add_experimental_option("prefs", prefs)
        
        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        ]
        self.options.add_argument(f"user-agent={random.choice(user_agents)}")
        
        if headless:
            self.options.add_argument("--headless")
            self.options.add_argument("--disable-gpu")
        
        self.service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=self.service, options=self.options)
        self.driver.maximize_window()
        self.driver.set_page_load_timeout(60)
        
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        logging.info("Browser initialized successfully")
    
    def human_delay(self, min_sec=1, max_sec=3):
        time.sleep(random.uniform(min_sec, max_sec))
    
    def set_delivery_address(self):
        try:
            address_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "glow-ingress-block"))
            )
            address_button.click()
            logging.info("Clicked address selection button")
            self.human_delay(1, 2)
            
            postal_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "GLUXZipUpdateInput"))
            )
            postal_input.clear()
            postal_input.send_keys(self.postal_code)
            logging.info(f"Entered postal code: {self.postal_code}")
            
            submit_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.ID, "GLUXZipUpdate"))
            )
            submit_button.click()
            logging.info("Submitted postal code")
            self.human_delay(2, 3)
            
            try:
                close_btn = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.ID, "GLUXConfirmClose"))
                )
                close_btn.click()
                logging.info("Closed address confirmation popup")
            except:
                pass
            
            return True
        except Exception as e:
            logging.error(f"Failed to set delivery address: {str(e)}")
            return False
    
    def progressive_scroll_and_load(self, target_count=50, initial_scrolls=5):
        scroll_distance = random.randint(800, 1400)
        
        print(f"    📜 Starting initial scrolling (total {initial_scrolls} times)...")
        for i in range(initial_scrolls):
            self.driver.execute_script(f"window.scrollBy(0, {scroll_distance});")
            delay = random.uniform(3, 5)
            print(f"    📜 Scroll {i+1}/{initial_scrolls}, waiting {delay:.1f} seconds to load content...")
            time.sleep(delay)
        
        current_count = len(self.get_products_by_ranking_badge())
        print(f"    ℹ️  After initial {initial_scrolls} scrolls, obtained {current_count} products")
        
        if current_count < target_count:
            print(f"    📍 Target not reached, resetting delivery address to continue loading...")
            self.set_delivery_address()
            self.human_delay(2, 3)
            print(f"    ✅ Delivery address set, continuing additional scrolling...")
        
        additional_scroll_count = 0
        no_increase_count = 0
        
        while current_count < target_count:
            larger_scroll = int(scroll_distance * 1.8)
            self.driver.execute_script(f"window.scrollBy(0, {larger_scroll});")
            
            delay = random.uniform(7, 8)
            additional_scroll_count += 1
            print(f"    📜 Additional scroll #{additional_scroll_count} (increased amplitude), waiting {delay:.1f} seconds to load content...")
            time.sleep(delay)
            
            new_count = len(self.get_products_by_ranking_badge())
            
            if new_count > current_count:
                increase = new_count - current_count
                print(f"    ✓ Added {increase} products, total now {new_count}")
                current_count = new_count
                no_increase_count = 0
            else:
                no_increase_count += 1
                print(f"    ⚠ No new products from this scroll, still at {current_count} (consecutive no increase: {no_increase_count})")
            
            if current_count >= target_count:
                print(f"    ✅ Reached target of {target_count} products")
                break
            
            if no_increase_count >= 5:
                print(f"    ⚠ No increase for {no_increase_count} consecutive scrolls, may have reached page bottom")
                break
            
            if additional_scroll_count >= 20:
                print(f"    ⚠ Already scrolled {additional_scroll_count} additional times, stopping")
                break
        
        logging.info(f"Completed progressive scrolling, final count: {current_count} products")
        return current_count
    
    def get_products_by_ranking_badge(self):
        products = []
        try:
            ranking_elements = self.driver.find_elements(By.CLASS_NAME, "zg-bdg-text")
            
            for idx, rank_elem in enumerate(ranking_elements):
                try:
                    rank_text = rank_elem.text.strip()
                    
                    parent = rank_elem.find_element(By.XPATH, "./ancestor::div[contains(@class, 'zg-grid-general-faceout') or contains(@id, 'gridItemRoot')]")
                    
                    product_link = parent.find_element(By.CSS_SELECTOR, "a[href*='/dp/']")
                    product_url = product_link.get_attribute("href")
                    
                    if product_url and "/dp/" in product_url:
                        products.append({
                            'url': product_url,
                            'rank_text': rank_text
                        })
                        
                except Exception as e:
                    logging.debug(f"Skipped ranking badge #{idx+1}: {str(e)}")
                    continue
            
            logging.info(f"Located {len(products)} products by ranking badge")
            
        except Exception as e:
            logging.error(f"Failed to get products by ranking badge: {str(e)}")
        
        return products
    
    def get_products_backup_method(self):
        products = []
        try:
            product_selectors = [
                "div.zg-grid-general-faceout a.a-link-normal[href*='/dp/']",
                "div[id^='gridItemRoot'] a[href*='/dp/']",
                "div.p13n-sc-uncoverable-faceout a[href*='/dp/']"
            ]
            
            for selector in product_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        seen_urls = set()
                        for elem in elements:
                            href = elem.get_attribute("href")
                            if href and "/dp/" in href and href not in seen_urls:
                                products.append({
                                    'url': href,
                                    'rank_text': None
                                })
                                seen_urls.add(href)
                        if products:
                            logging.info(f"Backup method found {len(products)} products")
                            break
                except:
                    continue
            
        except Exception as e:
            logging.error(f"Backup method failed: {str(e)}")
        
        return products
    
    def scrape_page_products(self, strategy="ranking_badge", target_count=50):
        self.progressive_scroll_and_load(target_count=target_count, initial_scrolls=5)
        
        if strategy == "ranking_badge":
            print(f"    🎯 【Strategy: Ranking Badge Location】 Starting final scraping...")
            all_products = self.get_products_by_ranking_badge()
        else:
            print(f"    📄 【Strategy: Backup Selector Location】 Starting final scraping...")
            all_products = self.get_products_backup_method()
        
        seen_urls = set()
        unique_products = []
        for p in all_products:
            if p['url'] not in seen_urls:
                unique_products.append(p)
                seen_urls.add(p['url'])
        
        print(f"    ✓ Final obtained {len(unique_products)} unique products")
        
        if len(unique_products) >= target_count:
            print(f"    ✅ Reached target of {target_count} products")
            return unique_products[:target_count]
        else:
            print(f"    ⚠ Only obtained {len(unique_products)} products (target: {target_count})")
            return unique_products
    
    def navigate_to_next_page(self, category_key, current_page, max_page=3):
        next_page = current_page + 1
        
        if next_page > max_page:
            print(f"    ⚠ Reached maximum page count {max_page}, stopping pagination")
            return False
        
        try:
            next_url = f"https://www.amazon.sg/gp/bestsellers/{category_key}/ref=zg_bs_pg_{next_page}_{category_key}?ie=UTF8&pg={next_page}"
            
            print(f"    🔄 Navigating to page {next_page}...")
            print(f"       URL: {next_url}")
            
            self.driver.get(next_url)
            self.human_delay(5, 7)
            
            print(f"    📍 Setting delivery address after pagination...")
            self.set_delivery_address()
            self.human_delay(2, 3)
            
            try:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CLASS_NAME, "zg-bdg-text"))
                )
                print(f"    ✅ Successfully entered page {next_page}")
                return True
            except TimeoutException:
                print(f"    ⚠ Constructed URL failed, trying main URL")
                main_url = self.CATEGORY_URLS.get(category_key)
                if main_url:
                    self.driver.get(main_url)
                    self.human_delay(3, 5)
                    try:
                        for _ in range(next_page - 1):
                            next_btn = WebDriverWait(self.driver, 5).until(
                                EC.element_to_be_clickable((By.LINK_TEXT, "Next page"))
                            )
                            next_btn.click()
                            self.human_delay(3, 5)
                        return True
                    except:
                        print(f"    ✗ Pagination failed")
                        return False
                return False
                
        except Exception as e:
            logging.error(f"Pagination failed: {str(e)}")
            print(f"    ✗ Failed to paginate to page {next_page}")
            return False
    
    def extract_product_info(self, url, rank, category):
        product_data = {
            'Date': datetime.now().strftime("%Y-%m-%d"),
            'Title': '',
            'Manufacturer': 'Not Available',
            'ASIN': '',
            'Category': category,
            'Rank': rank,
            'Best_Seller_In': '',
            'Fulfilled_By': '',
            'Sold_By': '',
            'Rating': '',
            'International_Rating': ''
        }
        
        try:
            print(f"      → Scraping product #{rank}...")
            self.driver.get(url)
            self.human_delay(3, 5)
            
            match = re.search(r'/dp/([A-Z0-9]{10})', url)
            if match:
                product_data['ASIN'] = match.group(1)
            
            try:
                title_selectors = [
                    "#productTitle",
                    "span#productTitle",
                    "h1#title span#productTitle"
                ]
                for selector in title_selectors:
                    try:
                        title_element = WebDriverWait(self.driver, 8).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                        )
                        product_data['Title'] = title_element.text.strip()
                        if product_data['Title']:
                            break
                    except:
                        continue
            except Exception as e:
                logging.debug(f"Failed to extract Title: {str(e)}")
            
            try:
                manufacturer_selectors = [
                    "a#bylineInfo",
                    "div#bylineInfo_feature_div a.a-link-normal",
                    "div#bylineInfo_feature_div a",
                    "tr.po-brand td.a-span9 span"
                ]
                for selector in manufacturer_selectors:
                    try:
                        manufacturer_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                        manufacturer_text = manufacturer_element.text.strip()
                        if manufacturer_text:
                            manufacturer_text = manufacturer_text.replace("Visit the", "").replace("Store", "").strip()
                            product_data['Manufacturer'] = manufacturer_text
                            break
                    except:
                        continue
            except Exception as e:
                logging.debug(f"Failed to extract Manufacturer: {str(e)}")
            
            try:
                best_seller = self.driver.find_element(By.CSS_SELECTOR, "span.cat-link").text.strip()
                product_data['Best_Seller_In'] = best_seller
                logging.info(f"Product {product_data['ASIN']} Best_Seller_In: {best_seller}")
            except Exception as e:
                product_data['Best_Seller_In'] = ""
                logging.debug(f"Failed to extract Best_Seller_In: {str(e)}")
            
            try:
                self.driver.execute_script("window.scrollBy(0, 800);")
                self.human_delay(1, 2)
                
                rating_selector = "#averageCustomerReviews .a-size-base.a-color-base"
                rating_element = WebDriverWait(self.driver, 8).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, rating_selector))
                )
                star_rating = rating_element.text.strip()
                product_data['Rating'] = star_rating
                logging.info(f"Product {product_data['ASIN']} star rating: {star_rating}")
            except Exception as e:
                product_data['Rating'] = ""
                logging.debug(f"Failed to extract star rating: {str(e)}")
            
            try:
                self.driver.execute_script("window.scrollBy(0, 1500);")
                self.human_delay(1, 2)
                
                international_rating_selectors = [
                    "div.a-box.a-color-alternate-background.review div.a-box-inner",
                    "div[data-hook='cr-filter-info-review-rating-count']"
                ]
                for selector in international_rating_selectors:
                    try:
                        element = WebDriverWait(self.driver, 8).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                        )
                        international_text = element.text.strip()
                        if international_text:
                            product_data['International_Rating'] = international_text
                            break
                    except:
                        continue
                
                if not product_data['International_Rating']:
                    product_data['International_Rating'] = "There are 0 reviews and 0 ratings from Singapore"
                    
            except Exception as e:
                product_data['International_Rating'] = "There are 0 reviews and 0 ratings from Singapore"
                logging.debug(f"Failed to extract International_Rating: {str(e)}")
            
            try:
                fulfilled_selectors = [
                    "div[offer-display-feature-name='desktop-fulfiller-info'] .offer-display-feature-text-message",
                    "div#delivery-message-content span"
                ]
                for selector in fulfilled_selectors:
                    try:
                        fulfilled_element = WebDriverWait(self.driver, 8).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                        )
                        fulfilled_text = fulfilled_element.text.strip()
                        if "Amazon" in fulfilled_text:
                            if "Amazon.sg" in fulfilled_text or "Amazon SG" in fulfilled_text:
                                product_data['Fulfilled_By'] = "Amazon SG"
                            elif "Amazon US" in fulfilled_text:
                                product_data['Fulfilled_By'] = "Amazon US"
                            else:
                                product_data['Fulfilled_By'] = "Amazon"
                            break
                        else:
                            product_data['Fulfilled_By'] = "Other"
                            break
                    except:
                        continue
                
                if not product_data['Fulfilled_By']:
                    product_data['Fulfilled_By'] = "Other"
                    
            except Exception as e:
                product_data['Fulfilled_By'] = "Other"
                logging.debug(f"Failed to extract Fulfilled_By: {str(e)}")
            
            try:
                sold_selector = "div[offer-display-feature-name='desktop-merchant-info'] .offer-display-feature-text-message"
                sold_element = WebDriverWait(self.driver, 8).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, sold_selector))
                )
                product_data['Sold_By'] = sold_element.text.strip()
            except Exception as e:
                product_data['Sold_By'] = "Not Available"
                logging.debug(f"Failed to extract Sold_By: {str(e)}")
            
            print(f"      ✓ Product #{rank}: {product_data['Title'][:40]}...")
            logging.info(f"Successfully extracted product: {product_data['Title'][:30]}... (ASIN: {product_data['ASIN']})")
            
        except Exception as e:
            logging.error(f"Failed to extract product info {url}: {str(e)}")
            print(f"      ✗ Product #{rank} extraction failed")
        
        return product_data
    
    def save_to_csv(self, data, filename):
        if not data or not data.get('Title'):
            logging.warning("No valid data to save")
            return
        
        try:
            with open(filename, 'a', encoding='utf-8-sig', newline='') as f:
                fieldnames = ['Date', 'Title', 'Manufacturer', 'ASIN', 'Category', 'Rank', 'Best_Seller_In', 'Fulfilled_By', 'Sold_By', 'Rating', 'International_Rating']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writerow(data)
            
            logging.info(f"Product {data.get('ASIN', 'Unknown ASIN')} written to CSV in real-time")
        except Exception as e:
            logging.error(f"Failed to save to CSV in real-time: {str(e)}")
    
    def scrape_category(self, category_key, category_name, csv_filename, max_products=100):
        print(f"\n{'='*70}")
        print(f"  Starting to scrape category: 【{category_name}】")
        print(f"  Category code: {category_key}")
        print(f"{'='*70}")
        
        category_url = self.CATEGORY_URLS.get(category_key)
        if not category_url:
            print(f"  ✗ URL for category {category_key} not found")
            return 0
        
        try:
            print(f"\n  🌐 Visiting category homepage...")
            print(f"     URL: {category_url}")
            self.driver.get(category_url)
            self.human_delay(5, 8)
            
            print(f"  📍 Setting delivery address...")
            self.set_delivery_address()
            self.human_delay(2, 3)
            
            all_products_info = []
            current_page = 1
            max_pages = 3
            
            while current_page <= max_pages and len(all_products_info) < max_products:
                print(f"\n  {'─'*60}")
                print(f"  📄 Scraping page {current_page}")
                print(f"  {'─'*60}")
                
                remaining = max_products - len(all_products_info)
                target_this_page = min(50, remaining)
                
                page_products = self.scrape_page_products(strategy="ranking_badge", target_count=target_this_page)
                
                if not page_products:
                    print(f"  ⚠ No products found on page {current_page}, trying backup strategy...")
                    page_products = self.scrape_page_products(strategy="backup", target_count=target_this_page)
                
                if not page_products:
                    print(f"  ✗ No products on page {current_page}, stopping pagination")
                    break
                
                print(f"\n  ✅ Page {current_page} obtained {len(page_products)} product links")
                print(f"  📦 Starting to extract detailed product information...")
                
                for idx, product in enumerate(page_products, 1):
                    if len(all_products_info) >= max_products:
                        break
                    
                    global_rank = (current_page - 1) * 50 + idx
                    
                    product_info = self.extract_product_info(
                        product['url'], 
                        global_rank, 
                        category_name
                    )
                    
                    if product_info and product_info.get('Title'):
                        self.save_to_csv(product_info, csv_filename)
                        all_products_info.append(product_info)
                    
                    self.human_delay(2, 4)
                
                print(f"\n  ✓ Page {current_page} scraping completed, cumulative {len(all_products_info)} products")
                
                if len(all_products_info) >= max_products:
                    print(f"  ✅ Reached target quantity {max_products}, stopping scraping")
                    break
                
                if current_page < max_pages:
                    print(f"\n  ⏳ Waiting 5-7 seconds before paginating to page {current_page + 1}...")
                    self.human_delay(5, 7)
                    
                    if self.navigate_to_next_page(category_key, current_page, max_pages):
                        current_page += 1
                    else:
                        print(f"  ⚠ Pagination failed or reached last page")
                        break
                else:
                    print(f"  ℹ Reached maximum page count {max_pages}")
                    break
            
            print(f"\n{'='*70}")
            print(f"  ✅ Category 【{category_name}】 scraping completed")
            print(f"  📊 Total obtained: {len(all_products_info)} products")
            print(f"{'='*70}")
            
            return len(all_products_info)
            
        except Exception as e:
            logging.error(f"Failed to scrape category {category_name}: {str(e)}")
            print(f"  ✗ Category scraping exception: {str(e)}")
            return len(all_products_info) if 'all_products_info' in locals() else 0
    
    def close(self):
        if self.driver:
            self.driver.quit()
            logging.info("Browser closed")


def main():
    MAX_PRODUCTS_PER_CATEGORY = 100
    HEADLESS_MODE = False
    POSTAL_CODE = "640548"
    
    csv_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = f"amazon_bestsellers_optimized_{csv_timestamp}.csv"
    
    with open(csv_filename, 'w', encoding='utf-8-sig', newline='') as f:
        fieldnames = ['Date', 'Title', 'Manufacturer', 'ASIN', 'Category', 'Rank', 'Best_Seller_In', 'Fulfilled_By', 'Sold_By', 'Rating', 'International_Rating']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
    
    print("=" * 80)
    print("Amazon Bestseller Scraper - Optimized Version".center(80))
    print("=" * 80)
    print(f"✓ CSV file initialized: {csv_filename}")
    print(f"✓ Target: {MAX_PRODUCTS_PER_CATEGORY} products per category")
    print(f"✓ Postal code: {POSTAL_CODE}")
    print("=" * 80)
    
    total_products = 0
    
    try:
        scraper = AmazonBestsellerScraper(headless=HEADLESS_MODE, postal_code=POSTAL_CODE)
        
        print(f"\n📋 List of categories to scrape (total {len(scraper.CATEGORY_URLS)}):")
        for idx, (key, name) in enumerate(scraper.CATEGORY_NAMES.items(), 1):
            print(f"  {idx:2d}. {name} ({key})")
        
        print("\n" + "=" * 80)
        print("Starting Batch Scraping".center(80))
        print("=" * 80)
        
        for idx, (category_key, category_name) in enumerate(scraper.CATEGORY_NAMES.items(), 1):
            print(f"\n\n🎯 [{idx}/{len(scraper.CATEGORY_NAMES)}] Current category: {category_name}")
            
            category_count = scraper.scrape_category(
                category_key=category_key,
                category_name=category_name,
                csv_filename=csv_filename,
                max_products=MAX_PRODUCTS_PER_CATEGORY
            )
            
            total_products += category_count
            
            print(f"\n  📈 This category obtained: {category_count} products")
            print(f"  📊 Cumulative total: {total_products} products")
            
            if idx < len(scraper.CATEGORY_NAMES):
                delay = random.uniform(8, 12)
                print(f"\n  ⏳ Waiting {delay:.1f} seconds before next category...\n")
                time.sleep(delay)
        
        print("\n" + "=" * 80)
        print("🎉 All Scraping Tasks Completed! 🎉".center(80))
        print("=" * 80)
        print(f"  📁 CSV file: {csv_filename}")
        print(f"  📊 Total categories: {len(scraper.CATEGORY_NAMES)}")
        print(f"  📦 Total products: {total_products}")
        print("=" * 80)
        
        scraper.close()
        
    except KeyboardInterrupt:
        print("\n\n⚠ User interrupted the program")
        scraper.close()
        print(f"✓ Saved {total_products} products to {csv_filename}")
        
    except Exception as e:
        print(f"\n\n✗ Program error: {str(e)}")
        logging.error(f"Main program error: {str(e)}")
        if 'scraper' in locals():
            scraper.close()


if __name__ == "__main__":
    main()