const axios = require('axios');

class DashScopeClient {
  constructor(apiKey, endpoint) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: `https://${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
  }

  // 文本向量化 - 使用正确的 API 格式
  async embedText(text) {
    try {
      const response = await this.axiosInstance.post('/compatible-mode/v1/embeddings', {
        model: 'text-embedding-v2',
        input: text,
        encoding_format: 'float'
      });

      if (response.data.data && response.data.data[0]) {
        return response.data.data[0].embedding;
      } else {
        throw new Error('向量化响应格式不正确');
      }
    } catch (error) {
      console.error('文本向量化失败:', error.response?.data || error.message);
      throw error;
    }
  }

  // 批量文本向量化
  async embedTexts(texts) {
    try {
      const response = await this.axiosInstance.post('/compatible-mode/v1/embeddings', {
        model: 'text-embedding-v2',
        input: texts,
        encoding_format: 'float'
      });

      if (response.data.data) {
        return response.data.data.map(item => item.embedding);
      } else {
        throw new Error('向量化响应格式不正确');
      }
    } catch (error) {
      console.error('批量文本向量化失败:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = DashScopeClient;
