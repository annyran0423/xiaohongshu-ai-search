// 搜索处理器 - 继承自基础处理器
import { SearchService } from '../services/search';
import {
  ApiContext,
  SearchRequest,
  SearchResponse,
  ValidationError,
  ValidationSchema,
} from '../types/api';
import { BaseApiHandler } from './base';

export class SearchApiHandler extends BaseApiHandler<
  SearchRequest,
  SearchResponse
> {
  private searchService: SearchService;

  constructor() {
    super({
      validateEnv: true,
      enableLogging: true,
      timeout: 30000,
    });

    this.searchService = new SearchService();
  }

  // 实现具体的业务逻辑
  protected async process(
    context: ApiContext,
    data: SearchRequest
  ): Promise<SearchResponse> {
    // 参数验证
    this.validateSearchParams(data);

    // 判断是否需要AI总结
    if (data.withSummary) {
      console.log('🔄 执行带AI总结的搜索...');

      // 执行带总结的搜索
      const summaryResult = await this.searchService.semanticSearchWithSummary({
        query: data.query,
        topK: data.topK || 5,
        customPrompt: data.customPrompt,
        summaryOptions: data.summaryOptions,
      });

      // 返回带总结的响应
      return {
        success: true,
        query: data.query,
        totalResults: summaryResult.totalResults,
        results: summaryResult.searchResults,
        summary: summaryResult.summary,
      };
    } else {
      // 执行普通搜索
      console.log('🔄 执行普通语义搜索...');
      const results = await this.searchService.semanticSearch(
        data.query,
        data.topK
      );

      // 返回普通响应
      return {
        success: true,
        query: data.query,
        totalResults: results.length,
        results,
      };
    }
  }

  // 搜索参数验证
  private validateSearchParams(data: SearchRequest): void {
    const schema: ValidationSchema = {
      query: {
        required: true,
        type: 'string',
        min: 1,
        max: 500,
      },
      // topK: {
      //   required: false,
      //   type: 'number',
      //   min: 1,
      //   max: 100, // 增加topK上限到100
      // },
      withSummary: {
        required: false,
        type: 'boolean',
      },
      customPrompt: {
        required: false,
        type: 'string',
        max: 2000,
      },
    };

    this.validateParams(data as unknown as Record<string, unknown>, schema);

    // 额外的业务验证
    if (data.query.trim().length === 0) {
      throw new ValidationError('查询内容不能为空');
    }

    if (data.query.length > 500) {
      throw new ValidationError('查询内容不能超过500个字符');
    }

    if (data.customPrompt && data.customPrompt.length > 2000) {
      throw new ValidationError('自定义提示词不能超过2000个字符');
    }
  }

  // 重写后处理钩子
  protected async afterHandle(
    context: ApiContext,
    result: SearchResponse
  ): Promise<void> {
    if (this.config.enableLogging) {
      console.log(`[${context.requestId}] 搜索完成:`, {
        query: result.query,
        resultsCount: result.totalResults,
      });
    }
  }
}
