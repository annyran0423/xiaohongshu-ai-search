const axios = require('axios');

class DashVectorClient {
  constructor(apiKey, endpoint) {
    // 验证必要的配置参数
    if (!apiKey) {
      throw new Error('DASHVECTOR_API_KEY is required');
    }
    if (!endpoint) {
      throw new Error('DASHVECTOR_ENDPOINT is required');
    }

    this.apiKey = apiKey;
    this.endpoint = endpoint;

    console.log(`🔗 DashVector 连接配置:`);
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   API Key: ${apiKey.substring(0, 8)}...`);

    this.axiosInstance = axios.create({
      baseURL: endpoint,
      headers: {
        'Content-Type': 'application/json',
        'dashvector-auth-token': apiKey,
      },
      timeout: 30000, // 30秒超时
    });
  }

  // 创建集合 - 使用正确的 DashVector API 格式
  async createCollection(collectionName, dimension) {
    try {
      const response = await this.axiosInstance.post('/v1/collections', {
        name: collectionName,
        dimension: dimension,
        metric: 'cosine', // 注意：是 metric 不是 metric_type
        fields_schema: {
          noteId: 'str',
          title: 'str',
          content: 'str'
        }
      });
      return response.data;
    } catch (error) {
      console.error('创建集合失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 删除集合
  async deleteCollection(collectionName) {
    try {
      const response = await this.axiosInstance.delete(`/v1/collections/${collectionName}`);
      return response.data;
    } catch (error) {
      console.error('删除集合失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 插入文档 - 使用正确的格式
  async insertDocs(collectionName, docs) {
    try {
      const response = await this.axiosInstance.post(`/v1/collections/${collectionName}/docs`, {
        docs: docs
      });
      return response.data;
    } catch (error) {
      console.error('插入文档失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 向量搜索 - 使用正确的格式
  async search(collectionName, vector, topK = 5) {
    try {
      const response = await this.axiosInstance.post(`/v1/collections/${collectionName}/query`, {
        vector: vector,
        top_k: topK,
        include_values: true,
        include_metadata: true,
        filter: {}
      });
      return response.data;
    } catch (error) {
      console.error('向量搜索失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = DashVectorClient;
