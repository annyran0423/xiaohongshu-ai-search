# AI 总结 Markdown 展示指南

## 🎯 功能概述

现在你的 AI 搜索系统支持返回 Markdown 格式的智能总结，并在前端优雅地展示！

## 🚀 使用方法

### 1. 普通搜索（无总结）

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "悉尼旅游攻略"}'
```

### 2. 智能搜索（带 AI 总结）

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "悉尼旅游攻略", "withSummary": true}'
```

### 3. 自定义总结 Prompt

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "悉尼旅游攻略",
    "withSummary": true,
    "customPrompt": "请重点分析这些攻略的行程特点和适用人群",
    "summaryOptions": {
      "max_tokens": 1000,
      "temperature": 0.5
    }
  }'
```

## 🎨 前端展示效果

### AI 总结区域样式

- 🎨 **渐变背景**：紫色到蓝色的优雅渐变
- 🤖 **AI 标识**：智能机器人图标和"通义千问生成"标签
- 📋 **操作按钮**：复制总结、继续对话功能
- 📊 **统计信息**：显示基于多少条结果生成

### Markdown 渲染特性

- ✅ **标题样式**：H1-H3 不同层级样式
- ✅ **列表支持**：有序列表和无序列表
- ✅ **代码块**：语法高亮和滚动条
- ✅ **引用块**：紫色左边框和背景
- ✅ **粗体斜体**：不同的字体权重
- ✅ **链接支持**：可点击的超链接

## 📝 支持的 Markdown 语法

### 标题

```markdown
# 一级标题

## 二级标题

### 三级标题
```

### 列表

```markdown
- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
```

### 文本格式

```markdown
**粗体文本**
_斜体文本_
`行内代码`
```

### 引用

```markdown
> 这是一个引用块
> 可以包含多行内容
```

### 代码块

```javascript
function example() {
  console.log('代码示例');
}
```

## 🔧 技术实现

### 1. 后端 API 支持

```typescript
// 支持的请求参数
interface SearchRequest {
  query: string;
  topK?: number;
  withSummary?: boolean; // 启用AI总结
  customPrompt?: string; // 自定义总结提示词
  summaryOptions?: {
    max_tokens?: number;
    temperature?: number;
    model?: string;
  };
}
```

### 2. 前端组件

```typescript
// SearchResults组件支持summary参数
<SearchResults
  results={searchResults}
  isLoading={isLoading}
  query={currentQuery}
  summary={aiSummary} // 新增的summary参数
/>
```

### 3. Markdown 渲染

```typescript
// 使用react-markdown库
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h1: ({ children }) => <h1 className="...">{children}</h1>,
    h2: ({ children }) => <h2 className="...">{children}</h2>,
    // ... 其他组件样式
  }}
>
  {summary}
</ReactMarkdown>;
```

## 🎯 示例输出

当你搜索"悉尼旅游攻略"时，AI 会生成类似这样的总结：

```
### 一、主要主题和核心观点

1. **悉尼城市漫步体验**
   所有攻略均围绕"轻松、悠闲的悉尼城市漫步"展开

2. **景点推荐与拍照机位**
   悉尼歌剧院、皇家植物园等景点频频出现

### 二、关键信息和要点总结

#### 【1】《先出发再说|悉尼五天五晚自由行攻略》
- **行程特点**：轻松、不赶时间，以"chill"为主
- **交通方式**：公交、火车、轮渡
- **实用建议**：文字版配合视频更佳

#### 【2】《悉尼🇦🇺绝美citywalk路线》
- **行程安排**：两天citywalk，涵盖多个经典景点
- **特色亮点**：Cremorne Point的拍照机位

### 三、共同趋势或模式

1. **"Citywalk"成为主流**
2. **重视拍照与出片机位**
3. **公共交通便捷**

### 四、简洁概括性结论

这三篇攻略均以"轻松citywalk"方式呈现，适合首次来悉尼的游客。
```

## 🚀 完整测试流程

1. **启动服务**：

   ```bash
   npm run frontend:dev
   ```

2. **打开浏览器**：

   ```
   http://localhost:3000
   ```

3. **输入搜索词**：

   ```
   悉尼旅游攻略
   ```

4. **查看 AI 总结**：
   - 搜索结果上方会显示紫色渐变区域
   - 包含完整的 Markdown 格式总结
   - 支持标题、列表、引用等多种格式

## 💡 扩展功能

### 复制总结

```javascript
const copySummary = () => {
  navigator.clipboard.writeText(aiSummary);
};
```

### 继续对话

```javascript
const continueConversation = () => {
  // 可以跳转到聊天界面继续讨论
  router.push('/chat?summary=' + encodeURIComponent(aiSummary));
};
```

### 导出总结

```javascript
const exportSummary = () => {
  const blob = new Blob([aiSummary], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ai-summary.md';
  a.click();
};
```

现在你的 AI 搜索系统已经完全支持 Markdown 格式的智能总结展示！🎉
