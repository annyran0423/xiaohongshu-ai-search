# 📁 小红书 AI 搜索项目结构分析

## 🎯 **项目概览**

这是一个**小红书 AI 搜索系统**，包含后端数据处理和前端搜索界面。

---

## 🏗️ **当前目录结构**

```
xiaohongshu-ai-search/
├── 📁 search-frontend/          # ✅ Next.js 前端应用
│   ├── backend/                 # 后端服务层
│   │   ├── services/            # 业务服务
│   │   │   ├── search.ts        # 搜索服务
│   │   │   ├── dashscope.ts     # 向量化服务
│   │   │   └── dashvector.ts    # 向量搜索服务
│   │   ├── config/              # 配置管理
│   │   │   └── env.ts           # 环境变量配置
│   │   ├── types/               # TypeScript类型
│   │   │   └── api.ts           # API类型定义
│   │   └── index.ts             # 服务导出
│   ├── src/app/
│   │   ├── api/search/route.ts  # API Routes（调用backend服务）
│   │   ├── page.tsx             # 主页面
│   │   └── layout.tsx           # 布局组件
│   ├── src/components/
│   │   ├── SearchForm.tsx       # 搜索表单组件
│   │   └── SearchResults.tsx    # 搜索结果组件
│   ├── .env.local               # 环境变量配置
│   └── package.json
│
# 已删除空的 xhs-search-ui 目录 ✅
# 已删除未使用的 Express 后端目录 ✅

├── 📁 scripts/                  # 🛠️ 便捷脚本
│   ├── start-frontend.sh        # 启动前端开发服务器
│   └── demo-docker-mongodb.sh   # Docker演示
│
├── 📁 api/                      # ⚠️ 旧版 API（可能废弃）
├── 📁 notes/                    # 📄 小红书笔记数据
├── 📁 docs/                     # 📚 项目文档
├── 📄 .env                      # 🔑 根目录环境变量
└── 📄 README.md                 # 📋 项目说明文档
```

---

## 🔍 **文件关系分析**

### **1. 主要工作项目：`search-frontend/`**

```bash
# 当前正在使用的项目
cd search-frontend/
npm run dev  # 启动前端开发服务器
```

**包含：**

- ✅ **完整的 AI 搜索界面**
- ✅ **服务端 API 路由** (`/api/search`)
- ✅ **React 组件** (SearchForm, SearchResults)
- ✅ **环境变量配置** (`.env.local`)

### **2. 空项目已删除** ✅

**已删除：** `xhs-search-ui/` 目录（空的 Next.js 模板项目）

### **3. 后端服务：`backend/`** ✅

```bash
# 数据处理和向量化脚本
./scripts/run-batch-vectorize.sh    # 批量处理数据
./scripts/run-init-collection.sh    # 初始化向量数据库
```

**包含：**

- 🔧 **数据处理脚本** (`backend/scripts/`)
- 🔧 **向量服务工具** (`backend/services/`)
- 🔧 **数据库连接和模型** (`backend/models/`)
- 🛠️ **便捷运行脚本** (`scripts/`)

---

## 🧹 **目录清理建议**

### **📋 推荐的清理方案**

#### **方案 1：保留主要项目（推荐）**

```
xiaohongshu-ai-search/
├── 📁 search-frontend/    # 主要前端项目 ✅
├── 📁 src/               # 后端服务 ✅
├── 📁 notes/             # 数据文件 ✅
├── 📁 docs/              # 文档 ✅
├── 📄 .env               # 环境变量 ✅
└── ❌ xhs-search-ui/     # 删除此目录
```

#### **方案 2：完全重构（如果需要）**

```
xiaohongshu-ai-search/
├── 📁 frontend/          # 重命名 search-frontend
├── 📁 backend/           # 重命名 src
├── 📁 data/              # 重命名 notes
├── 📁 docs/
└── 📄 .env
```

---

## 🚀 **使用指南**

### **当前推荐的工作流程：**

```bash
# 1. 启动前端开发服务器
./scripts/start-frontend.sh

# 或者手动启动
cd search-frontend/
npm run dev

# 2. 如果需要处理数据
./scripts/run-batch-vectorize.sh     # 批量向量化
./scripts/run-init-collection.sh     # 初始化向量集合

# 3. 访问搜索界面
# http://localhost:3000
```

### **开发时的注意事项：**

1. **环境变量配置**

   - 根目录：`.env` (后端服务用)
   - 前端目录：`search-frontend/.env.local` (前端项目用)

2. **数据流向**
   ```
   MongoDB → 后端脚本 → DashVector → 前端搜索 → 用户
   ```

---

## 🛠️ **清理命令**

### **删除空项目：**

```bash
# 删除空的 xhs-search-ui 目录
rm -rf xhs-search-ui/

# 清理 git 记录（如果需要）
git rm -r --cached xhs-search-ui/
```

### **重命名目录（可选）：**

```bash
# 将 search-frontend 重命名为 frontend
mv search-frontend frontend

# 将 src 重命名为 backend
mv src backend
```

---

## 🎯 **总结**

### **✅ 当前状态（已清理完成）**

- `search-frontend/` - **主要前端项目，完全可用** ✅
- `backend/` - **后端服务，重构完成** ✅
- `scripts/` - **便捷脚本，新增** ✅
- `xhs-search-ui/` - **已删除** ✅

### **🎯 项目特点**

1. **🏗️ 清晰的架构分离**

   - 前端：`search-frontend/`
   - 后端：`backend/`
   - 脚本：`scripts/`

2. **🚀 便捷的操作方式**

   - `./scripts/start-frontend.sh` - 启动前端
   - `./scripts/run-batch-vectorize.sh` - 数据处理
   - `./scripts/cleanup.sh` - 项目清理
