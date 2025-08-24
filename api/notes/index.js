const mongoose = require('mongoose');
const { vectorizeNote } = require('../../src/middleware/vectorMiddleware');

// MongoDB 连接
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// 小红书笔记数据模型
const noteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  detail: {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    images: [{ type: String }],
  },
  vector: { type: [Number], default: [] },
});

let Note;
try {
  Note = mongoose.model('Note');
} catch {
  Note = mongoose.model('Note', noteSchema);
}

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // 获取所有笔记
      const notes = await Note.find();
      res.status(200).json(notes);
    } else if (req.method === 'POST') {
      // 创建新笔记 - 需要向量化处理
      const { noteId, detail } = req.body;

      // 模拟向量化中间件的处理
      req.body = { noteId, detail };
      req.vectorizedData = null;

      // 调用向量化中间件
      await new Promise((resolve, reject) => {
        vectorizeNote(req, res, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      const note = new Note({
        noteId,
        detail,
        vector: req.vectorizedData || []
      });

      await note.save();
      res.status(201).json({ message: '笔记数据保存成功', note });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};
