#!/bin/bash

# Docker MongoDB 演示脚本
# 展示Docker的便捷性和强大功能

echo "🐳 Docker MongoDB 演示"
echo "======================"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker Desktop"
    echo "   下载地址: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker 已安装"

# 1. 启动MongoDB容器
echo ""
echo "🚀 步骤1: 启动MongoDB容器"
echo "命令: docker run -d -p 27017:27017 --name mongodb mongo:latest"

# 检查是否已有同名容器
if docker ps -a --format 'table {{.Names}}' | grep -q "^mongodb$"; then
    echo "📦 发现已存在的mongodb容器，正在重新启动..."
    docker start mongodb
else
    echo "📦 创建新的mongodb容器..."
    docker run -d -p 27017:27017 --name mongodb mongo:latest
fi

# 等待容器启动
echo "⏳ 等待MongoDB启动..."
sleep 5

# 2. 检查容器状态
echo ""
echo "📊 步骤2: 检查容器状态"
echo "命令: docker ps"
docker ps | grep mongodb

# 3. 测试连接
echo ""
echo "🔗 步骤3: 测试MongoDB连接"
echo "命令: docker exec mongodb mongosh --eval 'db.runCommand({ping: 1})'"

if docker exec mongodb mongosh --eval 'db.runCommand({ping: 1})' --quiet | grep -q "ok"; then
    echo "✅ MongoDB 连接成功！"
else
    echo "❌ MongoDB 连接失败"
fi

# 4. 查看容器信息
echo ""
echo "📋 步骤4: 查看容器详细信息"
echo "容器名称: mongodb"
echo "映射端口: 27017:27017"
echo "镜像版本: $(docker inspect mongodb --format='{{.Config.Image}}')"

# 5. 展示容器日志
echo ""
echo "📝 步骤5: 查看启动日志"
echo "命令: docker logs mongodb"
echo "----------------------------------------"
docker logs mongodb | head -10
echo "----------------------------------------"

# 6. 资源使用情况
echo ""
echo "💾 步骤6: 查看资源使用"
echo "命令: docker stats mongodb --no-stream"
docker stats mongodb --no-stream

# 7. 清理演示
echo ""
echo "🧹 演示清理（可选）"
echo "停止容器: docker stop mongodb"
echo "删除容器: docker rm mongodb"
echo "删除镜像: docker rmi mongo:latest"

echo ""
echo "🎉 Docker演示完成！"
echo ""
echo "💡 现在你可以："
echo "   1. 在代码中使用: mongodb://localhost:27017"
echo "   2. 停止容器: docker stop mongodb"
echo "   3. 重新启动: docker start mongodb"
echo "   4. 查看日志: docker logs mongodb"
