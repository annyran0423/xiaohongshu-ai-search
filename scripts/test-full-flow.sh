#!/bin/bash

# 完整流程测试脚本：创建数据 -> 初始化 -> 向量化 -> 搜索测试

echo "🚀 小红书AI搜索 - 完整流程测试"
echo "==============================="

# 加载环境变量
if [ -f ".env" ]; then
    echo "📖 加载环境变量..."
    export $(grep -v '^#' .env | xargs)
fi

# 检查环境变量
required_vars=("MONGODB_URI" "DASHSCOPE_API_KEY" "DASHVECTOR_API_KEY" "DASHVECTOR_ENDPOINT")

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
  echo "你可以在 .env 文件中设置这些变量"
  exit 1
fi

echo "✅ 环境变量检查通过"
echo ""

# 步骤1: 插入笔记数据
echo "📝 步骤1: 插入笔记数据"
echo "----------------------"
npm run insert-notes

if [ $? -ne 0 ]; then
  echo "❌ 步骤1失败，终止测试"
  exit 1
fi

echo ""
echo "✅ 步骤1完成：测试数据已插入"
echo ""

# 步骤2: 初始化向量数据库
echo "🏗️ 步骤2: 初始化向量数据库"
echo "-------------------------"
npm run init-collection

if [ $? -ne 0 ]; then
  echo "❌ 步骤2失败，终止测试"
  exit 1
fi

echo ""
echo "✅ 步骤2完成：向量数据库已初始化"
echo ""

# 步骤3: 批量向量化
echo "🔄 步骤3: 批量向量化"
echo "------------------"
echo "y" | npm run batch-vectorize

if [ $? -ne 0 ]; then
  echo "❌ 步骤3失败，终止测试"
  exit 1
fi

echo ""
echo "✅ 步骤3完成：数据已向量化"
echo ""

# 步骤4: 启动前端并测试搜索
echo "🔍 步骤4: 启动前端服务"
echo "--------------------"
echo "前端服务将在后台启动..."
echo "访问地址: http://localhost:3000"
echo ""
echo "你可以在浏览器中测试搜索功能："
echo "   • 搜索 '悉尼' 看看旅游攻略"
echo "   • 搜索 '美食' 看看美食推荐"
echo "   • 搜索 '夜景' 看看夜景推荐"
echo ""

# 启动前端服务
npm run frontend:dev &
FRONTEND_PID=$!

echo "🎉 完整流程测试完成！"
echo ""
echo "📊 测试结果："
echo "   ✅ 测试数据插入成功"
echo "   ✅ 向量数据库初始化成功"
echo "   ✅ 批量向量化处理成功"
echo "   ✅ 前端服务启动中..."
echo ""
echo "🌐 前端服务地址: http://localhost:3000"
echo ""
echo "💡 测试建议："
echo "   • 打开浏览器访问 http://localhost:3000"
echo "   • 在搜索框中输入 '北京美食' 或 '上海夜景'"
echo "   • 观察搜索结果和相似度评分"
echo ""

# 等待用户确认
echo "按任意键停止前端服务..."
read -n 1 -s

# 停止前端服务
echo ""
echo "🛑 正在停止前端服务..."
kill $FRONTEND_PID 2>/dev/null

echo "✅ 前端服务已停止"
echo "🎉 完整流程测试结束！"
