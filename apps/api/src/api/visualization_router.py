from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random
import logging

router = APIRouter(prefix="/visualization", tags=["visualization"])

# 模拟数据生成器
class VisualizationDataGenerator:
    @staticmethod
    def generate_time_series_data(
        time_range: str = "7d",
        platforms: Optional[List[str]] = None,
        categories: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """生成时间序列数据"""
        platforms = platforms or ["jd", "amazon", "taobao", "ebay", "pinduoduo"]
        categories = categories or ["electronics", "clothing", "home", "beauty", "food"]

        days = 7
        if time_range == "30d":
            days = 30
        elif time_range == "90d":
            days = 90
        elif time_range == "1y":
            days = 365

        data = []
        base_date = datetime.now() - timedelta(days=days)

        for i in range(days):
            date = base_date + timedelta(days=i)
            for platform in platforms:
                for category in categories:
                    # 模拟数据趋势
                    base_value = random.randint(100, 1000)
                    trend = 1 + (i / days) * 0.5  # 向上趋势
                    seasonal = 1 + 0.2 * random.random()  # 季节性波动
                    noise = 1 + 0.1 * random.random()  # 随机噪声

                    value = int(base_value * trend * seasonal * noise)

                    data.append({
                        "date": date.isoformat(),
                        "platform": platform,
                        "category": category,
                        "sales": value,
                        "reviews": int(value * random.uniform(0.1, 0.3)),
                        "price": round(random.uniform(50, 500), 2),
                        "conversion_rate": round(random.uniform(0.01, 0.05), 4)
                    })

        return data

    @staticmethod
    def generate_summary_stats(
        time_range: str = "7d",
        platforms: Optional[List[str]] = None,
        categories: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """生成汇总统计"""
        platforms = platforms or ["jd", "amazon", "taobao", "ebay", "pinduoduo"]
        categories = categories or ["electronics", "clothing", "home", "beauty", "food"]

        # 模拟统计数据
        total_sales = random.randint(100000, 500000)
        total_reviews = random.randint(10000, 50000)
        avg_price = round(random.uniform(100, 300), 2)
        avg_conversion = round(random.uniform(0.02, 0.04), 4)

        # 平台分布
        platform_distribution = []
        platform_total = 0
        for platform in platforms:
            value = random.randint(10000, 100000)
            platform_distribution.append({
                "platform": platform,
                "value": value,
                "percentage": 0  # 稍后计算
            })
            platform_total += value

        for item in platform_distribution:
            item["percentage"] = round(item["value"] / platform_total * 100, 1)

        # 类目分布
        category_distribution = []
        category_total = 0
        for category in categories:
            value = random.randint(5000, 50000)
            category_distribution.append({
                "category": category,
                "value": value,
                "percentage": 0
            })
            category_total += value

        for item in category_distribution:
            item["percentage"] = round(item["value"] / category_total * 100, 1)

        # 趋势数据（最近7天）
        trend_data = []
        for i in range(7):
            date = (datetime.now() - timedelta(days=6-i)).strftime("%Y-%m-%d")
            trend_data.append({
                "date": date,
                "sales": random.randint(10000, 20000),
                "reviews": random.randint(1000, 3000)
            })

        return {
            "summary": {
                "total_sales": total_sales,
                "total_reviews": total_reviews,
                "avg_price": avg_price,
                "avg_conversion": avg_conversion,
                "platform_count": len(platforms),
                "category_count": len(categories)
            },
            "platform_distribution": platform_distribution,
            "category_distribution": category_distribution,
            "trend_data": trend_data,
            "top_products": [
                {"name": "智能手机", "platform": "jd", "sales": 12000, "growth": 15.5},
                {"name": "笔记本电脑", "platform": "amazon", "sales": 9800, "growth": 8.2},
                {"name": "运动鞋", "platform": "taobao", "sales": 7500, "growth": 22.1},
                {"name": "化妆品套装", "platform": "jd", "sales": 6200, "growth": 12.7},
                {"name": "家用电器", "platform": "amazon", "sales": 5400, "growth": 5.3}
            ]
        }

generator = VisualizationDataGenerator()

@router.get("/data")
async def get_visualization_data(
    time_range: str = Query("7d", description="时间范围: 7d, 30d, 90d, 1y"),
    platforms: Optional[List[str]] = Query(None, description="平台筛选"),
    categories: Optional[List[str]] = Query(None, description="类目筛选")
):
    """获取可视化图表数据"""
    try:
        data = generator.generate_time_series_data(
            time_range=time_range,
            platforms=platforms,
            categories=categories
        )

        # 按平台和类目聚合
        aggregated_data = []
        platform_set = set(item["platform"] for item in data)
        category_set = set(item["category"] for item in data)

        for platform in platform_set:
            platform_data = [item for item in data if item["platform"] == platform]
            for category in category_set:
                category_data = [item for item in platform_data if item["category"] == category]
                if category_data:
                    total_sales = sum(item["sales"] for item in category_data)
                    total_reviews = sum(item["reviews"] for item in category_data)
                    avg_price = sum(item["price"] for item in category_data) / len(category_data)
                    avg_conversion = sum(item["conversion_rate"] for item in category_data) / len(category_data)

                    aggregated_data.append({
                        "platform": platform,
                        "category": category,
                        "total_sales": total_sales,
                        "total_reviews": total_reviews,
                        "avg_price": round(avg_price, 2),
                        "avg_conversion": round(avg_conversion, 4),
                        "data_points": len(category_data)
                    })

        return {
            "success": True,
            "time_range": time_range,
            "platforms": list(platform_set),
            "categories": list(category_set),
            "aggregated_data": aggregated_data,
            "raw_data_sample": data[:10] if data else [],  # 返回前10条原始数据作为样本
            "total_records": len(data)
        }
    except Exception as e:
        logging.error(f"获取可视化数据失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取可视化数据失败: {str(e)}")

@router.get("/stats")
async def get_visualization_stats(
    time_range: str = Query("7d", description="时间范围: 7d, 30d, 90d, 1y"),
    platforms: Optional[List[str]] = Query(None, description="平台筛选"),
    categories: Optional[List[str]] = Query(None, description="类目筛选")
):
    """获取可视化统计信息"""
    try:
        stats = generator.generate_summary_stats(
            time_range=time_range,
            platforms=platforms,
            categories=categories
        )

        return {
            "success": True,
            "time_range": time_range,
            "stats": stats
        }
    except Exception as e:
        logging.error(f"获取可视化统计失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取可视化统计失败: {str(e)}")

@router.post("/export")
async def export_visualization_data(
    format: str = Query("csv", description="导出格式: csv, json"),
    data: Optional[Dict[str, Any]] = None
):
    """导出可视化数据"""
    try:
        # 这里应该是实际的数据导出逻辑
        # 目前返回模拟的导出结果
        if format == "csv":
            content = "date,platform,category,sales,reviews,price,conversion_rate\n"
            content += "2024-01-01,jd,electronics,1000,200,299.99,0.035\n"
            content += "2024-01-01,amazon,clothing,800,150,89.99,0.025\n"
            content_type = "text/csv"
            filename = "visualization_data.csv"
        else:  # json
            content = {
                "data": [
                    {"date": "2024-01-01", "platform": "jd", "category": "electronics", "sales": 1000, "reviews": 200, "price": 299.99, "conversion_rate": 0.035},
                    {"date": "2024-01-01", "platform": "amazon", "category": "clothing", "sales": 800, "reviews": 150, "price": 89.99, "conversion_rate": 0.025}
                ]
            }
            content = str(content)
            content_type = "application/json"
            filename = "visualization_data.json"

        return {
            "success": True,
            "format": format,
            "filename": filename,
            "content_type": content_type,
            "data": content
        }
    except Exception as e:
        logging.error(f"导出可视化数据失败: {e}")
        raise HTTPException(status_code=500, detail=f"导出可视化数据失败: {str(e)}")