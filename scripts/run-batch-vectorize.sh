#!/bin/bash

# 批量向量化脚本运行器

echo "🚀 批量向量化处理"
echo "=================="

# 加载环境变量
if [ -f ".env" ]; then
    echo "📖 加载环境变量..."
    export $(grep -v '^#' .env | xargs)
fi

# 检查环境变量
required_vars=("DASHSCOPE_API_KEY" "DASHVECTOR_API_KEY" "DASHVECTOR_ENDPOINT" "MONGODB_URI")

missing_vars=()
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ 错误：缺少必要的环境变量"
  echo "请确保设置了以下环境变量："
  for var in "${missing_vars[@]}"; do
    echo "   • $var"
  done
  echo ""
  echo "你可以在 .env 文件中设置这些变量，或直接在命令行中设置："
  echo "   export DASHSCOPE_API_KEY='your-api-key'"
  echo "   export DASHVECTOR_API_KEY='your-api-key'"
  echo "   export DASHVECTOR_ENDPOINT='your-endpoint'"
  echo "   export MONGODB_URI='mongodb://localhost:27017/xiaohongshu'"
  exit 1
fi

echo "✅ 环境变量检查通过"
echo "   • DashScope API Key: ${DASHSCOPE_API_KEY:0:8}..."
echo "   • DashVector API Key: ${DASHVECTOR_API_KEY:0:8}..."
echo "   • MongoDB URI: $MONGODB_URI"
echo ""

# 检查 MongoDB 连接
echo "🔍 检查 MongoDB 连接..."
if ! command -v mongosh &> /dev/null; then
  echo "⚠️  mongosh 命令未找到，跳过连接检查"
else
  # 尝试连接 MongoDB
  if mongosh "$MONGODB_URI" --eval "db.runCommand('ping')" --quiet >/dev/null 2>&1; then
    echo "✅ MongoDB 连接正常"
  else
    echo "❌ MongoDB 连接失败，请检查 MONGODB_URI 配置"
    echo "   当前配置: $MONGODB_URI"
    exit 1
  fi
fi

echo ""

# 确认操作
echo "⚠️  即将开始批量向量化处理"
echo "   • 这将处理 MongoDB 中的所有笔记数据"
echo "   • 每个笔记都会被向量化并存储到 DashVector"
echo "   • 处理过程可能需要一些时间"
echo ""

read -p "你确定要继续吗？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "操作已取消"
  exit 0
fi

echo ""

# 运行批量向量化脚本
echo "🏗️ 开始批量向量化..."
node scripts/batch-vectorize.js

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 批量向量化处理完成！"
  echo ""
  echo "📋 下一步操作："
  echo "   • 测试搜索功能: npm run frontend:dev"
  echo "   • 查看处理结果: 检查 DashVector Collection"
else
  echo ""
  echo "❌ 批量向量化处理失败"
  echo "请检查错误信息并修复配置"
  exit 1
fi
