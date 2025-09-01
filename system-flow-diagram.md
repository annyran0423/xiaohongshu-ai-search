# 小红书 AI 搜索系统完整流程图

## 📊 系统架构概览

```mermaid
graph TB
    subgraph "数据准备阶段"
        A1[原始JSON文件] --> B1[insert-notes脚本]
        B1 --> C1[MongoDB存储]
        C1 --> D1[batch-vectorize脚本]
        D1 --> E1[DashScope向量化]
        E1 --> F1[向量存储]
        F1 --> G1[DashVector数据库]
    end

    subgraph "查询处理阶段"
        H1[用户查询] --> I1[查询预处理]
        I1 --> J1[DashScope向量化]
        J1 --> K1[向量查询]
        K1 --> L1[DashVector搜索]
        L1 --> M1[返回搜索结果]
    end

    subgraph "智能总结阶段"
        M1 --> N1[结果格式化]
        N1 --> O1[构建总结Prompt]
        O1 --> P1[调用通义千问API]
        P1 --> Q1[AI内容分析]
        Q1 --> R1[生成智能总结]
    end

    subgraph "结果输出阶段"
        R1 --> S1[整合搜索+总结]
        S1 --> T1[JSON响应格式]
        T1 --> U1[返回前端]
    end

    style A1 fill:#e1f5fe
    style H1 fill:#f3e5f5
    style N1 fill:#e8f5e8
    style S1 fill:#fff3e0
```

## 🔄 详细流程图

```mermaid
flowchart TD
    %% 数据导入阶段
    A[开始] --> B{数据准备}
    B --> C[读取notes/目录JSON文件]
    C --> D[解析JSON数据结构]
    D --> E[数据清洗和格式化]
    E --> F[插入MongoDB数据库]

    %% 向量化阶段
    F --> G{向量化处理}
    G --> H[连接MongoDB]
    H --> I[批量读取笔记数据]
    I --> J[提取标题+内容文本]
    J --> K[调用DashScope embedText API]
    K --> L[生成1536维向量]
    L --> M[准备向量文档格式]
    M --> N[插入DashVector数据库]
    N --> O[更新向量索引]

    %% 查询处理阶段
    O --> P{用户查询}
    P --> Q[接收查询字符串]
    Q --> R[查询预处理]
    R --> S[调用DashScope embedText API]
    S --> T[生成查询向量]
    T --> U[向量相似度搜索]
    U --> V[Top-K结果排序]
    V --> W[返回搜索结果]

    %% AI总结阶段
    W --> X{AI总结处理}
    X --> Y[提取搜索结果内容]
    Y --> Z[构建总结Prompt模板]
    Z --> AA[调用通义千问文本生成API]
    AA --> BB[AI分析和推理]
    BB --> CC[生成自然语言总结]
    CC --> DD[格式化总结结果]

    %% 响应阶段
    DD --> EE[整合搜索+总结数据]
    EE --> FF[构建JSON响应]
    FF --> GG[返回前端应用]
    GG --> HH[结束]

    %% 样式定义
    classDef dataPrep fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef vectorize fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef search fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef ai fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef response fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class B,C,D,E,F dataPrep
    class G,H,I,J,K,L,M,N,O vectorize
    class P,Q,R,S,T,U,V,W search
    class X,Y,Z,AA,BB,CC,DD ai
    class EE,FF,GG,HH response
```

## 📋 核心组件说明

### 1. 数据存储层

- **MongoDB**: 存储原始笔记数据（标题、内容、作者、标签、URL 等）
- **DashVector**: 存储向量化的笔记数据，用于语义搜索

### 2. AI 服务层

- **DashScope Embeddings**: 将文本转换为向量（text-embedding-v2 模型）
- **通义千问**: 进行智能内容分析和总结（qwen-turbo 模型）

### 3. API 接口层

- **基础搜索**: `/api/search` - 向量相似度搜索
- **智能总结**: `/api/search/summary` - 搜索+AI 总结

## 🔧 技术栈详情

```mermaid
graph LR
    A[前端界面] --> B[Next.js API Routes]
    B --> C[SearchService]
    C --> D[DashScopeService]
    C --> E[DashVectorService]

    D --> F[文本向量化]
    D --> G[AI文本生成]

    E --> H[向量搜索]
    E --> I[向量存储]

    F --> J[embedText API]
    G --> K[文本生成API]
    H --> L[query API]
    I --> M[docs API]
```

## 📊 数据流向图

```mermaid
stateDiagram-v2
    [*] --> 数据导入
    数据导入 --> MongoDB: JSON文件解析
    MongoDB --> 向量化: 读取笔记数据
    向量化 --> DashVector: 存储向量数据

    用户查询 --> 向量搜索: 查询向量化
    向量搜索 --> DashVector: 相似度匹配
    DashVector --> 结果返回: Top-K文档

    结果返回 --> AI总结: 内容分析
    AI总结 --> 通义千问: 智能推理
    通义千问 --> 最终结果: 生成总结

    最终结果 --> [*]

    note right of 数据导入
        scripts/insert-test-data.js
        读取notes/目录的JSON文件
        存储到MongoDB
    end note

    note right of 向量化
        scripts/batch-vectorize.js
        调用DashScope向量化API
        存储到DashVector
    end note

    note right of 向量搜索
        DashVectorService.search()
        向量相似度匹配
        返回排序结果
    end note

    note right of AI总结
        DashScopeService.summarizeSearchResults()
        构建分析Prompt
        调用通义千问API
    end note
```

## 🚀 完整使用流程

### 1. 系统初始化

```bash
# 1. 导入数据到MongoDB
npm run insert-notes

# 2. 向量化并存储到DashVector
npm run batch-vectorize

# 3. 启动前端服务
npm run frontend:dev
```

### 2. 用户查询流程

```bash
# 基础搜索
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "悉尼旅游攻略", "topK": 5}'

# 智能搜索+总结
curl -X POST http://localhost:3000/api/search/summary \
  -H "Content-Type: application/json" \
  -d '{"query": "悉尼旅游攻略", "topK": 3}'
```

### 3. 内部处理流程

1. **查询预处理** → 2. **文本向量化** → 3. **向量搜索** → 4. **AI 总结** → 5. **结果返回**

这个流程图完整展示了从数据准备到智能搜索的整个系统架构！🎯
