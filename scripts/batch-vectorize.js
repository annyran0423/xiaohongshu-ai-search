#!/usr/bin/env node

// 批量向量化脚本 - 处理MongoDB中的笔记数据
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_ENDPOINT = process.env.DASHSCOPE_ENDPOINT || 'dashscope.aliyuncs.com';
const DASHVECTOR_API_KEY = process.env.DASHVECTOR_API_KEY;
const DASHVECTOR_ENDPOINT = process.env.DASHVECTOR_ENDPOINT;
const COLLECTION_NAME = 'xiaohongshu_notes';

// MongoDB 连接
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      // 新版本mongoose默认启用这些选项，不需要显式设置
    });

    cachedConnection = connection;
    console.log('✅ MongoDB 连接成功');
    return connection;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    throw error;
  }
}

// 笔记模型
const NoteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  url: { type: String },
  stats: { type: Object },
  images: [{ type: String }]
});

const Note = mongoose.model('Note', NoteSchema);

// DashScope 向量化服务
class DashScopeService {
  constructor() {
    this.apiKey = DASHSCOPE_API_KEY;
    this.endpoint = DASHSCOPE_ENDPOINT;
  }

  async embedText(text) {
    try {
      const response = await axios.post(
        `https://${this.endpoint}/compatible-mode/v1/embeddings`,
        {
          model: 'text-embedding-v2',
          input: text,
          encoding_format: 'float'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].embedding;
      } else {
        throw new Error('向量化响应格式错误');
      }
    } catch (error) {
      console.error('DashScope 向量化失败:', error.message);
      if (error.response) {
        console.error('API响应:', error.response.data);
      }
      throw new Error('文本向量化失败');
    }
  }

  async embedTexts(texts) {
    try {
      const response = await axios.post(
        `https://${this.endpoint}/compatible-mode/v1/embeddings`,
        {
          model: 'text-embedding-v2',
          input: texts.length === 1 ? texts[0] : texts,
          encoding_format: 'float'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 60000,
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        return response.data.data.map(item => item.embedding);
      } else {
        throw new Error('批量向量化响应格式错误');
      }
    } catch (error) {
      console.error('DashScope 批量向量化失败:', error.message);
      if (error.response) {
        console.error('API响应:', error.response.data);
      }
      throw new Error('批量文本向量化失败');
    }
  }
}

// DashVector 存储服务
class DashVectorService {
  constructor() {
    this.apiKey = DASHVECTOR_API_KEY;
    this.endpoint = DASHVECTOR_ENDPOINT;
    this.collectionName = COLLECTION_NAME;
  }

  async insertDocuments(documents) {
    try {
      const response = await axios.post(
        `https://${this.endpoint}/v1/collections/${this.collectionName}/docs`,
        {
          docs: documents
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'dashvector-auth-token': this.apiKey,
          },
          timeout: 30000,
        }
      );

      if (response.data.code === 0) {
        return response.data.output;
      } else {
        throw new Error(`插入文档失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('DashVector 插入失败:', error.message);
      if (error.response) {
        console.error('API响应:', error.response.data);
      }
      throw new Error('向量数据插入失败');
    }
  }

  async healthCheck() {
    try {
      const testVector = Array(1536).fill(0.1);
      const response = await axios.post(
        `https://${this.endpoint}/v1/collections/${this.collectionName}/query`,
        {
          vector: testVector,
          topk: 1,
          include_vector: false,
          include_fields: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'dashvector-auth-token': this.apiKey,
          },
          timeout: 10000,
        }
      );
      return response.data.code === 0;
    } catch (error) {
      return false;
    }
  }
}

// 验证环境变量
function validateEnv() {
  const required = [
    'DASHSCOPE_API_KEY',
    'DASHVECTOR_API_KEY',
    'DASHVECTOR_ENDPOINT'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ 缺少必要的环境变量:');
    missing.forEach(key => console.error(`   • ${key}`));
    console.error('\n请在 .env 文件中设置这些变量');
    process.exit(1);
  }

  console.log('✅ 环境变量检查通过');
}

// 批量处理笔记
async function processNotes(notes, dashscopeService, dashvectorService) {
  const batchSize = 10; // 每批处理10个笔记
  const totalBatches = Math.ceil(notes.length / batchSize);
  let processed = 0;
  let successCount = 0;
  let errorCount = 0;

  console.log(`📊 开始批量处理，共 ${notes.length} 个笔记，分 ${totalBatches} 批处理`);

  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, notes.length);
    const batch = notes.slice(start, end);

    try {
      console.log(`🔄 处理第 ${i + 1}/${totalBatches} 批 (${start + 1}-${end})`);

      // 准备文本数据
      const texts = batch.map(note => `${note.title} ${note.content}`);
      const titles = batch.map(note => note.title);
      const contents = batch.map(note => note.content);
      const noteIds = batch.map(note => note.noteId);

      // 批量向量化
      console.log('   📝 向量化中...');
      const embeddings = await dashscopeService.embedTexts(texts);

      // 准备文档数据
      const documents = batch.map((note, index) => ({
        id: note.noteId,
        vector: embeddings[index],
        fields: {
          title: note.title,
          content: note.content,
          noteId: note.noteId,
          url: note.url
        }
      }));

      // 插入到DashVector
      console.log('   💾 存储向量数据...');
      await dashvectorService.insertDocuments(documents);

      successCount += batch.length;
      processed += batch.length;

      console.log(`   ✅ 本批处理完成 (${batch.length} 个笔记)`);

      // 添加延迟避免API限流
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`   ❌ 本批处理失败:`, error.message);
      errorCount += batch.length;
      processed += batch.length;
    }

    // 显示进度
    const progress = ((processed / notes.length) * 100).toFixed(1);
    console.log(`📈 进度: ${progress}% (${processed}/${notes.length})`);
  }

  return { successCount, errorCount };
}

// 主函数
async function batchVectorize() {
  try {
    console.log('🚀 开始批量向量化处理');
    console.log('================================');

    // 验证环境变量
    validateEnv();

    // 连接数据库
    await connectToDatabase();

    // 检查DashVector连接
    console.log('\n🔍 检查 DashVector 连接...');
    const dashvectorService = new DashVectorService();
    const isHealthy = await dashvectorService.healthCheck();

    if (!isHealthy) {
      console.error('❌ DashVector 服务不可用，请检查配置');
      process.exit(1);
    }

    console.log('✅ DashVector 连接正常');

    // 初始化服务
    const dashscopeService = new DashScopeService();

    // 获取笔记数据
    console.log('\n📖 获取笔记数据...');
    const notes = await Note.find({}).limit(1000); // 限制处理数量以避免API限流

    if (notes.length === 0) {
      console.log('⚠️ 没有找到笔记数据，请先导入数据');
      process.exit(0);
    }

    console.log(`📊 找到 ${notes.length} 个笔记`);

    // 批量处理
    const { successCount, errorCount } = await processNotes(
      notes,
      dashscopeService,
      dashvectorService
    );

    // 结果统计
    console.log('\n🎉 批量向量化处理完成！');
    console.log('================================');
    console.log(`✅ 成功处理: ${successCount} 个笔记`);
    console.log(`❌ 处理失败: ${errorCount} 个笔记`);
    console.log(`📊 成功率: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    if (errorCount > 0) {
      console.log('\n💡 提示：如果有处理失败的笔记，可以重新运行脚本');
    }

  } catch (error) {
    console.error('\n❌ 批量向量化失败:', error.message);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📪 数据库连接已关闭');
    }
  }
}

// 运行脚本
if (require.main === module) {
  batchVectorize();
}

module.exports = { batchVectorize };
