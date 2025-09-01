#!/bin/bash

# 前后端分离的全栈启动脚本
# 启动MongoDB、Express后端、Next.js前端

echo "🚀 小红书AI搜索 - 全栈启动"
echo "==========================="

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

echo "✅ Node.js 已安装"

# 1. 启动MongoDB
echo ""
echo "🐳 步骤1: 启动MongoDB容器"
./scripts/demo-docker-mongodb.sh

# 等待MongoDB启动
echo "⏳ 等待MongoDB启动..."
sleep 3

# 2. 安装后端依赖
echo ""
echo "📦 步骤2: 安装后端依赖"
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
else
    echo "后端依赖已存在"
fi
cd ..

# 3. 启动后端服务
echo ""
echo "⚙️  步骤3: 启动Express后端服务"
echo "端口: 4000"
echo "命令: npm run backend:start"
npm run backend:start &
BACKEND_PID=$!
echo "后端服务PID: $BACKEND_PID"

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 4. 启动前端开发服务器
echo ""
echo "💻 步骤4: 启动Next.js前端开发服务器"
echo "端口: 3000"
echo "命令: npm run frontend:dev"
npm run frontend:dev &
FRONTEND_PID=$!

echo ""
echo "🎉 全栈服务启动完成！"
echo ""
echo "🌐 服务地址："
echo "   前端应用: http://localhost:3000"
echo "   后端API:  http://localhost:4000"
echo "   数据库:   localhost:27017"
echo ""
echo "🔧 管理命令："
echo "   查看进程: ps aux | grep -E '(node|npm)'"
echo "   停止服务: kill $BACKEND_PID $FRONTEND_PID"
echo "   停止数据库: docker stop mongodb"
echo ""
echo "💡 现在可以打开浏览器访问 http://localhost:3000 了！"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker stop mongodb 2>/dev/null; exit 0" INT

# 保持脚本运行
wait
