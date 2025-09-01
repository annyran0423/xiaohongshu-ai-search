# 🔄 小红书 AI 搜索系统流程图

## 📋 核心流程总览

```mermaid
flowchart TD
    %% 用户输入
    A[用户输入查询<br/>如"悉尼拍照"] --> B[前端表单提交]

    %% 前端处理
    B --> C[React界面<br/>显示加载状态]

    %% API层
    C --> D[Next.js API<br/>/api/search]
    D --> E[SearchApiHandler<br/>参数验证]

    %% 分支判断
    E --> F{是否需要AI总结?}
    F -->|是| G[semanticSearchWithSummary]
    F -->|否| H[semanticSearch]

    %% 核心搜索流程
    G --> I[文本向量化<br/>DashScope API]
    H --> I
    I --> J[向量搜索<br/>DashVector数据库]
    J --> K[关键词扩展<br/>混合评分]

    %% AI总结分支
    K --> L{AI总结?}
    L -->|是| M[构建总结Prompt]
    L -->|否| N[格式化搜索结果]

    M --> O[调用AI生成<br/>DashScope qwen-turbo]
    O --> P[Markdown格式化]
    P --> N

    %% 返回结果
    N --> Q[JSON响应]
    Q --> R[前端渲染]
    R --> S[显示搜索结果]
    R --> T[显示AI总结]

    %% 样式定义
    classDef frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef service fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef ai fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef result fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class A,B,C frontend
    class D,E,F,G,H backend
    class I,J,K service
    class L,M,O,P ai
    class N,Q,R,S,T result
```

## 🔄 详细交互流程

### 时序图 - 完整搜索过程

```mermaid
sequenceDiagram
    participant 用户
    participant 前端
    participant API路由
    participant 处理器
    participant 搜索服务
    participant 向量服务
    participant AI服务
    participant DashVector
    participant DashScope

    用户->>前端: 输入"悉尼拍照"
    前端->>前端: 显示加载状态

    前端->>API路由: POST /api/search
    API路由->>处理器: 路由处理
    处理器->>处理器: 参数验证(topK, withSummary)

    处理器->>搜索服务: semanticSearchWithSummary()
    搜索服务->>AI服务: embedText("悉尼拍照")
    AI服务->>DashScope: 文本嵌入API调用
    DashScope-->>AI服务: 返回向量数据(1536维)

    搜索服务->>向量服务: search(vector, topK=10)
    向量服务->>DashVector: 向量相似度查询
    DashVector-->>向量服务: 返回候选结果

    搜索服务->>搜索服务: 关键词扩展处理<br/>"拍照"→["摄影","机位","拍摄"...]
    搜索服务->>搜索服务: 混合评分计算<br/>向量分数 + 关键词分数

    搜索服务->>AI服务: summarizeSearchResults()
    AI服务->>AI服务: 构建总结Prompt<br/>包含扩展关键词
    AI服务->>DashScope: 文本生成API调用
    DashScope-->>AI服务: 返回AI总结(Markdown)

    AI服务-->>搜索服务: AI总结文本
    搜索服务-->>处理器: 搜索结果 + AI总结
    处理器-->>API路由: 格式化响应
    API路由-->>前端: JSON数据

    前端->>前端: 渲染搜索结果列表
    前端->>前端: 渲染AI总结(Markdown)
    前端->>用户: 显示完整结果
```

## 🏗️ 系统架构分层

```mermaid
graph TB
    subgraph "用户层"
        UI[React界面<br/>搜索表单 + 结果展示]
    end

    subgraph "表示层"
        API[Next.js API Routes<br/>路由处理]
        Handler[SearchApiHandler<br/>业务逻辑控制器]
    end

    subgraph "服务层"
        SearchSvc[SearchService<br/>搜索核心逻辑]
        DashScopeSvc[DashScopeService<br/>AI文本处理]
        DashVectorSvc[DashVectorService<br/>向量搜索]
    end

    subgraph "数据层"
        DashVector[(DashVector<br/>向量数据库)]
        MongoDB[(MongoDB<br/>原始数据)]
        DashScopeAPI[DashScope API<br/>云端AI服务]
    end

    %% 连接关系
    UI --> API
    API --> Handler
    Handler --> SearchSvc

    SearchSvc --> DashScopeSvc
    SearchSvc --> DashVectorSvc

    DashScopeSvc --> DashScopeAPI
    DashVectorSvc --> DashVector

    %% 样式
    classDef user fill:#e1f5fe,stroke:#01579b
    classDef presentation fill:#f3e5f5,stroke:#4a148c
    classDef service fill:#e8f5e8,stroke:#1b5e20
    classDef data fill:#fff3e0,stroke:#e65100

    class UI user
    class API,Handler presentation
    class SearchSvc,DashScopeSvc,DashVectorSvc service
    class DashVector,MongoDB,DashScopeAPI data
```

## 🔄 核心算法流程

### 混合搜索算法

```mermaid
graph TD
    A[用户查询<br/>"悉尼拍照"] --> B[向量化<br/>1536维向量]

    B --> C[向量搜索<br/>DashVector]
    C --> D[获取候选结果<br/>topK*3]

    D --> E[关键词扩展]
    E --> F[计算混合分数<br/>向量分 + 关键词分]

    F --> G[排序筛选<br/>前topK结果]

    %% 详细扩展
    E --> E1["拍照" → "摄影"]
    E --> E2["拍照" → "机位"]
    E --> E3["拍照" → "拍摄"]

    %% 样式
    classDef process fill:#e3f2fd,stroke:#1976d2
    classDef expand fill:#fff3e0,stroke:#f57c00
    classDef score fill:#e8f5e8,stroke:#2e7d32

    class A,B,C,D,G process
    class E,E1,E2,E3 expand
    class F score
```

