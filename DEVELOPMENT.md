# 🚀 小红书 AI 搜索 - 开发指南

## 🎯 **开发环境架构**

采用**混合容器化策略**：

```
🐳 数据层：MongoDB → Docker容器    # 版本控制、数据隔离
💻 应用层：Node.js → 本地运行      # 开发效率、调试便利
💻 前端层：Next.js → 本地运行      # 热重载、开发体验
```

---

## 📋 **快速开始**

### **1. 环境检查**

```bash
# 检查Node.js和npm
node --version
npm --version

# 检查Docker
npm run docker:check

# 检查项目结构
ls -la
```

### **2. 启动开发环境**

```bash
# 方式1：使用便捷脚本（推荐）
npm run docker:demo      # 启动MongoDB
npm run frontend:dev     # 启动前端
npm run start            # 启动后端

# 方式2：手动启动
./scripts/demo-docker-mongodb.sh
cd search-frontend && npm run dev
node backend/server.js

# 方式3：并行启动（推荐用于开发）
npm run docker:demo & npm run start & npm run frontend:dev
```

### **3. 访问应用**

- **前端应用**: http://localhost:3000
- **后端 API**: http://localhost:4000 (如果配置了)
- **MongoDB**: localhost:27017 (容器内)

---

## 🛠️ **开发工作流程**

### **日常开发**

```bash
# 1. 启动服务
npm run docker:demo
npm run frontend:dev

# 2. 开发调试
# - 修改前端代码 → 自动热重载
# - 修改后端代码 → 重启服务 (Ctrl+C → npm run start)
# - 查看数据库 → 连接到容器或使用MongoDB Compass
```

### **数据处理**

```bash
# 初始化向量集合
npm run init-collection

# 批量向量化数据
npm run batch-vectorize

# 导入笔记数据
npm run import-notes
```

### **项目管理**

```bash
# 清理测试文件
npm run cleanup

# 检查Docker状态
npm run docker:compose

# 构建生产版本
npm run frontend:build
```

---

## 📁 **项目结构详解**

```
xiaohongshu-ai-search/
├── 🐳 backend/                 # Node.js后端服务
│   ├── scripts/               # 数据处理脚本
│   │   ├── batchVectorize.js  # 批量向量化
│   │   └── initCollection.js  # 初始化集合
│   ├── services/              # 业务逻辑服务
│   ├── utils/                 # 工具函数
│   └── server.js              # 后端服务器
│
├── 💻 search-frontend/        # Next.js前端应用
│   ├── src/app/              # App Router
│   │   ├── api/              # API Routes
│   │   └── page.tsx          # 主页面
│   ├── src/components/       # React组件
│   ├── public/               # 静态资源
│   └── package.json          # 前端依赖
│
├── 🐳 scripts/                # 便捷脚本
│   ├── demo-docker-mongodb.sh # Docker演示
│   ├── start-frontend.sh      # 前端启动
│   ├── run-batch-vectorize.sh # 批量处理
│   └── cleanup.sh             # 项目清理
│
├── 📄 docs/                   # 项目文档
├── 📄 README.md              # 项目说明
└── 🐳 docker-compose.yml     # 生产环境配置
```

---

## 🔧 **开发技巧**

### **热重载和调试**

```bash
# 前端热重载
npm run frontend:dev
# 修改代码 → 浏览器自动刷新

# 后端调试
npm run start
# 使用VS Code调试器或console.log
```

### **数据库操作**

```bash
# 连接到MongoDB容器
docker exec -it mongodb mongosh

# 查看数据库
use xiaohongshu
db.notes.find().limit(5)

# 或者使用MongoDB Compass连接
# 连接字符串: mongodb://localhost:27017
```

### **环境变量**

```bash
# 后端环境变量（根目录.env）
MONGODB_URI=mongodb://localhost:27017/xiaohongshu
DASHVECTOR_API_KEY=your_key
DASHSCOPE_API_KEY=your_key

# 前端环境变量（search-frontend/.env.local）
DASHSCOPE_API_KEY=your_key
DASHVECTOR_API_KEY=your_key
```

---

## 🚀 **部署选项**

### **开发环境部署（当前）**

```bash
npm run docker:demo      # MongoDB容器
npm run frontend:dev     # 前端本地
npm run start            # 后端本地
```

### **生产环境部署**

```bash
npm run deploy:prod      # 全栈Docker部署
# 或
docker-compose up -d
```

### **CI/CD 部署**

```bash
# 使用GitHub Actions或其他CI工具
# 构建Docker镜像
# 推送到容器注册表
# 在服务器上部署
```

---

## 🔍 **故障排除**

### **MongoDB 连接问题**

```bash
# 检查容器状态
npm run docker:compose

# 查看容器日志
docker logs mongodb

# 重启容器
docker restart mongodb
```

### **端口冲突**

```bash
# 检查端口占用
lsof -i :3000
lsof -i :27017

# 修改端口（在.env文件中）
PORT=3001
```

### **依赖问题**

```bash
# 重新安装依赖
cd search-frontend && rm -rf node_modules && npm install
cd ../backend && npm install

# 清理缓存
npm cache clean --force
```

---

## 🎯 **最佳实践**

### **代码组织**

- ✅ **前端组件**: `search-frontend/src/components/`
- ✅ **后端逻辑**: `backend/services/`
- ✅ **数据脚本**: `backend/scripts/`
- ✅ **工具函数**: `backend/utils/`

### **版本控制**

- ✅ **Node.js**: 保持 LTS 版本
- ✅ **MongoDB**: 使用稳定版本
- ✅ **Docker**: 保持最新版本

### **开发习惯**

- ✅ **提交前清理**: `npm run cleanup`
- ✅ **测试功能**: 先在本地测试
- ✅ **环境一致**: 使用相同的依赖版本

---

## 📚 **相关文档**

- [项目结构](./PROJECT_STRUCTURE.md)
- [Docker 策略](./docker-strategy.md)
- [API 文档](./docs/API.md)
- [部署指南](./DEPLOYMENT.md)

---

## 🎉 **总结**

**当前开发环境的优势：**

1. **🚀 高效开发**

   - 前端热重载 < 1 秒
   - 后端快速重启
   - 完整的调试支持

2. **🔧 简单维护**

   - 本地环境直观
   - 依赖管理简单
   - 无容器复杂性

3. **📈 快速迭代**
   - 修改代码立即生效
   - 完美的开发体验
   - 专注业务逻辑

**这正是开发阶段的最佳选择！** 🚀

---

**💡 提示：** 享受本地开发的便利性，专注于功能实现。生产部署时再使用 Docker 全栈方案。
