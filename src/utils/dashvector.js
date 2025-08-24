const axios = require('axios');

class DashVectorClient {
  constructor(apiKey, endpoint) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.axiosInstance = axios.create({
      baseURL: endpoint,
      headers: {
        'Content-Type': 'application/json',
        'dashvector-auth-token': apiKey,
      },
    });
  }

  // 创建集合
  async createCollection(collectionName, dimension) {
    try {
      const response = await this.axiosInstance.post('/v1/collections', {
        name: collectionName,
        dimension: dimension,
        metric_type: 'cosine',
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

  // 插入文档
  async insertDocs(collectionName, docs) {
    try {
      const response = await this.axiosInstance.post(`/v1/collections/${collectionName}/docs`, {
        docs: docs,
      });
      return response.data;
    } catch (error) {
      console.error('插入文档失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 向量搜索
  async search(collectionName, vector, topK = 5) {
    try {
      const response = await this.axiosInstance.post(`/v1/collections/${collectionName}/search`, {
        vector: vector,
        topk: topK,
        output_fields: ['noteId', 'title', 'content'],
      });
      return response.data;
    } catch (error) {
      console.error('向量搜索失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = DashVectorClient;
