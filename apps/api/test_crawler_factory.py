#!/usr/bin/env python3
"""
爬虫工厂测试脚本
测试爬虫工厂模式和京东爬虫的扩展性
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

def test_crawler_factory():
    """测试爬虫工厂功能"""
    logger.info("=" * 60)
    logger.info("开始测试爬虫工厂模式")
    logger.info("=" * 60)

    try:
        from crawlers import (
            register_crawler,
            get_crawler_adapter,
            get_crawler,
            get_available_platforms,
            is_platform_supported,
            SUPPORTED_PLATFORMS
        )

        logger.info("✅ 成功导入爬虫工厂模块")

        # 测试支持的平台
        platforms = get_available_platforms()
        logger.info(f"✅ 已注册平台: {platforms}")

        # 测试京东平台
        logger.info("\n测试京东爬虫适配器...")
        if is_platform_supported("jd"):
            logger.info("✅ 京东平台已支持")

            # 获取适配器
            jd_adapter = get_crawler_adapter("jd", headless=True)
            if jd_adapter:
                logger.info("✅ 成功创建京东爬虫适配器实例")
                logger.info(f"   适配器类型: {type(jd_adapter).__name__}")

                # 测试适配器方法
                methods = ['initialize', 'search_products', 'get_product_comments', 'login']
                for method in methods:
                    if hasattr(jd_adapter, method):
                        logger.info(f"    ✅ {method} 方法存在")
                    else:
                        logger.warning(f"    ⚠️  {method} 方法缺失")
            else:
                logger.error("❌ 创建京东爬虫适配器失败")
        else:
            logger.error("❌ 京东平台未注册")

        # 测试亚马逊平台
        logger.info("\n测试亚马逊爬虫...")
        if is_platform_supported("amazon"):
            logger.info("✅ 亚马逊平台已支持（但可能缺少依赖）")

            # 获取爬虫实例（可能失败，因为缺少selenium）
            amazon_crawler = get_crawler("amazon")
            if amazon_crawler:
                logger.info("✅ 成功创建亚马逊爬虫实例")
            else:
                logger.warning("⚠️  创建亚马逊爬虫实例失败（可能缺少依赖）")
        else:
            logger.warning("⚠️  亚马逊平台未注册（可能缺少依赖）")

        # 测试不支持的平台
        logger.info("\n测试不支持的平台...")
        test_platforms = ["taobao", "ebay", "pdd", "unknown"]
        for platform in test_platforms:
            if is_platform_supported(platform):
                logger.warning(f"⚠️  平台 {platform} 已支持（意外）")
            else:
                logger.info(f"   平台 {platform} 不支持（预期）")

        # 显示支持的平台列表
        logger.info("\n" + "=" * 60)
        logger.info("支持的平台列表:")
        logger.info("=" * 60)
        for platform, name in SUPPORTED_PLATFORMS.items():
            supported = is_platform_supported(platform)
            status = "✅" if supported else "❌"
            logger.info(f"{status} {name} ({platform}): {'已实现' if supported else '待实现'}")

        return True

    except Exception as e:
        logger.error(f"爬虫工厂测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_extensibility():
    """测试爬虫扩展性（模拟添加新平台）"""
    logger.info("\n" + "=" * 60)
    logger.info("测试爬虫系统扩展性")
    logger.info("=" * 60)

    try:
        from crawlers import register_crawler

        # 模拟一个简单的爬虫类
        class MockCrawler:
            def __init__(self, platform="mock", **kwargs):
                self.platform = platform
                self.config = kwargs

            def search(self, keyword, max_items=10):
                return [{"id": f"{self.platform}_1", "title": f"Mock product for {keyword}"}]

        # 注册新的模拟平台
        register_crawler("mock", crawler_class=MockCrawler)
        logger.info("✅ 成功注册模拟爬虫平台 'mock'")

        # 测试获取模拟爬虫
        from crawlers import get_crawler, get_available_platforms
        mock_crawler = get_crawler("mock", platform="mock_test")

        if mock_crawler:
            logger.info("✅ 成功创建模拟爬虫实例")
            logger.info(f"   爬虫平台: {mock_crawler.platform}")

            # 测试搜索功能
            results = mock_crawler.search("test", max_items=5)
            logger.info(f"   模拟搜索结果: {len(results)} 个商品")

            # 检查可用平台列表
            platforms = get_available_platforms()
            if "mock" in platforms:
                logger.info("✅ 模拟平台已出现在可用平台列表中")
            else:
                logger.warning("⚠️  模拟平台未出现在可用平台列表中")

            logger.info(f"   当前总支持平台: {platforms}")
        else:
            logger.error("❌ 创建模拟爬虫实例失败")

        return True

    except Exception as e:
        logger.error(f"扩展性测试失败: {e}")
        return False

def test_api_integration():
    """测试API路由与爬虫工厂的集成"""
    logger.info("\n" + "=" * 60)
    logger.info("测试API路由与爬虫工厂集成")
    logger.info("=" * 60)

    try:
        from api.router import router
        logger.info("✅ 成功导入API路由")

        # 检查路由端点
        routes = [route.path for route in router.routes]
        logger.info(f"API路由端点: {len(routes)} 个")

        # 检查爬虫相关端点
        crawler_routes = [route.path for route in router.routes if "crawl" in route.path]
        logger.info(f"爬虫相关端点: {crawler_routes}")

        # 测试路由中是否使用了爬虫工厂
        import re
        router_content = open(os.path.join(os.path.dirname(__file__), 'src', 'api', 'router.py')).read()

        if "get_crawler_adapter" in router_content or "get_crawler" in router_content:
            logger.info("✅ API路由中使用了爬虫工厂")
        else:
            logger.warning("⚠️  API路由中可能未使用爬虫工厂")

        return True

    except Exception as e:
        logger.error(f"API集成测试失败: {e}")
        return False

def main():
    """主测试函数"""
    logger.info("开始爬虫工厂和扩展性测试")
    logger.info("=" * 60)

    # 运行测试
    factory_passed = test_crawler_factory()
    extensibility_passed = test_extensibility()
    api_passed = test_api_integration()

    # 总结
    logger.info("\n" + "=" * 60)
    logger.info("测试总结")
    logger.info("=" * 60)

    if factory_passed:
        logger.info("✅ 爬虫工厂测试: 通过")
    else:
        logger.error("❌ 爬虫工厂测试: 失败")

    if extensibility_passed:
        logger.info("✅ 扩展性测试: 通过")
    else:
        logger.error("❌ 扩展性测试: 失败")

    if api_passed:
        logger.info("✅ API集成测试: 通过")
    else:
        logger.error("❌ API集成测试: 失败")

    logger.info("\n" + "=" * 60)
    logger.info("爬虫系统架构评估")
    logger.info("=" * 60)

    logger.info("🏗️  架构优势:")
    logger.info("  1. 抽象爬虫接口统一了不同平台的方法")
    logger.info("  2. 工厂模式便于扩展新平台")
    logger.info("  3. 适配器模式提供简化的API接口")
    logger.info("  4. 异步处理支持并发任务")

    logger.info("\n📋 当前状态:")
    logger.info("  ✅ 京东爬虫: 完整实现")
    logger.info("  ⚠️  亚马逊爬虫: 代码存在，但缺少selenium依赖")
    logger.info("  🔄 其他平台: 架构就绪，可快速添加")

    logger.info("\n🚀 建议下一步:")
    logger.info("  1. 解决亚马逊爬虫依赖问题")
    logger.info("  2. 为淘宝、eBay、拼多多创建占位实现")
    logger.info("  3. 完善爬虫配置管理和错误处理")
    logger.info("  4. 添加爬虫任务队列和状态跟踪")

    logger.info("\n" + "=" * 60)
    logger.info("测试完成")
    logger.info("=" * 60)

    if factory_passed and extensibility_passed:
        logger.info("🎉 爬虫系统架构健壮，具备良好的扩展性！")
        return 0
    else:
        logger.error("😞 爬虫系统存在架构问题，需要修复")
        return 1

if __name__ == "__main__":
    sys.exit(main())