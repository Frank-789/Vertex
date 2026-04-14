#!/bin/bash

# Vertex AI 智能体启动脚本
# 一键启动前端和后端服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_DIR="$ROOT_DIR/apps/web"
API_DIR="$ROOT_DIR/apps/api"
LOG_DIR="$ROOT_DIR/logs"
PID_DIR="$ROOT_DIR/pids"

# 创建日志和PID目录
mkdir -p "$LOG_DIR" "$PID_DIR"

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                Vertex AI 智能体启动脚本                  ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

check_env() {
    print_step "检查环境配置..."

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    echo "✓ Node.js版本: $(node --version)"

    # 检查npm
    if ! command -v npm &> /dev/null; then
        print_error "npm未安装"
        exit 1
    fi
    echo "✓ npm版本: $(npm --version)"

    # 检查Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python3未安装"
        exit 1
    fi
    echo "✓ Python版本: $(python3 --version)"

    # 检查Supabase配置
    if [ ! -f "$WEB_DIR/.env.local" ]; then
        print_warn "未找到.env.local文件，正在创建示例文件..."
        cp "$WEB_DIR/.env.local.example" "$WEB_DIR/.env.local" 2>/dev/null || true
        print_warn "请编辑 $WEB_DIR/.env.local 配置Supabase和API密钥"
    fi

    # 检查DeepSeek API密钥
    if grep -q "your-project.supabase.co" "$WEB_DIR/.env.local"; then
        print_warn "Supabase配置未设置，部分功能可能受限"
        print_warn "请访问 https://supabase.com 创建项目并更新.env.local"
    fi

    # 检查DeepSeek API密钥
    if grep -q "DEEPSEEK_API_KEY=sk-" "$WEB_DIR/.env.local"; then
        echo "✓ DeepSeek API密钥已配置"
    else
        print_warn "DeepSeek API密钥未配置或格式不正确"
        print_warn "请编辑 $WEB_DIR/.env.local 设置DEEPSEEK_API_KEY"
        print_warn "格式应为: DEEPSEEK_API_KEY=sk-xxxxxxxx"
    fi
}

install_deps() {
    print_step "安装依赖..."

    # 前端依赖
    if [ ! -d "$WEB_DIR/node_modules" ]; then
        print_step "安装前端依赖..."
        cd "$WEB_DIR"
        npm install
    else
        echo "✓ 前端依赖已安装"
    fi

    # 后端依赖
    if [ ! -f "$API_DIR/.venv/bin/activate" ]; then
        print_step "创建Python虚拟环境..."
        cd "$API_DIR"
        python3 -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
    else
        echo "✓ Python虚拟环境已存在"
    fi
}

start_backend() {
    print_step "启动Python后端服务..."

    cd "$API_DIR"

    # 激活虚拟环境
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
    fi

    # 设置DeepSeek API环境变量
    if [ -f "$WEB_DIR/.env.local" ]; then
        DEEPSEEK_API_KEY=$(grep DEEPSEEK_API_KEY "$WEB_DIR/.env.local" | cut -d '=' -f2)
        if [ -n "$DEEPSEEK_API_KEY" ]; then
            export DEEPSEEK_API_KEY
            echo "已设置DEEPSEEK_API_KEY环境变量"
        else
            print_warn "未找到DEEPSEEK_API_KEY配置，AI聊天功能可能受限"
        fi
    fi

    # 检查是否已安装依赖
    if ! python3 -c "import fastapi" &> /dev/null; then
        print_warn "FastAPI未安装，正在安装..."
        pip install -r requirements.txt
    fi

    # 启动后端服务
    echo "启动后端服务在 http://localhost:8000"
    nohup python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PID_DIR/backend.pid"

    # 等待后端启动
    sleep 3
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        print_success "后端服务启动成功"
    else
        print_warn "后端服务启动较慢，请稍后检查..."
    fi
}

start_frontend() {
    print_step "启动Next.js前端服务..."

    cd "$WEB_DIR"

    # 启动前端服务
    echo "启动前端服务在 http://localhost:3000"
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$PID_DIR/frontend.pid"

    # 等待前端启动
    sleep 5
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "前端服务启动成功"
    else
        print_warn "前端服务启动较慢，请稍后检查..."
    fi
}

show_status() {
    print_step "服务状态检查..."

    echo -e "\n${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}服务启动完成！${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo -e "前端: ${GREEN}http://localhost:3000${NC}"
    echo -e "后端: ${GREEN}http://localhost:8000${NC}"
    echo -e "后端健康检查: ${GREEN}http://localhost:8000/health${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo -e "日志文件:"
    echo -e "  前端日志: ${YELLOW}$LOG_DIR/frontend.log${NC}"
    echo -e "  后端日志: ${YELLOW}$LOG_DIR/backend.log${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo -e "PID文件:"
    echo -e "  前端PID: ${YELLOW}$PID_DIR/frontend.pid${NC}"
    echo -e "  后端PID: ${YELLOW}$PID_DIR/backend.pid${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"
    echo -e "停止服务: ${YELLOW}./stop.sh${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════${NC}"

    # 检查Supabase配置
    if grep -q "your-project.supabase.co" "$WEB_DIR/.env.local"; then
        echo -e "${YELLOW}⚠  注意：Supabase未配置，请更新.env.local文件${NC}"
        echo -e "${YELLOW}   否则认证功能将无法使用${NC}"
    fi
}

cleanup() {
    # 清理函数，在脚本退出时调用
    echo -e "\n${YELLOW}正在停止服务...${NC}"
    ./stop.sh
}

main() {
    print_header

    # 设置退出时清理
    trap cleanup EXIT

    # 环境检查
    check_env

    # 安装依赖
    install_deps

    # 启动后端
    start_backend

    # 启动前端
    start_frontend

    # 显示状态
    show_status

    # 等待用户中断
    echo -e "\n${GREEN}按 Ctrl+C 停止服务${NC}"
    wait
}

# 运行主函数
main