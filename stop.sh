#!/bin/bash

# Vertex AI 智能体停止脚本
# 一键停止所有服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目目录
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT_DIR/pids"

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                Vertex AI 智能体停止脚本                  ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

stop_service() {
    local service_name=$1
    local pid_file="$PID_DIR/${service_name}.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -n "停止${service_name}服务 (PID: $pid)..."
            kill "$pid"
            sleep 2

            # 检查是否成功停止
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${RED}强制停止${NC}"
                kill -9 "$pid" 2>/dev/null
            else
                echo -e "${GREEN}成功${NC}"
            fi

            rm -f "$pid_file"
        else
            echo -e "${YELLOW}${service_name}服务未运行${NC}"
            rm -f "$pid_file"
        fi
    else
        echo -e "${YELLOW}未找到${service_name}的PID文件${NC}"
    fi
}

cleanup_logs() {
    print_step "清理日志文件..."

    # 可选：保留最近日志，这里简单删除
    # LOG_DIR="$ROOT_DIR/logs"
    # if [ -d "$LOG_DIR" ]; then
    #     rm -f "$LOG_DIR"/*.log
    #     echo "已清理日志文件"
    # fi

    echo "日志文件保留在 $ROOT_DIR/logs/ 目录中"
}

main() {
    print_header

    print_step "停止所有服务..."

    # 停止前端服务
    stop_service "frontend"

    # 停止后端服务
    stop_service "backend"

    # 可选清理
    cleanup_logs

    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                所有服务已停止                            ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo -e "重新启动服务: ${YELLOW}./start.sh${NC}"
}

# 运行主函数
main