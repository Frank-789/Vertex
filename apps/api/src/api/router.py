from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List, Optional, Dict, Any
import tempfile
import os
import uuid
import asyncio
import logging

# 导入子路由模块
from . import visualization_router

# 导入爬虫模块
try:
    from ..crawlers.jd.adapter import JDCrawlerAdapter
    JD_CRAWLER_AVAILABLE = True
except ImportError as e:
    logging.warning(f"京东爬虫模块导入失败: {e}")
    JD_CRAWLER_AVAILABLE = False

# 亚马逊爬虫导入（可选）
try:
    from ..crawlers.amazon.adapter import AmazonCrawlerAdapter
    AMAZON_CRAWLER_AVAILABLE = True
except ImportError as e:
    logging.warning(f"亚马逊爬虫模块导入失败: {e}")
    AMAZON_CRAWLER_AVAILABLE = False
    AmazonCrawlerAdapter = None

# 导入文件处理器
try:
    from ..file_processor.file_processor import file_processor
    FILE_PROCESSOR_AVAILABLE = True
except ImportError as e:
    logging.warning(f"文件处理器模块导入失败: {e}")
    FILE_PROCESSOR_AVAILABLE = False
    file_processor = None

# 导入AI分析器
try:
    from ..ai.ai_analyzer import AIProductAnalyzer
    AI_ANALYZER_AVAILABLE = True
except ImportError as e:
    logging.warning(f"AI分析器模块导入失败: {e}")
    AI_ANALYZER_AVAILABLE = False
    AIProductAnalyzer = None

router = APIRouter()

# 包含可视化路由
router.include_router(visualization_router.router)

# 任务存储（临时，生产环境应使用数据库）
tasks_store = {}

# 爬虫实例管理
crawler_instances = {}

@router.get("/test")
async def test():
    return {"message": "API测试成功"}

@router.post("/chat")
async def chat(message: str, file: Optional[UploadFile] = None):
    """处理聊天消息"""
    # 集成AI分析
    if not AI_ANALYZER_AVAILABLE:
        return {"reply": f"收到消息: {message}", "file_uploaded": file is not None, "note": "AI分析器未加载"}

    try:
        analyzer = AIProductAnalyzer()
        # 如果有文件，可以处理文件内容作为上下文
        context = None
        if file:
            # 简单处理：读取文件内容作为文本（后续可以扩展）
            content = await file.read()
            context = {"file_content": content.decode('utf-8', errors='ignore')[:1000]}  # 限制长度

        # 调用AI聊天
        ai_reply = analyzer.chat(message, context)
        return {"reply": ai_reply, "file_uploaded": file is not None, "ai_used": True}
    except Exception as e:
        logging.error(f"AI聊天处理失败: {e}")
        return {"reply": f"收到消息: {message}", "file_uploaded": file is not None, "error": str(e)}