### AI 总结生成流程

```mermaid
graph TD
    A[搜索结果] --> B[关键词相关性筛选]
    B --> C[构建总结Prompt]

    C --> D[添加查询关键词<br/>🎯 搜索关键词：悉尼拍照]
    D --> E[添加分析要求<br/>📋 分析要求：关键词相关性优先]
    E --> F[添加搜索结果<br/>搜索结果：[...]]

    F --> G[调用DashScope API<br/>qwen-turbo模型]
    G --> H[生成Markdown总结]
    H --> I[返回前端渲染]

    %% 样式
    classDef input fill:#e3f2fd,stroke:#1976d2
    classDef process fill:#fff3e0,stroke:#f57c00
    classDef api fill:#e8f5e8,stroke:#2e7d32
    classDef output fill:#fce4ec,stroke:#c2185b

    class A,B input
    class C,D,E,F process
    class G,H api
    class I output
```

## 📊 数据流向图

```mermaid
flowchart TD
    %% 数据输入
    Input[用户查询<br/>Text] --> Validate[参数验证<br/>query, topK, withSummary]

    %% 核心处理
    Validate --> Embed[文本向量化<br/>DashScope Embed API]
    Embed --> Vector[向量数据<br/>1536维]

    Vector --> Search[向量搜索<br/>DashVector Query]
    Search --> Candidates[候选结果<br/>Raw Data]

    Candidates --> Expand[关键词扩展<br/>Manual + Auto]
    Expand --> Keywords[扩展关键词<br/>Synonyms]

    Keywords --> Score[混合评分<br/>Vector + Keyword Scores]
    Score --> Ranked[排序结果<br/>Top K]

    %% 分支处理
    Ranked --> Branch{需要AI总结?}
    Branch -->|是| Summarize[构建Prompt<br/>Context + Instructions]
    Branch -->|否| Format[格式化结果<br/>JSON Response]

    Summarize --> Generate[AI生成<br/>DashScope Generate API]
    Generate --> Summary[AI总结<br/>Markdown Text]

    Summary --> Format
    Format --> Response[API响应<br/>JSON]

    %% 前端渲染
    Response --> Display[前端展示<br/>Results + Summary]

    %% 样式定义
    classDef input fill:#e1f5fe,stroke:#01579b
    classDef process fill:#f3e5f5,stroke:#7b1fa2
    classDef ai fill:#fff3e0,stroke:#f57c00
    classDef output fill:#e8f5e8,stroke:#2e7d32

    class Input,Validate input
    class Embed,Vector,Search,Candidates,Expand,Keywords,Score,Ranked process
    class Summarize,Generate,Summary ai
    class Format,Response,Display output
```

## 🔄 关键技术流程

### 1. 向量搜索流程

```mermaid
sequenceDiagram
    participant 查询 as 用户查询
    participant 嵌入 as 文本嵌入
    participant 向量 as 向量数据
    participant 搜索 as 向量搜索
    participant 结果 as 搜索结果

    查询->>嵌入: "悉尼拍照"
    嵌入->>向量: [0.1, 0.2, ..., 0.1536]
    向量->>搜索: 余弦相似度计算
    搜索->>结果: 按相似度排序
    结果->>结果: 返回topK结果
```

### 2. 关键词扩展流程

```mermaid
graph LR
    A[原始查询<br/>"拍照"] --> B{在词典中?}

    B -->|是| C[获取扩展词<br/>["摄影","机位","拍摄"]]
    B -->|否| D[形态学扩展<br/>基于词根规则]

    C --> E[合并去重]
    D --> E

    E --> F[置信度评估<br/>manual: 1.0<br/>morphology: 0.8]

    F --> G[返回扩展结果<br/>+ 置信度分数]
```

### 3. AI 总结流程

```mermaid
sequenceDiagram
    participant 搜索 as 搜索结果
    participant 筛选 as 内容筛选
    participant 构建 as Prompt构建
    participant 调用 as API调用
    participant 生成 as 文本生成
    participant 格式化 as 格式处理

    搜索->>筛选: 按关键词相关性筛选
    筛选->>构建: 构建总结Prompt
    构建->>调用: 调用DashScope API
    调用->>生成: qwen-turbo生成文本
    生成->>格式化: Markdown格式化
    格式化->>格式化: 返回前端
```

## 🎯 性能优化点

```mermaid
mindmap
  root((性能优化))
    缓存层
      Redis缓存
        查询结果缓存
        向量缓存
      CDN加速
        静态资源
        API响应
    并发优化
      连接池
        MongoDB连接池
        DashVector连接池
      异步处理
        非阻塞I/O
        Promise优化
    算法优化
      索引优化
        向量索引
        关键词索引
      搜索策略
        混合搜索
        分层过滤
    监控告警
      性能监控
        响应时间
        错误率
      业务监控
        搜索成功率
        用户满意度
```

---

## 📝 使用示例

### 普通搜索

```javascript
// 前端调用
fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '悉尼旅游',
    topK: 10,
  }),
});
```

### AI 总结搜索

```javascript
// 前端调用
fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '悉尼美食',
    topK: 20,
    withSummary: true,
  }),
});
```

---

_该流程图展示了小红书 AI 搜索系统的完整工作流程，从用户输入到最终结果展示的每一个环节。_
