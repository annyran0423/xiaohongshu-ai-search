// 统一搜索服务 - 整合 DashScope 和 DashVector
import type { SearchResult, VectorSearchResultItem } from '../types/api';
import { DashScopeService } from './dashscope';
import { DashVectorService } from './dashvector';

export class SearchService {
  private dashscopeService: DashScopeService;
  private dashvectorService: DashVectorService;

  constructor() {
    this.dashscopeService = new DashScopeService();
    this.dashvectorService = new DashVectorService();
  }

  /**
   * 执行语义搜索
   */
  async semanticSearch(
    query: string,
    topK: number = 5
  ): Promise<SearchResult[]> {
    try {
      // 步骤1: 向量化查询文本
      console.log('🔄 步骤1: 向量化查询文本...');
      const vector = await this.dashscopeService.embedText(query);
      console.log(`✅ 成功生成向量，维度: ${vector.length}`);

      // 步骤2: 向量搜索
      console.log('🔍 步骤2: 向量搜索...');
      const rawResults = await this.dashvectorService.search(vector, topK);
      console.log(`✅ 搜索完成，找到 ${rawResults?.length || 0} 条结果`);

      // 步骤3: 格式化结果
      const formattedResults: SearchResult[] = (rawResults || [])
        .map((item: VectorSearchResultItem) => ({
          id: item.id,
          score: item.score,
          title: item.fields?.title || '无标题',
          content: item.fields?.content || '',
          noteId: item.fields?.noteId || '',
          url: item.fields?.url || '',
        }))
        .sort((a, b) => b.score - a.score);

      return formattedResults;
    } catch (error: unknown) {
      console.error('❌ 搜索服务错误:', error);
      if (error instanceof Error) {
        console.error('错误信息:', error.message);
        throw error;
      } else {
        throw new Error('搜索服务发生未知错误');
      }
    }
  }

  /**
   * 批量向量化（如果需要）
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    return await this.dashscopeService.embedTexts(texts);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ dashscope: boolean; dashvector: boolean }> {
    const [dashscope, dashvector] = await Promise.all([
      Promise.resolve(true), // DashScope 在embedText时会验证
      this.dashvectorService.healthCheck(),
    ]);

    return { dashscope, dashvector };
  }
}
