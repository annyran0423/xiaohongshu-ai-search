# 🌟 AI 小红书搜索前端

基于 Next.js + TypeScript 构建的智能旅游攻略搜索界面，集成 DashScope + DashVector 向量搜索技术。

## ✨ 功能特性

- 🔍 **AI 语义搜索**：基于向量相似度，不仅仅是关键词匹配
- 🎨 **现代化界面**：美观的渐变背景和响应式设计
- ⚡ **实时搜索**：快速的搜索响应和加载状态
- 📱 **移动友好**：完美适配手机和桌面端
- 🎯 **智能推荐**：显示相似度评分和相关性排序

## 🚀 快速开始

### 1. 环境要求

- Node.js 18.18.0+
- npm 或 yarn 或 pnpm

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，填入你的 API 密钥：

```env
# DashScope 配置（文本向量化）
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DASHSCOPE_ENDPOINT=dashscope.aliyuncs.com

# DashVector 配置（向量数据库）
DASHVECTOR_API_KEY=your_dashvector_api_key_here
DASHVECTOR_ENDPOINT=your_dashvector_endpoint_here
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
search-frontend/
├── src/
│   ├── app/
│   │   ├── api/search/          # 搜索API路由
│   │   │   └── route.ts
│   │   ├── page.tsx             # 主页面
│   │   └── layout.tsx           # 布局组件
│   └── components/
│       ├── SearchForm.tsx       # 搜索表单组件
│       └── SearchResults.tsx    # 搜索结果组件
├── .env.local                   # 环境变量（需要配置）
├── .env.example                 # 环境变量模板
└── package.json
```

## 🔧 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **HTTP 客户端**: Axios
- **AI 服务**: DashScope + DashVector

## 🎨 界面预览

### 搜索界面

- 美观的渐变背景
- 居中的搜索表单
- 示例搜索关键词提示

### 搜索结果

- 相似度评分显示
- 内容预览和全文阅读
- 收藏功能按钮
- 响应式卡片布局

## 🔍 API 接口

### POST `/api/search`

搜索旅游攻略的 API 接口。

**请求参数：**

```json
{
  "query": "悉尼旅游攻略",
  "topK": 5
}
```

**响应格式：**

```json
{
  "success": true,
  "query": "悉尼旅游攻略",
  "totalResults": 5,
  "results": [
    {
      "id": "6752cb090000000008005f84",
      "score": 0.4219451,
      "title": "悉尼🇦🇺绝美citywalk路线",
      "content": "内容预览...",
      "noteId": "6752cb090000000008005f84"
    }
  ]
}
```

## 🎯 使用指南

### 搜索技巧

1. **使用自然语言**：如 "悉尼海滩度假攻略"
2. **尝试同义词**：如 "歌剧院" 或 "悉尼大剧院"
3. **组合搜索**：如 "悉尼美食 + 海鲜餐厅"

### 示例搜索

- 悉尼旅游攻略
- 海滩度假推荐
- 歌剧院参观
- 美食探店
- 一日游路线

## 🔧 开发指南

### 添加新功能

1. **新组件**：在 `src/components/` 中创建
2. **新 API**：在 `src/app/api/` 中添加路由
3. **样式修改**：使用 Tailwind CSS 类名

### 调试技巧

1. **浏览器控制台**：查看网络请求和响应
2. **Next.js 日志**：查看服务器端日志
3. **API 测试**：直接调用 `/api/search` 接口

## 🚀 部署指南

### Vercel 部署

1. 推送到 GitHub
2. 连接 Vercel 账号
3. 导入项目并配置环境变量
4. 自动部署完成

### 环境变量配置

在部署平台上设置以下环境变量：

- `DASHSCOPE_API_KEY`
- `DASHSCOPE_ENDPOINT`
- `DASHVECTOR_API_KEY`
- `DASHVECTOR_ENDPOINT`

## 📝 注意事项

1. **API 密钥安全**：不要将 `.env.local` 提交到版本控制
2. **网络延迟**：AI 搜索可能需要 2-3 秒响应时间
3. **数据更新**：如需更新向量数据，请重新运行后端的批量向量化脚本

## 🆘 常见问题

### Q: 搜索无结果怎么办？

A: 检查 API 密钥是否正确，或尝试不同的搜索关键词。

### Q: 加载时间过长？

A: 这是正常的，AI 向量化需要一定时间。

### Q: 如何自定义搜索结果数量？

A: 修改 `topK` 参数（默认 5，可设置为 3-10）。

## 🎉 结语

这个前端应用展示了如何将 AI 向量搜索技术与现代化 Web 开发相结合，为用户提供智能化的搜索体验。基于 DashScope 和 DashVector 的强大能力，我们可以构建出更加智能和个性化的应用。

---

**技术支持**: 如有问题，请查看浏览器控制台或服务器日志。
**更新日志**: 请查看 Git 提交记录。
