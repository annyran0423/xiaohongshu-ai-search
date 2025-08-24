const mongoose = require('mongoose');
const VectorService = require('../services/vectorService');

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
  vector: { type: [Number], default: [] },
});

const Note = mongoose.model('Note', noteSchema);

async function batchVectorize() {
  try {
    const vectorService = new VectorService();
    
    // 获取所有笔记
    const notes = await Note.find();
    
    if (notes.length === 0) {
      console.log('没有找到需要向量化的笔记');
      return;
    }
    
    console.log(`找到 ${notes.length} 条笔记需要向量化`);
    
    // 批量向量化
    await vectorService.batchVectorizeAndStoreNotes(notes);
    
    console.log('批量向量化完成');
  } catch (error) {
    console.error('批量向量化失败:', error);
  } finally {
    // 关闭数据库连接
    mongoose.connection.close();
  }
}

// 执行批量向量化
batchVectorize();
