FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    fonts-liberation \
    fonts-freefont-ttf \
    fontconfig \
    libxss1 \
    libappindicator1 \
    libnspr4 \
    libnss3 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    gcc \
    g++ \
    python3-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 安装Chromium for Selenium (替代Chrome，更轻量且无需处理Google仓库)
RUN apt-get update \
    && apt-get install -y chromium chromium-driver \
    && ln -sf /usr/bin/chromium /usr/bin/google-chrome \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY src/ ./src/

# 暴露端口
EXPOSE 8000

# 启动命令
# 使用环境变量PORT，默认8000
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}