#!/bin/bash

# 小红书 AI 搜索 - 启动前端开发服务器
# 使用方法: ./scripts/start-frontend.sh

echo "🚀 小红书 AI 搜索 - 前端开发服务器"
echo "=================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

# 进入前端目录
cd "$(dirname "$0")/../search-frontend"

echo "📁 当前目录: $(pwd)"
echo "🌐 启动 Next.js 开发服务器..."
echo "   访问地址: http://localhost:3000"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

# 启动开发服务器
npm run dev
