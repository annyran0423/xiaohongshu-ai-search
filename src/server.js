require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { vectorizeNote, semanticSearch } = require('./middleware/vectorMiddleware');

// 创建 Express 应用
const app = express();
app.use(express.json());

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 小红书笔记数据模型
const noteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  originalInput: { type: String }, // 原始输入URL
  timestamp: { type: Date, default: Date.now }, // 抓取时间戳
  detail: {
    id: { type: String },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    stats: {
      likes: { type: String, default: "0" },
      comments: { type: String, default: "0" },
      collects: { type: String, default: "0" }
    },
    images: [{ type: String }],
    url: { type: String } // 笔记的完整URL
  },
  comments: [{ type: mongoose.Schema.Types.Mixed }], // 评论数据
  vector: { type: [Number], default: [] }, // 存储向量表示
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

const Note = mongoose.model('Note', noteSchema);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: '小红书AI搜索服务已启动' });
});

// 导入笔记数据接口
app.post('/notes', vectorizeNote, async (req, res) => {
  try {
    const { noteId, originalInput, timestamp, detail, comments } = req.body;

    // 检查是否已存在相同的笔记
    const existingNote = await Note.findOne({ noteId });
    if (existingNote) {
      return res.status(409).json({
        message: '笔记已存在',
        noteId,
        existingNote: existingNote._id
      });
    }

    const note = new Note({
      noteId,
      originalInput,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      detail,
      comments: comments || [],
      vector: req.vectorizedData || [] // 从向量化中间件获取向量数据
    });

    await note.save();
    res.status(201).json({
      message: '笔记数据保存成功',
      note: {
        id: note._id,
        noteId: note.noteId,
        title: note.detail.title,
        author: note.detail.author,
        createdAt: note.createdAt
      }
    });
  } catch (error) {
    console.error('保存笔记失败:', error);
    res.status(500).json({ error: error.message });
  }
});

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
