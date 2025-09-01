#!/usr/bin/env node

// 初始化 DashVector Collection 的脚本
require('dotenv').config();

const axios = require('axios');

// DashVector 配置
const DASHVECTOR_API_KEY = process.env.DASHVECTOR_API_KEY;
const DASHVECTOR_ENDPOINT = process.env.DASHVECTOR_ENDPOINT;
const COLLECTION_NAME = 'xiaohongshu_notes';

// 验证环境变量
function validateEnv() {
  if (!DASHVECTOR_API_KEY || !DASHVECTOR_ENDPOINT) {
    throw new Error('DASHVECTOR_API_KEY and DASHVECTOR_ENDPOINT are required');
  }
}

class DashVectorService {
  constructor() {
    this.apiKey = DASHVECTOR_API_KEY;
    this.endpoint = DASHVECTOR_ENDPOINT;
    this.collectionName = COLLECTION_NAME;
  }

  async initCollection() {
    try {
      console.log(`🏗️ 尝试创建 Collection: ${this.collectionName}`);

      // 创建 collection 的请求体
      const createRequest = {
        name: this.collectionName,
        dimension: 1536, // text-embedding-v2 的维度
        metric: 'cosine', // 相似度度量
        // 移除 fields_schema，因为DashVector可能不支持这个字段
      };

      const response = await axios.post(
        `https://${this.endpoint}/v1/collections`,
        createRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'dashvector-auth-token': this.apiKey,
          },
          timeout: 15000,
        }
      );

      if (response.data.code === 0) {
        console.log(`✅ Collection "${this.collectionName}" 创建成功`);
        return true;
      } else if (response.data.code === 1003 || response.data.message.includes('exist in db')) {
        // Collection 已存在
        console.log(`⚠️ Collection "${this.collectionName}" 已存在`);
        return true;
      } else {
        throw new Error(`创建 Collection 失败: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response?.data?.code === 1003) {
        console.log(`⚠️ Collection "${this.collectionName}" 已存在`);
        return true;
      }
      console.error('初始化 Collection 失败:', error.message);
      if (error.response) {
        console.error('API响应:', error.response.data);
      }
      throw new Error('Collection 初始化失败');
    }
  }

  async describeCollection() {
    try {
      const response = await axios.get(
        `https://${this.endpoint}/v1/collections/${this.collectionName}`,
        {
          headers: {
            'dashvector-auth-token': this.apiKey,
          },
          timeout: 10000,
        }
      );

      if (response.data.code === 0) {
        return response.data.output;
      } else {
        throw new Error(`获取 Collection 信息失败: ${response.data.message}`);
      }
    } catch (error) {
      console.error('获取 Collection 信息失败:', error.message);
      if (error.response) {
        console.error('API响应:', error.response.data);
      }
      return null;
    }
  }

  async healthCheck() {
    try {
      // 发送一个简单的查询来检查服务是否可用
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
      console.error('DashVector 健康检查失败:', error.message);
      return false;
    }
  }
}

async function initCollection() {
  try {
    console.log('🚀 开始初始化 DashVector Collection...');

    // 验证环境变量
    validateEnv();

    // 创建 DashVector 服务实例
    const dashvectorService = new DashVectorService();

    // 检查 collection 是否已存在
    console.log('📋 检查 Collection 状态...');
    const isHealthy = await dashvectorService.healthCheck();
    if (!isHealthy) {
      console.log('⚠️ Collection 可能不存在，准备创建...');
    } else {
      console.log('✅ Collection 已存在且可用');
    }

    // 尝试创建 collection（如果不存在）
    console.log('🏗️ 初始化 Collection...');
    const result = await dashvectorService.initCollection();

    if (result) {
      console.log('✅ Collection 初始化成功！');
      console.log('📊 Collection 信息:');
      console.log(`   • 名称: ${dashvectorService.collectionName}`);
      console.log('   • 维度: 1536 (text-embedding-v2)');
      console.log('   • 度量: cosine');
    } else {
      console.log('⚠️ Collection 初始化失败');
    }

    // 验证 collection 配置
    console.log('🔍 验证 Collection 配置...');
    const collectionInfo = await dashvectorService.describeCollection();
    if (collectionInfo) {
      console.log('✅ Collection 配置验证成功');
      console.log('📊 Collection 详细信息:', JSON.stringify(collectionInfo, null, 2));
    } else {
      console.log('⚠️ 无法获取 Collection 详细信息');
    }

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  initCollection();
}

module.exports = { initCollection, DashVectorService };