@router.post("/crawl")
async def crawl(platform: str, category: str, max_items: int = 50):
    """触发爬虫任务（旧端点，向后兼容）"""
    # 重定向到通用爬虫端点，使用category作为keyword
    logging.info(f"旧爬虫端点调用: platform={platform}, category={category}, max_items={max_items}")
    # 调用通用爬虫逻辑
    if platform.lower() == "jd" and JD_CRAWLER_AVAILABLE:
        try:
            adapter = JDCrawlerAdapter(headless=True)
            await adapter.initialize()
            result = await adapter.search_products(category, max_items)
            await adapter.close()
            task_id = str(uuid.uuid4())
            tasks_store[task_id] = {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result,
                "created_at": asyncio.get_event_loop().time(),
                "completed_at": asyncio.get_event_loop().time()
            }
            return {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result
            }
        except Exception as e:
            logging.error(f"京东爬虫任务失败: {e}")
            raise HTTPException(status_code=500, detail=f"京东爬虫任务失败: {str(e)}")
    elif platform.lower() == "amazon" and AmazonCrawlerAdapter:
        try:
            adapter = AmazonCrawlerAdapter(headless=True)
            await adapter.initialize()
            result = await adapter.search_products(category, max_items)
            await adapter.close()
            task_id = str(uuid.uuid4())
            tasks_store[task_id] = {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result,
                "created_at": asyncio.get_event_loop().time(),
                "completed_at": asyncio.get_event_loop().time()
            }
            return {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result
            }
        except Exception as e:
            logging.error(f"亚马逊爬虫任务失败: {e}")
            raise HTTPException(status_code=500, detail=f"亚马逊爬虫任务失败: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail=f"不支持的平台: {platform}或爬虫模块未加载")

@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """获取任务状态"""
    if task_id in tasks_store:
        task = tasks_store[task_id]
        return {
            "task_id": task_id,
            "platform": task.get("platform", "unknown"),
            "status": task.get("status", "unknown"),
            "progress": 100 if task.get("status") == "completed" else 0,
            "result": task.get("result") if task.get("status") == "completed" else None,
            "created_at": task.get("created_at"),
            "completed_at": task.get("completed_at")
        }
    else:
        raise HTTPException(status_code=404, detail=f"任务 {task_id} 不存在")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上传文件并分析"""
    tmp_path = None
    try:
        # 保存临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # 处理文件内容
        if not FILE_PROCESSOR_AVAILABLE or file_processor is None:
            return {
                "filename": file.filename,
                "size": len(content),
                "message": "上传成功，但文件处理器模块未加载",
                "analysis": None
            }

        # 调用文件处理器
        result = file_processor.process_file(tmp_path, file.filename)

        return {
            "filename": file.filename,
            "size": len(content),
            "message": "上传成功",
            "analysis": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

# 京东爬虫路由
@router.post("/crawl/jd/search")
async def jd_search(keyword: str, max_items: int = 50):
    """京东商品搜索"""
    if not JD_CRAWLER_AVAILABLE:
        raise HTTPException(status_code=500, detail="京东爬虫模块未加载")

    try:
        adapter = JDCrawlerAdapter(headless=True)
        await adapter.initialize()
        result = await adapter.search_products(keyword, max_items)
        await adapter.close()
        return result
    except Exception as e:
        logging.error(f"京东搜索失败: {e}")
        raise HTTPException(status_code=500, detail=f"搜索失败: {str(e)}")

@router.post("/crawl/jd/comments")
async def jd_comments(product_id: str, max_comments: int = 100):
    """京东商品评论获取"""
    if not JD_CRAWLER_AVAILABLE:
        raise HTTPException(status_code=500, detail="京东爬虫模块未加载")

    try:
        adapter = JDCrawlerAdapter(headless=True)
        await adapter.initialize()
        result = await adapter.get_product_comments(product_id, max_comments)
        await adapter.close()
        return result
    except Exception as e:
        logging.error(f"获取京东评论失败: {e}")
        raise HTTPException(status_code=500, detail=f"获取评论失败: {str(e)}")

@router.post("/crawl/jd/login")
async def jd_login(username: str, password: str):
    """京东登录"""
    if not JD_CRAWLER_AVAILABLE:
        raise HTTPException(status_code=500, detail="京东爬虫模块未加载")

    try:
        adapter = JDCrawlerAdapter(headless=True)
        await adapter.initialize()
        result = await adapter.login(username, password)
        await adapter.close()
        return result
    except Exception as e:
        logging.error(f"京东登录失败: {e}")
        raise HTTPException(status_code=500, detail=f"登录失败: {str(e)}")

# 更新通用爬虫路由以支持多平台
@router.post("/crawl")
async def crawl(
    platform: str,
    keyword: str,
    max_items: int = 50,
    category: Optional[str] = None,
    options: Optional[Dict[str, Any]] = None,
    user_id: Optional[str] = None
):
    """通用爬虫任务触发"""
    logging.info(f"收到爬虫请求: platform={platform}, keyword={keyword}, max_items={max_items}")

    if platform.lower() == "jd" and JD_CRAWLER_AVAILABLE:
        # 调用京东爬虫
        try:
            adapter = JDCrawlerAdapter(headless=True)
            await adapter.initialize()
            result = await adapter.search_products(keyword, max_items)
            await adapter.close()
            task_id = str(uuid.uuid4())
            # 存储任务状态
            tasks_store[task_id] = {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result,
                "created_at": asyncio.get_event_loop().time(),
                "completed_at": asyncio.get_event_loop().time()
            }
            return {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result
            }
        except Exception as e:
            logging.error(f"京东爬虫任务失败: {e}")
            raise HTTPException(status_code=500, detail=f"京东爬虫任务失败: {str(e)}")
    elif platform.lower() == "amazon" and AmazonCrawlerAdapter:
        # 调用亚马逊爬虫
        try:
            adapter = AmazonCrawlerAdapter(headless=True)
            await adapter.initialize()
            result = await adapter.search_products(keyword, max_items)
            await adapter.close()
            task_id = str(uuid.uuid4())
            # 存储任务状态
            tasks_store[task_id] = {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result,
                "created_at": asyncio.get_event_loop().time(),
                "completed_at": asyncio.get_event_loop().time()
            }
            return {
                "task_id": task_id,
                "platform": platform,
                "status": "completed",
                "result": result
            }
        except Exception as e:
            logging.error(f"亚马逊爬虫任务失败: {e}")
            raise HTTPException(status_code=500, detail=f"亚马逊爬虫任务失败: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail=f"不支持的平台: {platform}或爬虫模块未加载")
