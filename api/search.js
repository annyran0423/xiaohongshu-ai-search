const mongoose = require('mongoose');
const { semanticSearch } = require('../src/middleware/vectorMiddleware');

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

module.exports = async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // 模拟语义搜索中间件的处理
    req.searchResults = null;

    // 调用语义搜索中间件
    await new Promise((resolve, reject) => {
      semanticSearch(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // 返回搜索结果
    res.status(200).json(req.searchResults || []);
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({ error: error.message });
  }
};
