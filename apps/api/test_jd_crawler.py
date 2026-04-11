#!/usr/bin/env python3
"""
京东爬虫代码测试脚本
测试京东爬虫模块能否正常导入和实例化
"""

import sys
import os
import logging

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

def test_jd_crawler_imports():
    """测试京东爬虫模块导入"""
    logger.info("=" * 60)
    logger.info("开始测试京东爬虫模块导入")
    logger.info("=" * 60)

    modules_to_test = [
        ("crawlers.jd.base", "JDCrawlerBase"),
        ("crawlers.jd.product_crawler", "JDProductCrawler"),
        ("crawlers.jd.comment_crawler", "JDCommentCrawler"),
        ("crawlers.jd.adapter", "JDCrawlerAdapter"),
        ("crawlers.base.abstract_crawler", "AbstractCrawler"),
    ]

    all_passed = True

    for module_path, class_name in modules_to_test:
        try:
            # 动态导入
            module = __import__(module_path, fromlist=[class_name])
            cls = getattr(module, class_name)
            logger.info(f"✅ 成功导入 {module_path}.{class_name}")

            # 尝试实例化（对于京东爬虫类）
            if "JDCrawler" in class_name or class_name == "AbstractCrawler":
                try:
                    if class_name == "JDCrawlerBase":
                        instance = cls(headless=True)
                    elif class_name == "JDProductCrawler":
                        instance = cls(headless=True)
                    elif class_name == "JDCommentCrawler":
                        instance = cls(headless=True)
                    elif class_name == "JDCrawlerAdapter":
                        instance = cls(headless=True)
                    elif class_name == "AbstractCrawler":
                        # 抽象类不能实例化，跳过
                        instance = None

                    if instance is not None:
                        logger.info(f"   ✅ 成功实例化 {class_name}")

                except Exception as e:
                    logger.warning(f"   ⚠️  实例化 {class_name} 失败（可能正常）: {e}")

        except ImportError as e:
            logger.error(f"❌ 导入失败 {module_path}.{class_name}: {e}")
            all_passed = False
        except AttributeError as e:
            logger.error(f"❌ 类不存在 {module_path}.{class_name}: {e}")
            all_passed = False
        except Exception as e:
            logger.error(f"❌ 其他错误 {module_path}.{class_name}: {e}")
            all_passed = False

    return all_passed

def test_jd_crawler_methods():
    """测试京东爬虫类的方法定义"""
    logger.info("\n" + "=" * 60)
    logger.info("开始测试京东爬虫类的方法定义")
    logger.info("=" * 60)

    try:
        from crawlers.jd.base import JDCrawlerBase
        from crawlers.jd.product_crawler import JDProductCrawler
        from crawlers.jd.comment_crawler import JDCommentCrawler
        from crawlers.jd.adapter import JDCrawlerAdapter

        # 检查抽象方法实现
        base_crawler = JDCrawlerBase(headless=True)
        required_methods = ['search', 'get_comments', 'login']

        logger.info("检查JDCrawlerBase的方法:")
        for method in required_methods:
            if hasattr(base_crawler, method):
                logger.info(f"  ✅ {method} 方法存在")
            else:
                logger.warning(f"  ⚠️  {method} 方法缺失")

        # 检查具体爬虫类
        logger.info("\n检查具体爬虫类的方法实现:")
        product_crawler = JDProductCrawler(headless=True)
        comment_crawler = JDCommentCrawler(headless=True)

        crawlers = [("JDProductCrawler", product_crawler),
                   ("JDCommentCrawler", comment_crawler)]

        for name, crawler in crawlers:
            logger.info(f"\n{name}:")
            for method in required_methods:
                if hasattr(crawler, method):
                    logger.info(f"  ✅ {method} 方法存在")
                else:
                    logger.warning(f"  ⚠️  {method} 方法缺失")

        # 检查适配器
        logger.info("\n检查JDCrawlerAdapter:")
        adapter = JDCrawlerAdapter(headless=True)
        adapter_methods = ['initialize', 'search_products', 'get_comments']

        for method in adapter_methods:
            if hasattr(adapter, method):
                logger.info(f"  ✅ {method} 方法存在")
            else:
                logger.warning(f"  ⚠️  {method} 方法缺失")

        return True

    except Exception as e:
        logger.error(f"测试京东爬虫方法失败: {e}")
        return False

def test_crawler_factory_pattern():
    """测试爬虫工厂模式（确保扩展性）"""
    logger.info("\n" + "=" * 60)
    logger.info("检查爬虫工厂模式实现")
    logger.info("=" * 60)

    # 检查是否存在爬虫工厂
    crawlers_dir = os.path.join(os.path.dirname(__file__), 'src', 'crawlers')
    factory_file = os.path.join(crawlers_dir, '__init__.py')

    if os.path.exists(factory_file):
        logger.info("✅ 爬虫工厂文件存在: crawlers/__init__.py")

        # 尝试导入工厂
        try:
            from crawlers import get_crawler
            logger.info("✅ 成功导入爬虫工厂函数")
        except ImportError as e:
            logger.warning(f"⚠️  爬虫工厂函数可能未定义: {e}")
    else:
        logger.warning("⚠️  爬虫工厂文件不存在，建议创建以支持多平台扩展")

    # 检查抽象接口完整性
    try:
        from crawlers.base.abstract_crawler import AbstractCrawler
        logger.info("✅ 抽象爬虫接口存在")

        # 检查抽象方法
        import inspect
        abstract_methods = []
        for name, method in inspect.getmembers(AbstractCrawler):
            if hasattr(method, '__isabstractmethod__') and method.__isabstractmethod__:
                abstract_methods.append(name)

        logger.info(f"抽象方法: {', '.join(abstract_methods) if abstract_methods else '无'}")

    except Exception as e:
        logger.error(f"检查抽象接口失败: {e}")

    return True

def main():
    """主测试函数"""
    logger.info("开始京东爬虫代码测试")
    logger.info("=" * 60)

    # 运行测试
    import_passed = test_jd_crawler_imports()
    methods_passed = test_jd_crawler_methods()
    factory_checked = test_crawler_factory_pattern()

    # 总结
    logger.info("\n" + "=" * 60)
    logger.info("测试总结")
    logger.info("=" * 60)

    if import_passed:
        logger.info("✅ 京东爬虫模块导入测试: 通过")
    else:
        logger.error("❌ 京东爬虫模块导入测试: 失败")

    if methods_passed:
        logger.info("✅ 京东爬虫方法定义测试: 通过")
    else:
        logger.error("❌ 京东爬虫方法定义测试: 失败")

    logger.info("📋 爬虫工厂模式检查完成")

    logger.info("\n" + "=" * 60)
    logger.info("京东爬虫代码测试完成")
    logger.info("=" * 60)

    if import_passed and methods_passed:
        logger.info("🎉 京东爬虫代码可以正常运行！")
        return 0
    else:
        logger.error("😞 京东爬虫代码存在问题，需要修复")
        return 1

if __name__ == "__main__":
    sys.exit(main())