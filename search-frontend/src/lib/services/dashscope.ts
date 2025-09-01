// DashScope 服务 - 处理文本向量化
import { env } from '../config/env';
import { HttpClientFactory } from '../http';
import type { EmbeddingRequest, EmbeddingResponse } from '../types/api';

// 对应文档：https://help.aliyun.com/zh/model-studio/use-qwen-by-calling-api
export class DashScopeService {
  private readonly client: ReturnType<
    typeof HttpClientFactory.createDashScopeClient
  >;

  constructor() {
    if (!env.dashscope.apiKey || !env.dashscope.endpoint) {
      throw new Error('DASHSCOPE_API_KEY and DASHSCOPE_ENDPOINT are required');
    }

    // 使用HTTP客户端工厂创建实例
    this.client = HttpClientFactory.createDashScopeClient(
      env.dashscope.apiKey,
      env.dashscope.endpoint
    );
  }

  /**
   * 将文本转换为向量
   */
  async embedText(text: string): Promise<number[]> {
    try {
      const request: EmbeddingRequest = {
        model: 'text-embedding-v2',
        input: text,
        encoding_format: 'float',
      };

      const response = await this.client.post<EmbeddingResponse>(
        '/compatible-mode/v1/embeddings',
        request
      );

      if (!response.data?.data?.[0]?.embedding) {
        throw new Error('向量化响应格式错误');
      }

      return response.data.data[0].embedding;
    } catch (error: unknown) {
      console.error('DashScope 向量化失败:', error);
      if (error instanceof Error && error.message) {
        console.error('错误信息:', error.message);
      }
      throw new Error('文本向量化失败');
    }
  }

  /**
   * 批量向量化文本
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    const vectors: number[][] = [];

    for (const text of texts) {
      const vector = await this.embedText(text);
      vectors.push(vector);
    }

    return vectors;
  }
}
