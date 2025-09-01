# 🌟 小红书 AI 搜索系统

基于向量语义搜索的小红书攻略智能检索平台

## 🚀 快速开始

### 1. 启动前端开发服务器

```bash
# 方式1：使用便捷脚本
./scripts/start-frontend.sh

# 方式2：手动启动
cd search-frontend/
npm run dev
```

### 2. 启动 MongoDB（如果需要）

```bash
# 启动MongoDB容器
npm run docker:demo
```

### 3. 访问应用

打开浏览器访问：http://localhost:3000

## 📁 项目结构

```
xiaohongshu-ai-search/
├── search-frontend/          # Next.js 全栈应用
│   ├── src/app/             # 页面和API Routes
│   │   ├── api/             # API Routes (后端逻辑)
│   │   └── page.tsx         # 前端页面
│   ├── src/lib/             # 共享服务和工具
│   │   ├── services/        # AI搜索服务
│   │   ├── types/           # TypeScript类型
│   │   └── config/          # 环境配置
│   ├── src/components/      # React组件
│   └── .env.local           # 环境变量
├── scripts/                  # 便捷运行脚本
├── notes/                   # 小红书笔记数据
├── docs/                    # 项目文档
└── docker-compose.yml       # 生产环境配置
```

## 🛠️ 技术栈

- **全栈框架**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **API**: Next.js API Routes (内置后端功能)
- **AI**: DashScope (文本向量化) + DashVector (向量搜索)
- **数据库**: MongoDB (数据存储)
- **部署**: Docker + Docker Compose
- **架构**: Next.js 全栈架构 (一体化)

## 📋 环境配置

### 根目录 `.env`

```env
# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/xiaohongshu

# DashVector 配置
DASHVECTOR_API_KEY=your_api_key
DASHVECTOR_ENDPOINT=your_endpoint

# DashScope 配置
DASHSCOPE_API_KEY=your_api_key
DASHSCOPE_ENDPOINT=dashscope.aliyuncs.com
```

### 前端 `.env.local`

```env
DASHSCOPE_API_KEY=your_dashscope_key
DASHSCOPE_ENDPOINT=dashscope.aliyuncs.com
DASHVECTOR_API_KEY=your_dashvector_key
DASHVECTOR_ENDPOINT=your_dashvector_endpoint
```

## 🔧 开发命令

```bash
# 启动服务
./scripts/start-frontend.sh         # 启动前端开发服务器
npm run docker:demo                # 启动MongoDB容器

# 项目管理
npm run docker:check               # 检查Docker状态
npm run cleanup                    # 清理测试文件

# 手动启动
cd search-frontend && npm run dev  # 前端开发服务器
```

## 📚 项目文档

- [项目结构说明](./PROJECT_STRUCTURE.md)
- [API 文档](./docs/API.md)
- [部署指南](./DEPLOYMENT.md)

## 🎯 核心功能

- ✅ **AI 语义搜索**: 基于向量相似度的智能检索
- ✅ **实时搜索**: 毫秒级响应速度
- ✅ **多维度排序**: 按相似度分数排序结果
- ✅ **现代化 UI**: 响应式设计，支持移动端

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙋‍♂️ 支持

如果遇到问题，请：

1. 查看 [项目文档](./docs/)
2. 提交 [Issue](https://github.com/your-repo/issues)
3. 联系维护者

---

**⭐ 如果这个项目对你有帮助，请给它一个星标！**
