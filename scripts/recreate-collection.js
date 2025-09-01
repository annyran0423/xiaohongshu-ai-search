#!/usr/bin/env node

// 重新创建 DashVector Collection 并重新向量化
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

// 配置 - 确保环境变量已加载
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';
const DASHVECTOR_API_KEY = process.env.DASHVECTOR_API_KEY;
const DASHVECTOR_ENDPOINT = process.env.DASHVECTOR_ENDPOINT;
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const COLLECTION_NAME = 'xiaohongshu_notes';

// 验证必需的环境变量
if (!DASHSCOPE_API_KEY) {
  console.error('❌ DASHSCOPE_API_KEY 环境变量未设置');
  process.exit(1);
}
if (!DASHVECTOR_API_KEY) {
  console.error('❌ DASHVECTOR_API_KEY 环境变量未设置');
  process.exit(1);
}
if (!DASHVECTOR_ENDPOINT) {
  console.error('❌ DASHVECTOR_ENDPOINT 环境变量未设置');
  process.exit(1);
}

// MongoDB 模型
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

// DashVector 服务
class DashVectorService {
  constructor() {
    this.apiKey = DASHVECTOR_API_KEY;
    this.endpoint = DASHVECTOR_ENDPOINT;
    this.collectionName = COLLECTION_NAME;
  }

  async recreateCollection() {
    try {
      console.log('🔄 重新创建 DashVector Collection...');

      // 删除现有 Collection（多次尝试）
      for (let i = 0; i < 3; i++) {
        try {
          const deleteResponse = await axios.delete(
            `https://${this.endpoint}/v1/collections/${this.collectionName}`,
            {
              headers: {
                'dashvector-auth-token': this.apiKey,
              },
            }
          );

          if (deleteResponse.data.code === 0) {
            console.log('✅ 删除旧 Collection 成功');
            break;
          } else {
            console.log(`⚠️ 删除尝试 ${i + 1} 失败: ${deleteResponse.data.message}`);
          }
        } catch (error) {
          if (error.response?.status === 404) {
            console.log('ℹ️ Collection 不存在，无需删除');
            break;
          }
          console.log(`⚠️ 删除尝试 ${i + 1} 失败:`, error.response?.data?.message || error.message);
        }

        if (i < 2) {
          console.log('⏳ 等待后重试...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // 创建新 Collection（包含 url 字段）
      const createRequest = {
        name: this.collectionName,
        dimension: 1536,
        metric: 'cosine',
        fields_schema: {
          title: 'string',
          content: 'string',
          noteId: 'string',
          url: 'string'
        }
      };

      const response = await axios.post(
        `https://${this.endpoint}/v1/collections`,
        createRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'dashvector-auth-token': this.apiKey,
          },
        }
      );

      if (response.data.code === 0) {
        console.log('✅ 创建新 Collection 成功');
        // 等待 Collection 准备就绪
        console.log('⏳ 等待 Collection 初始化...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        return true;
      } else {
        throw new Error(`创建 Collection 失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('❌ 重新创建 Collection 失败:', error.message);
      throw error;
    }
  }

  async insertDocuments(documents) {
    try {
      const response = await axios.post(
        `https://${this.endpoint}/v1/collections/${this.collectionName}/docs`,
        { docs: documents },
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
      throw error;
    }
  }
}

// DashScope 向量化服务
class DashScopeService {
  constructor() {
    this.apiKey = DASHSCOPE_API_KEY;
    this.endpoint = 'dashscope.aliyuncs.com';
    console.log('🔑 DashScope API Key:', this.apiKey ? '✓ 已设置' : '✗ 未设置');
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
      throw error;
    }
  }
}

async function recreateCollectionAndRevectorize() {
  try {
    console.log('🚀 开始重新创建 Collection 并重新向量化...');
    console.log('================================');

    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    // 初始化服务
    const dashvectorService = new DashVectorService();
    const dashscopeService = new DashScopeService();

    // 重新创建 Collection
    await dashvectorService.recreateCollection();

    // 获取笔记数据
    console.log('\n📖 获取笔记数据...');
    const notes = await Note.find({}).limit(1000);

    if (notes.length === 0) {
      console.log('⚠️ 没有找到笔记数据');
      return;
    }

    console.log(`📊 找到 ${notes.length} 个笔记`);

    // 批量处理
    const batchSize = 10;
    const totalBatches = Math.ceil(notes.length / batchSize);
    let processed = 0;

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
        const urls = batch.map(note => note.url);

        // 批量向量化
        console.log('   📝 向量化中...');
        const embeddings = await dashscopeService.embedTexts(texts);

        // 准备文档数据（包含 URL）
        const documents = batch.map((note, index) => ({
          id: note.noteId,
          vector: embeddings[index],
          fields: {
            title: note.title,
            content: note.content,
            noteId: note.noteId,
            url: note.url || '' // 确保 URL 字段存在
          }
        }));

        // 插入到DashVector
        console.log('   💾 存储向量数据...');
        await dashvectorService.insertDocuments(documents);

        processed += batch.length;
        console.log(`   ✅ 本批处理完成 (${batch.length} 个笔记)`);

        // 显示进度
        const progress = ((processed / notes.length) * 100).toFixed(1);
        console.log(`📈 进度: ${progress}% (${processed}/${notes.length})`);

        // 添加延迟避免API限流
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`   ❌ 本批处理失败:`, error.message);
        processed += batch.length;
      }
    }

    console.log('\n🎉 重新创建 Collection 并重新向量化完成！');
    console.log('================================');
    console.log(`✅ 成功处理: ${processed} 个笔记`);

  } catch (error) {
    console.error('\n❌ 重新创建 Collection 失败:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📪 数据库连接已关闭');
    }
  }
}

// 运行脚本
if (require.main === module) {
  recreateCollectionAndRevectorize();
}

module.exports = { recreateCollectionAndRevectorize };
