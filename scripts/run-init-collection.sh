#!/bin/bash

# 初始化 DashVector Collection 的脚本

echo "🚀 初始化 DashVector Collection"
echo "================================"

# 加载环境变量
if [ -f ".env" ]; then
    echo "📖 加载环境变量..."
    export $(grep -v '^#' .env | xargs)
fi

# 检查环境变量
if [ -z "$DASHVECTOR_API_KEY" ] || [ -z "$DASHVECTOR_ENDPOINT" ]; then
    echo "❌ 错误：缺少必要的环境变量"
    echo "请确保设置了以下环境变量："
    echo "   • DASHVECTOR_API_KEY"
    echo "   • DASHVECTOR_ENDPOINT"
    echo ""
    echo "你可以在 .env 文件中设置这些变量，或直接在命令行中设置："
    echo "   export DASHVECTOR_API_KEY='your-api-key'"
    echo "   export DASHVECTOR_ENDPOINT='your-endpoint'"
    exit 1
fi

echo "✅ 环境变量检查通过"
echo "   • API Key: ${DASHVECTOR_API_KEY:0:8}..."
echo "   • Endpoint: $DASHVECTOR_ENDPOINT"
echo ""

# 运行初始化脚本
echo "🏗️ 开始初始化 Collection..."
node scripts/init-collection.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Collection 初始化完成！"
    echo ""
    echo "📋 下一步："
    echo "   • 运行批量向量化: npm run batch-vectorize"
    echo "   • 或者运行完整流程: ./scripts/start-full-stack.sh"
else
    echo ""
    echo "❌ Collection 初始化失败"
    echo "请检查配置和网络连接"
    exit 1
fi
