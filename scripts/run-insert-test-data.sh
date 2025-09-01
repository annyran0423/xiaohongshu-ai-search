#!/bin/bash

# 插入测试数据脚本运行器

echo "🚀 插入测试数据"
echo "==============="

# 加载环境变量
if [ -f ".env" ]; then
    echo "📖 加载环境变量..."
    export $(grep -v '^#' .env | xargs)
fi

# 检查环境变量
if [ -z "$MONGODB_URI" ]; then
    echo "❌ 错误：缺少必要的环境变量"
    echo "请确保设置了以下环境变量："
    echo "   • MONGODB_URI"
    echo ""
    echo "你可以在 .env 文件中设置这些变量，或直接在命令行中设置："
    echo "   export MONGODB_URI='mongodb://localhost:27017/xiaohongshu'"
    exit 1
fi

echo "✅ 环境变量检查通过"
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
    echo "   确保 MongoDB 服务正在运行"
    echo ""
    echo "💡 如果使用 Docker，可以运行："
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:6.0"
    exit 1
  fi
fi

echo ""

# 确认操作
echo "⚠️  即将插入小红书笔记数据"
echo "   • 这将清空现有的笔记数据"
echo "   • 从 notes/ 目录读取所有JSON文件"
echo "   • 自动提取标签和格式化数据"
echo ""

read -p "你确定要继续吗？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "操作已取消"
  exit 0
fi

echo ""

# 运行插入脚本
echo "📝 开始插入测试数据..."
node scripts/insert-test-data.js

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 测试数据插入完成！"
  echo ""
  echo "📋 下一步操作："
  echo "   • 初始化向量数据库: npm run init-collection"
  echo "   • 批量向量化: npm run batch-vectorize"
  echo "   • 测试搜索: npm run dev"
else
  echo ""
  echo "❌ 测试数据插入失败"
  echo "请检查错误信息并修复配置"
  exit 1
fi
