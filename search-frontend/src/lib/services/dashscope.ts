// DashScope 服务 - 处理文本向量化和内容生成
import { env } from '../config/env';
import { KeywordManager } from '../config/keywords';
import { HttpClientFactory } from '../http';
import type { EmbeddingRequest, EmbeddingResponse } from '../types/api';

// 通义千问文本生成相关类型
export interface TextGenerationRequest {
  model: string;
  input: {
    messages: Array<{
      role: 'system' | 'user' | 'assistant';
      content: string;
    }>;
  };
  parameters?: {
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    seed?: number;
    repetition_penalty?: number;
    stop?: string[];
  };
}

export interface TextGenerationResponse {
  output: {
    text: string;
    finish_reason: string;
  };
  usage: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    prompt_tokens_details?: {
      cached_tokens: number;
    };
  };
  request_id: string;
}

// 对应文档：https://help.aliyun.com/zh/model-studio/use-qwen-by-calling-api
export class DashScopeService {
  /**
   * 简化的关键词扩展（用于内容评估）
   */
  private expandQueryKeywords(query: string): string[] {
    // 使用统一的关键词管理器
    return KeywordManager.expandKeywords(query);
  }
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

  /**
   * 文本生成 - 用于内容总结和概括
   */
  async generateText(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    model: string = 'qwen-turbo',
    options?: {
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
    }
  ): Promise<string> {
    try {
      const request: TextGenerationRequest = {
        model,
        input: {
          messages,
        },
        parameters: {
          max_tokens: options?.max_tokens || 1500,
          temperature: options?.temperature || 0.3,
          top_p: options?.top_p || 0.8,
        },
      };

      const response = await this.client.post<TextGenerationResponse>(
        '/api/v1/services/aigc/text-generation/generation',
        request
      );

      if (!response.data?.output?.text) {
        throw new Error('文本生成响应格式错误');
      }

      return response.data.output.text;
    } catch (error: unknown) {
      console.error('DashScope 文本生成失败:', error);
      if (error instanceof Error && error.message) {
        console.error('错误信息:', error.message);
      }
      throw new Error('文本生成失败');
    }
  }

  /**
   * 基于搜索结果进行内容总结
   */
  /**
   * 评估内容与关键词的相关性（优化版）
   */
  private assessRelevance(content: string, query: string): number {
    if (!query) return 1;

    const keywords = query
      .toLowerCase()
      .split(/[\s,，]+/)
      .filter((word) => word.length > 1);
    const contentLower = content.toLowerCase();

    let score = 0;
    let matchCount = 0;

    // 1. 核心关键词匹配（最高权重）
    keywords.forEach((keyword) => {
      if (contentLower.includes(keyword)) {
        matchCount++;
        // 根据关键词重要性调整权重
        if (keyword.length > 2) {
          score += 4; // 长关键词权重更高
        } else {
          score += 3; // 短关键词基础权重
        }
      }
    });

    // 1.5 主题一致性检查 - 防止主题冲突
    const themeConflict = KeywordManager.detectThemeConflict(query, content);

    // 如果发现主题冲突，严重降低分数
    if (themeConflict.hasConflict) {
      console.log(
        `⚠️ 发现主题冲突: "${
          themeConflict.queryTheme
        }" 搜索中出现 "${themeConflict.conflictingThemes.join(
          ','
        )}" 相关内容，降低相关性评分`
      );
      score *= 0.2; // 严重惩罚主题冲突的内容
    }

    // 2. 扩展关键词匹配（中等权重）
    const expandedKeywords = this.expandQueryKeywords(query);
    expandedKeywords.forEach((keyword) => {
      if (contentLower.includes(keyword.toLowerCase())) {
        score += 1.5; // 扩展词匹配权重
      }
    });

    // 3. 内容密度评估
    const contentWords = content.split(/[\s,，]+/);
    const totalMatches = contentWords.filter((word) =>
      keywords.some((keyword) => word.toLowerCase().includes(keyword))
    ).length;

    if (totalMatches > 0) {
      score += totalMatches * 0.3; // 内容中关键词密度加分
    }

    // 4. 质量惩罚因子
    let qualityMultiplier = 1.0;

    // 内容太短的惩罚
    if (content.length < 50) {
      qualityMultiplier *= 0.3;
    } else if (content.length < 100) {
      qualityMultiplier *= 0.7;
    }

    // 没有关键词匹配的严重惩罚
    if (matchCount === 0) {
      qualityMultiplier *= 0.1;
    }

    // 匹配关键词太少的惩罚
    if (matchCount < keywords.length * 0.5) {
      qualityMultiplier *= 0.8;
    }

    return score * qualityMultiplier;
  }

