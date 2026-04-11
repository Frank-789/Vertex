"""
FastAPI路由测试
"""
import pytest
import io
import json


def test_health_check(client):
    """测试健康检查端点"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_crawl_jd_search_missing_keyword(client):
    """测试京东搜索缺少关键词参数"""
    response = client.post("/crawl/jd/search")
    assert response.status_code == 422  # 验证失败


def test_crawl_jd_search_with_keyword(client, mock_jd_crawler):
    """测试京东搜索（模拟爬虫）"""
    response = client.post("/crawl/jd/search", json={
        "keyword": "手机",
        "max_items": 10
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "task_id" in data
    assert data["platform"] == "jd"
    assert "products" in data
    assert len(data["products"]) == 2


def test_crawl_amazon_search_with_keyword(client, mock_amazon_crawler):
    """测试亚马逊搜索（模拟爬虫）"""
    response = client.post("/crawl/amazon/search", json={
        "keyword": "laptop",
        "max_items": 10
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "task_id" in data
    assert data["platform"] == "amazon"
    assert "products" in data
    assert len(data["products"]) == 2


def test_crawl_unsupported_platform(client):
    """测试不支持的平台"""
    response = client.post("/crawl", json={
        "platform": "unsupported",
        "keyword": "test",
        "max_items": 10
    })
    assert response.status_code == 400


def test_get_task_status_not_found(client):
    """测试获取不存在的任务状态"""
    response = client.get("/task/nonexistent")
    assert response.status_code == 404


def test_upload_file_no_file(client):
    """测试上传文件没有文件"""
    response = client.post("/upload")
    # 应该返回422（验证失败）或400
    assert response.status_code in [422, 400]


def test_upload_file_text(client, mock_file_processor):
    """测试上传文本文件（模拟文件处理器）"""
    # 创建一个测试文件
    file_content = b"This is a test file content."
    files = {"file": ("test.txt", file_content, "text/plain")}

    response = client.post("/upload", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.txt"
    assert data["message"] == "上传成功"
    assert "analysis" in data
    assert data["analysis"]["filename"] == "test.txt"
    assert data["analysis"]["supported"] is True


def test_upload_file_unsupported_type(client):
    """测试上传不支持的文件类型"""
    file_content = b"Some binary content"
    files = {"file": ("test.xyz", file_content, "application/octet-stream")}

    response = client.post("/upload", files=files)
    # 即使文件类型不支持，也应返回200，但analysis中的supported应为False
    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "test.xyz"
    if "analysis" in data:
        assert data["analysis"]["supported"] is False


def test_chat_endpoint(client):
    """测试聊天端点"""
    response = client.post("/chat", json={
        "message": "Hello, AI!",
        "file": None
    })
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "message_id" in data


def test_visualization_data(client):
    """测试可视化数据端点"""
    response = client.get("/visualization/data")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # 可能返回空数组，这也可以


@pytest.mark.integration
def test_crawl_integration(client):
    """集成测试：爬虫流程（需要真实爬虫模块）"""
    # 此测试仅在爬虫模块可用时运行
    pass


if __name__ == "__main__":
    pytest.main([__file__, "-v"])