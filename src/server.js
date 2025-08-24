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
  detail: {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    images: [{ type: String }],
  },
  vector: { type: [Number], default: [] }, // 存储向量表示
});

const Note = mongoose.model('Note', noteSchema);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: '小红书AI搜索服务已启动' });
});

// 导入笔记数据接口
app.post('/notes', vectorizeNote, async (req, res) => {
  try {
    const { noteId, detail } = req.body;
    const note = new Note({ noteId, detail });
    await note.save();
    res.status(201).json({ message: '笔记数据保存成功', note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取所有笔记
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
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