  async summarizeSearchResults(
    searchResults: Array<{ title: string; content: string; url: string }>,
    customPrompt?: string,
    options?: {
      max_tokens?: number;
      temperature?: number;
      model?: string;
      query?: string; // 添加query参数用于相关性评估
    }
  ): Promise<string> {
    try {
      // 获取查询关键词
      const query = options?.query || '';

      // 1. 预过滤：评估相关性并排序
      const scoredResults = searchResults
        .map((result) => ({
          ...result,
          relevanceScore: this.assessRelevance(
            result.title + ' ' + result.content,
            query
          ),
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

      // 只保留高相关性的结果（相关性评分 >= 2.0，避免不相关内容）
      let relevantResults = scoredResults.filter(
        (result) => result.relevanceScore >= 2.0
      );

      // 如果过滤后结果太少，至少保留前3个（确保有内容可分析）
      if (relevantResults.length === 0 && scoredResults.length > 0) {
        relevantResults = scoredResults.slice(
          0,
          Math.min(3, scoredResults.length)
        );
        console.log('⚠️ 没有找到高相关性内容，使用前3个结果进行分析');
      }

      // 如果仍然没有结果，说明数据质量问题
      if (relevantResults.length === 0) {
        return `根据您的搜索关键词"${query}"，目前没有找到足够相关的内容建议。建议尝试其他相关关键词或查看更多搜索结果。`;
      }

      // 2. 构建搜索结果的文本内容
      const searchContent = relevantResults
        .map((result, index) => {
          return `【${index + 1}】标题：${
            result.title
          }\n内容：${result.content.substring(0, 500)}${
            result.content.length > 500 ? '...' : ''
          }\n链接：${result.url}\n相关性评分：${result.relevanceScore.toFixed(
            1
          )}`;
        })
        .join('\n---\n\n');

      // 优化的总结提示词 - 实用建议优先，结构化输出
      const defaultPrompt = `🎯 搜索关键词：${query}

请基于以上关键词，严格分析以下搜索结果中的高度相关内容：

重要提示：
- 如果关键词是"买手店"，只分析与购物、精品店、时尚品牌相关的实用攻略
- 如果关键词是"美食"，只分析与餐厅、菜品、饮食相关的实用攻略
- 如果关键词是"咖啡"，只分析与咖啡馆、咖啡文化相关的实用攻略
- 严格排除主题不符的内容（如在买手店搜索中排除餐厅信息）

## 📋 输出要求

**请按以下结构输出（实用建议在前，具体内容在后）：**

### 🔍 实用建议总结
- 直接给出最核心的实用建议和攻略要点
- 突出能立即使用的信息
- 按优先级排序（最重要的放前面）

### 📝 核心攻略内容
- 详细列出具体的攻略信息
- 包含地点、时间、费用等实用信息
- 重点标注用户评价和注意事项

### 💡 经验分享
- 用户的真实体验和建议
- 避坑指南和注意事项
- 个性化推荐

⚠️ **重要原则**：
- **严格筛选**：只分析与"${query}"高度相关的内容，忽略不相关主题
- **实用优先**：优先选择具体可操作的实用攻略
- **质量控制**：如果大部分内容不相关，请明确指出并给出替代建议

搜索结果：
${searchContent}

请用markdown格式输出，确保实用建议放在最前面！
⚠️ 注意：请直接输出markdown内容，不要使用代码块包裹markdown内容。`;

      const systemPrompt = customPrompt || defaultPrompt;

      const messages = [
        {
          role: 'system' as const,
          content:
            '你是一个专业的内容分析助手，擅长对搜索结果进行总结和归纳。请提供清晰、准确、有价值的分析。',
        },
        {
          role: 'user' as const,
          content: systemPrompt,
        },
      ];

      return await this.generateText(messages, options?.model || 'qwen-turbo', {
        max_tokens: options?.max_tokens || 2000,
        temperature: options?.temperature || 0.3,
      });
    } catch (error: unknown) {
      console.error('搜索结果总结失败:', error);
      if (error instanceof Error && error.message) {
        console.error('错误信息:', error.message);
      }
      throw new Error('搜索结果总结失败');
    }
  }
}
