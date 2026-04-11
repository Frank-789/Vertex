import pytest
from fastapi.testclient import TestClient
import sys
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import app


@pytest.fixture
def client():
    """提供FastAPI测试客户端"""
    with TestClient(app) as client:
        yield client


@pytest.fixture
def mock_jd_crawler(monkeypatch):
    """模拟京东爬虫"""
    class MockJDCrawlerAdapter:
        async def search_products(self, keyword, max_items=50, **kwargs):
            return {
                'success': True,
                'count': 2,
                'products': [
                    {
                        'platform': 'jd',
                        'product_id': 'mock_001',
                        'title': f'{keyword} 测试商品1',
                        'price': 100.0,
                        'rating': 4.5,
                        'review_count': 100,
                        'image_url': 'https://example.com/image1.jpg',
                        'product_url': 'https://example.com/product1',
                        'category': 'test'
                    },
                    {
                        'platform': 'jd',
                        'product_id': 'mock_002',
                        'title': f'{keyword} 测试商品2',
                        'price': 200.0,
                        'rating': 4.7,
                        'review_count': 200,
                        'image_url': 'https://example.com/image2.jpg',
                        'product_url': 'https://example.com/product2',
                        'category': 'test'
                    }
                ]
            }

    mock_instance = MockJDCrawlerAdapter()
    monkeypatch.setattr('main.JD_CRAWLER_AVAILABLE', True)
    monkeypatch.setattr('main.JDCrawlerAdapter', MockJDCrawlerAdapter)
    return mock_instance


@pytest.fixture
def mock_amazon_crawler(monkeypatch):
    """模拟亚马逊爬虫"""
    class MockAmazonCrawlerAdapter:
        async def search_products(self, keyword, max_items=50, **kwargs):
            return {
                'success': True,
                'count': 2,
                'products': [
                    {
                        'platform': 'amazon',
                        'product_id': 'mock_amz_001',
                        'title': f'{keyword} 测试商品1',
                        'price': 50.0,
                        'rating': 4.2,
                        'review_count': 150,
                        'image_url': 'https://example.com/amz_image1.jpg',
                        'product_url': 'https://example.com/amz_product1',
                        'category': 'test'
                    },
                    {
                        'platform': 'amazon',
                        'product_id': 'mock_amz_002',
                        'title': f'{keyword} 测试商品2',
                        'price': 75.0,
                        'rating': 4.4,
                        'review_count': 250,
                        'image_url': 'https://example.com/amz_image2.jpg',
                        'product_url': 'https://example.com/amz_product2',
                        'category': 'test'
                    }
                ]
            }

    mock_instance = MockAmazonCrawlerAdapter()
    monkeypatch.setattr('main.AMAZON_CRAWLER_AVAILABLE', True)
    monkeypatch.setattr('main.AmazonCrawlerAdapter', MockAmazonCrawlerAdapter)
    return mock_instance


@pytest.fixture
def mock_file_processor(monkeypatch):
    """模拟文件处理器"""
    class MockFileProcessor:
        def process_file(self, file_path, filename):
            return {
                'filename': filename,
                'extension': '.txt',
                'file_type': 'text',
                'supported': True,
                'content_type': 'text',
                'content': '测试文件内容',
                'summary': {
                    'file_size': 1234,
                    'total_lines': 10,
                    'total_words': 50,
                    'total_chars': 200
                }
            }

    mock_instance = MockFileProcessor()
    monkeypatch.setattr('main.FILE_PROCESSOR_AVAILABLE', True)
    monkeypatch.setattr('main.file_processor', mock_instance)
    return mock_instance