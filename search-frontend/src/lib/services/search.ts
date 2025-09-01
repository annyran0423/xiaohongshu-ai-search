// 统一搜索服务 - 整合 DashScope 和 DashVector
import { KeywordManager } from '../config/keywords';
import type { SearchResult, VectorSearchResultItem } from '../types/api';
import { DashScopeService } from './dashscope';
import { DashVectorService } from './dashvector';

// 搜索结果总结相关的类型
export interface SearchWithSummaryRequest {
  query: string;
  topK?: number;
  customPrompt?: string;
  summaryOptions?: {
    max_tokens?: number;
    temperature?: number;
    model?: string;
  };
}

export interface SearchWithSummaryResult {
  searchResults: SearchResult[];
  summary: string;
  query: string;
  totalResults: number;
}

export class SearchService {
  private dashscopeService: DashScopeService;
  private dashvectorService: DashVectorService;

  constructor() {
    this.dashscopeService = new DashScopeService();
    this.dashvectorService = new DashVectorService();
  }

  /**
   * 关键词扩展 - 将用户查询扩展为相关关键词
   */
  private expandQueryKeywords(query: string): string[] {
    // 使用统一的关键词管理器
    return KeywordManager.expandKeywords(query);
  }

  /**
   * 混合搜索 - 结合向量搜索和关键词匹配
   */
  private async hybridSearch(
    query: string,
    vector: number[],
    topK: number
  ): Promise<SearchResult[]> {
    try {
      // 1. 向量搜索获取候选结果（扩大搜索范围）
      const rawResults = await this.dashvectorService.search(
        vector,
        Math.max(topK * 3, 20)
      );

      // 2. 关键词扩展
      const expandedKeywords = this.expandQueryKeywords(query);
      console.log(`🔍 扩展关键词: ${expandedKeywords.join(', ')}`);

      // 3. 计算混合分数
      const scoredResults = (rawResults || []).map(
        (item: VectorSearchResultItem) => {
          let hybridScore = item.score || 0;
          const title = (item.fields?.title || '').toLowerCase();
          const content = (item.fields?.content || '').toLowerCase();

          // 关键词匹配加分
          expandedKeywords.forEach((keyword) => {
            const keywordLower = keyword.toLowerCase();

            // 标题匹配权重最高
            if (title.includes(keywordLower)) {
              hybridScore += 0.3;
            }

            // 内容匹配权重中等
            if (content.includes(keywordLower)) {
              hybridScore += 0.1;
            }
          });

          return {
            id: item.id,
            score: hybridScore,
            title: item.fields?.title || '无标题',
            content: item.fields?.content || '',
            noteId: item.fields?.noteId || '',
            url: item.fields?.url || '',
            vectorScore: item.score || 0, // 保存原始向量分数用于调试
          };
        }
      );

      // 4. 按混合分数排序并返回前topK个
      const finalResults = scoredResults
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      console.log(`🎯 混合搜索完成: 向量分数 + 关键词匹配`);
      return finalResults;
    } catch (error) {
      console.error('混合搜索失败，回退到纯向量搜索:', error);
      // 回退到纯向量搜索
      const rawResults = await this.dashvectorService.search(vector, topK);
      return (rawResults || []).map((item: VectorSearchResultItem) => ({
        id: item.id,
        score: item.score,
        title: item.fields?.title || '无标题',
        content: item.fields?.content || '',
        noteId: item.fields?.noteId || '',
        url: item.fields?.url || '',
      }));
    }
  }

  /**
   * 执行语义搜索
   */
  async semanticSearch(
    query: string,
    topK: number = 20
  ): Promise<SearchResult[]> {
    try {
      // 步骤1: 向量化查询文本
      console.log('🔄 步骤1: 向量化查询文本...');
      const vector = await this.dashscopeService.embedText(query);
      console.log(`✅ 成功生成向量，维度: ${vector.length}`);

      // 步骤2: 混合搜索（向量+关键词）
      console.log('🔍 步骤2: 混合搜索（向量+关键词）...');
      const searchResults = await this.hybridSearch(query, vector, topK);
      console.log(`✅ 搜索完成，找到 ${searchResults?.length || 0} 条结果`);

      return searchResults;
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
   * 执行语义搜索并生成内容总结
   */
  async semanticSearchWithSummary(
    request: SearchWithSummaryRequest
  ): Promise<SearchWithSummaryResult> {
    try {
      const { query, topK = 5, customPrompt, summaryOptions } = request;

      // 步骤1: 向量化查询文本（直接使用向量搜索逻辑）
      console.log('🔄 步骤1: 向量化查询文本...');
      const vector = await this.dashscopeService.embedText(query);
      console.log(`✅ 成功生成向量，维度: ${vector.length}`);

      // 步骤2: 向量搜索
      console.log('🔍 步骤2: 向量搜索...');
      const rawResults = await this.dashvectorService.search(vector, topK);
      console.log(`✅ 搜索完成，找到 ${rawResults?.length || 0} 条结果`);

      // 步骤3: 格式化搜索结果
      console.log('🔄 步骤3: 格式化搜索结果...');
      const searchResults: SearchResult[] = (rawResults || [])
        .map((item: VectorSearchResultItem) => ({
          id: item.id,
          score: item.score,
          title: item.fields?.title || '无标题',
          content: item.fields?.content || '',
          noteId: item.fields?.noteId || '',
          url: item.fields?.url || '',
        }))
        .sort((a, b) => b.score - a.score);

      // 步骤4: 基于搜索结果生成总结
      console.log('🔄 步骤4: 生成内容总结...');
      const summaryResults = searchResults.map((result) => ({
        title: result.title,
        content: result.content,
        url: result.url || '',
      }));

      const summary = await this.dashscopeService.summarizeSearchResults(
        summaryResults,
        customPrompt,
        {
          ...summaryOptions,
          query: query, // 传递查询关键词用于相关性评估
        }
      );

      console.log('✅ 搜索和总结完成');

      return {
        searchResults,
        summary,
        query,
        totalResults: searchResults.length,
      };
    } catch (error: unknown) {
      console.error('❌ 搜索和总结服务错误:', error);
      if (error instanceof Error) {
        console.error('错误信息:', error.message);
        throw error;
      } else {
        throw new Error('搜索和总结服务发生未知错误');
      }
    }
  }

  /**
   * 仅生成搜索结果的总结（不重新搜索）
   */
  async summarizeSearchResults(
    searchResults: SearchResult[],
    customPrompt?: string,
    summaryOptions?: {
      max_tokens?: number;
      temperature?: number;
      model?: string;
      query?: string; // 添加query参数
    }
  ): Promise<string> {
    try {
      const summaryResults = searchResults.map((result) => ({
        title: result.title,
        content: result.content,
        url: result.url || '',
      }));

      return await this.dashscopeService.summarizeSearchResults(
        summaryResults,
        customPrompt,
        {
          ...summaryOptions,
          query: summaryOptions?.query, // 传递query参数
        }
      );
    } catch (error: unknown) {
      console.error('❌ 总结服务错误:', error);
      if (error instanceof Error) {
        console.error('错误信息:', error.message);
        throw error;
      } else {
        throw new Error('总结服务发生未知错误');
      }
    }
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
