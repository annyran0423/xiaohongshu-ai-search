const axios = require('axios');

class DashScopeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.axiosInstance = axios.create({
      baseURL: 'https://dashscope.aliyuncs.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    });
  }

  // 文本向量化
  async embedText(text) {
    try {
      const response = await this.axiosInstance.post('/api/v1/services/embeddings/text-embedding/text-embedding', {
        model: 'text-embedding-v1',
        input: {
          texts: [text],
        },
      });
      
      if (response.data.output && response.data.output.embeddings) {
        return response.data.output.embeddings[0].embedding;
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
      const response = await this.axiosInstance.post('/api/v1/services/embeddings/text-embedding/text-embedding', {
        model: 'text-embedding-v1',
        input: {
          texts: texts,
        },
      });
      
      if (response.data.output && response.data.output.embeddings) {
        return response.data.output.embeddings.map(item => item.embedding);
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
