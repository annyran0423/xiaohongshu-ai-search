// DashVector 服务 - 处理向量搜索
import { env } from '../config/env';
import { HttpClientFactory } from '../http';
import type {
  VectorSearchRequest,
  VectorSearchResponse,
  VectorSearchResultItem,
} from '../types/api';

export class DashVectorService {
  private readonly client: ReturnType<
    typeof HttpClientFactory.createDashVectorClient
  >;
  private readonly collectionName = 'xiaohongshu_notes';

  constructor() {
    if (!env.dashvector.apiKey || !env.dashvector.endpoint) {
      throw new Error(
        'DASHVECTOR_API_KEY and DASHVECTOR_ENDPOINT are required'
      );
    }

    // 使用HTTP客户端工厂创建实例
    this.client = HttpClientFactory.createDashVectorClient(
      env.dashvector.apiKey,
      env.dashvector.endpoint
    );
  }

  /**
   * 向量搜索
   */
  async search(
    vector: number[],
    topK: number = 5
  ): Promise<VectorSearchResultItem[]> {
    try {
      const request: VectorSearchRequest = {
        vector,
        topk: topK,
        include_vector: false,
        include_fields: true,
      };

      const response = await this.client.post<VectorSearchResponse>(
        `/v1/collections/${this.collectionName}/query`,
        request
      );

      if (response.data.code !== 0) {
        throw new Error(`搜索失败: ${response.data.message || '未知错误'}`);
      }

      return response.data.output || [];
    } catch (error: unknown) {
      console.error('DashVector 搜索失败:', error);
      if (error instanceof Error && error.message) {
        console.error('错误信息:', error.message);
      }
      throw new Error('向量搜索失败');
    }
  }

  /**
   * 检查服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 发送一个简单的查询来检查服务是否可用
      const testVector = Array(1536).fill(0.1); // 假设向量维度是1536
      await this.search(testVector, 1);
      return true;
    } catch (error) {
      console.error('DashVector 健康检查失败:', error);
      return false;
    }
  }

  /**
   * 重新创建 Collection（删除旧的，创建新的）
   */
  async recreateCollection(): Promise<boolean> {
    try {
      console.log(`🔄 重新创建 Collection: ${this.collectionName}`);

      // 先尝试删除现有 Collection
      await this.dropCollection().catch(() => {
        console.log('⚠️ 删除旧 Collection 失败，可能不存在');
      });

      // 然后创建新的 Collection
      return await this.initCollection();
    } catch (error: unknown) {
      console.error('重新创建 Collection 失败:', error);
      if (error instanceof Error && error.message) {
        console.error('错误信息:', error.message);
      }
      return false;
    }
  }

  /**
   * 初始化 Collection
   */
  async initCollection(): Promise<boolean> {
    try {
      console.log(`🏗️ 尝试创建 Collection: ${this.collectionName}`);

      // 创建 collection 的请求体
      const createRequest = {
        name: this.collectionName,
        dimension: 1536, // text-embedding-v2 的维度
        metric: 'cosine', // 相似度度量
        fields_schema: {
          title: 'string',
          content: 'string',
          noteId: 'string',
          url: 'string',
        },
      };

      const response = await this.client.post('/v1/collections', createRequest);

      if (response.data.code === 0) {
        console.log(`✅ Collection "${this.collectionName}" 创建成功`);
        return true;
      } else if (response.data.code === 1003) {
        // Collection 已存在
        console.log(`⚠️ Collection "${this.collectionName}" 已存在`);
        return true;
      } else {
        throw new Error(`创建 Collection 失败: ${response.data.message}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.message) {
        console.error('初始化 Collection 失败:', error.message);
      }

      // 检查是否是Axios错误
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const axiosError = error as any; // 临时使用any处理axios类型
        if (axiosError.response?.data?.code === 1003) {
          console.log(`⚠️ Collection "${this.collectionName}" 已存在`);
          return true;
        }
        if (axiosError.response) {
          console.error('API响应:', axiosError.response.data);
        }
      }

      throw new Error('Collection 初始化失败');
    }
  }

  /**
   * 获取 Collection 信息
   */
  async describeCollection(): Promise<any> {
    try {
      const response = await this.client.get(
        `/v1/collections/${this.collectionName}`
      );

      if (response.data.code === 0) {
        return response.data.output;
      } else {
        throw new Error(`获取 Collection 信息失败: ${response.data.message}`);
      }
    } catch (error: unknown) {
      console.error('获取 Collection 信息失败:', error);
      if (error instanceof Error && error.message) {
        console.error('错误信息:', error.message);
      }
      return null;
    }
  }

  /**
   * 删除 Collection
   */
  async dropCollection(): Promise<boolean> {
    try {
      const response = await this.client.delete(
        `/v1/collections/${this.collectionName}`
      );

      if (response.data.code === 0) {
        console.log(`🗑️ Collection "${this.collectionName}" 删除成功`);
        return true;
      } else {
        throw new Error(`删除 Collection 失败: ${response.data.message}`);
      }
    } catch (error: unknown) {
      console.error('删除 Collection 失败:', error);
      if (error instanceof Error && error.message) {
        console.error('错误信息:', error.message);
      }
      return false;
    }
  }
}
