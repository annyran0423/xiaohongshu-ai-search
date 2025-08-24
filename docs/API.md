# 小红书AI搜索服务 API 文档

## 目录
- [环境配置](#环境配置)
- [启动服务](#启动服务)
- [API接口](#api接口)
  - [导入笔记数据](#导入笔记数据)
  - [获取所有笔记](#获取所有笔记)
  - [搜索笔记](#搜索笔记)

## 环境配置

在项目根目录下的 `.env` 文件中配置以下环境变量：

```env
MONGODB_URI=mongodb://localhost:27017/xiaohongshu
DASHVECTOR_API_KEY=your_dashvector_api_key
DASHVECTOR_ENDPOINT=your_dashvector_endpoint
DASHSCOPE_API_KEY=your_dashscope_api_key
PORT=3000
```

## 启动服务

1. 安装依赖：
```bash
npm install
```

2. 初始化向量数据库集合：
```bash
npm run init-collection
```

3. 启动服务：
```bash
npm start
```

## API接口

### 导入笔记数据

将小红书笔记数据导入数据库并生成向量表示。

**URL**: `/notes`

**方法**: `POST`

**请求数据**:
```json
{
  "noteId": "unique_note_id",
  "detail": {
    "title": "笔记标题",
    "content": "笔记内容",
    "author": "作者",
    "images": ["image_url_1", "image_url_2"]
  }
}
```

**响应数据**:
```json
{
  "message": "笔记数据保存成功",
  "note": {
    "_id": "mongodb_document_id",
    "noteId": "unique_note_id",
    "detail": {
      "title": "笔记标题",
      "content": "笔记内容",
      "author": "作者",
      "images": ["image_url_1", "image_url_2"]
    }
  }
}
```

### 获取所有笔记

获取数据库中所有的小红书笔记数据。

**URL**: `/notes`

**方法**: `GET`

**响应数据**:
```json
[
  {
    "_id": "mongodb_document_id",
    "noteId": "unique_note_id",
    "detail": {
      "title": "笔记标题",
      "content": "笔记内容",
      "author": "作者",
      "images": ["image_url_1", "image_url_2"]
    }
  }
]
```

### 搜索笔记

基于语义的向量搜索功能，支持根据内容或内容联想进行搜索。

**URL**: `/search`

**方法**: `GET`

**查询参数**:
- `query`: 搜索关键词
- `topK` (可选): 返回结果数量，默认为5

**示例**: `/search?query=悉尼旅游攻略&topK=10`

**响应数据**:
```json
[
  {
    "id": "note_id",
    "score": 0.85,
    "fields": {
      "noteId": "unique_note_id",
      "title": "笔记标题",
      "content": "笔记内容"
    }
  }
]
```
