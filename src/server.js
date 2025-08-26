require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { vectorizeNote, semanticSearch } = require('./middleware/vectorMiddleware');
const {
  validateNoteInput,
  checkDuplicateNote,
  saveToDatabase,
  sendSuccessResponse
} = require('./middleware/databaseMiddleware');
const Note = require('./models/Note');

// 创建 Express 应用
const app = express();
app.use(express.json());

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 数据模型现在在 middleware/databaseMiddleware.js 中定义

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: '小红书AI搜索服务已启动' });
});

// 导入笔记数据接口 - 多中间件链式调用
app.post('/notes',
  validateNoteInput,    // 1️⃣ 验证输入数据
  checkDuplicateNote,   // 2️⃣ 检查是否重复
  vectorizeNote,        // 3️⃣ 生成向量并存储到向量数据库
  saveToDatabase,       // 4️⃣ 保存到 MongoDB
  sendSuccessResponse   // 5️⃣ 发送成功响应
);

// 获取所有笔记
app.get('/notes', async (req, res) => {
  try {
    const { page = 1, limit = 10, author, keyword } = req.query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    let query = {};
    if (author) {
      query['detail.author'] = new RegExp(author, 'i');
    }
    if (keyword) {
      query.$or = [
        { 'detail.title': new RegExp(keyword, 'i') },
        { 'detail.content': new RegExp(keyword, 'i') }
      ];
    }

    // 执行查询
    const notes = await Note.find(query)
      .select('noteId detail.title detail.author detail.stats createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: notes.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('获取笔记失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 获取单个笔记详情
app.get('/notes/:noteId', async (req, res) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findOne({ noteId });

    if (!note) {
      return res.status(404).json({ error: '笔记不存在' });
    }

    res.json(note);
  } catch (error) {
    console.error('获取笔记详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 搜索笔记接口（向量语义搜索）
app.get('/search', semanticSearch, async (req, res) => {
  try {
    // 返回通过向量语义搜索得到的结果
    res.json(req.searchResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
