/**
 * 自动化关键词扩展器
 * 基于语义相似度和统计学习的方法
 */

export interface KeywordExpansionResult {
  original: string;
  expanded: string[];
  confidence: number;
  source: 'manual' | 'semantic' | 'statistical' | 'llm';
}

export class AutoKeywordExpander {
  // 手动配置的基础扩展词典
  private manualExpansions: { [key: string]: string[] } = {
    拍照: ['摄影', '机位', '拍摄', '照相', '角度', '景点', '美景', '风景'],
    摄影: ['拍照', '机位', '拍摄', '镜头', '角度', '照片', '相片'],
    美食: ['餐厅', '吃', '美食', '探店', '必吃', '推荐', '美食攻略'],
    攻略: ['指南', '路线', '行程', '玩法', '推荐', '经验', '攻略'],
    旅游: ['旅行', '游览', '景点', '路线', '攻略', '玩法'],
    悉尼: ['Sydney', '雪梨', '澳洲', '澳大利亚', '新南威尔士'],
  };

  // 学习到的扩展模式
  private learnedPatterns: Map<string, Map<string, number>> = new Map();

  // 用户搜索历史
  private searchHistory: Array<{ query: string; results: string[] }> = [];

  constructor() {
    this.initializeLearnedPatterns();
  }

  /**
   * 初始化学习到的模式
   */
  private initializeLearnedPatterns() {
    // 从历史数据中学习到的模式
    // 这里可以从数据库或配置文件加载
  }

  /**
   * 扩展关键词 - 组合多种方法
   */
  async expandKeyword(query: string): Promise<KeywordExpansionResult> {
    const allExpansions = new Set<string>();
    let totalConfidence = 0;
    const sources: string[] = [];

    // 1. 手动配置扩展
    const manualResult = this.expandByManual(query);
    if (manualResult.expanded.length > 0) {
      manualResult.expanded.forEach((word) => allExpansions.add(word));
      totalConfidence += manualResult.confidence;
      sources.push('manual');
    }

    // 2. 基于词根的扩展
    const morphologicalResult = this.expandByMorphology(query);
    if (morphologicalResult.expanded.length > 0) {
      morphologicalResult.expanded.forEach((word) => allExpansions.add(word));
      totalConfidence += morphologicalResult.confidence * 0.8;
      sources.push('morphological');
    }

    // 3. 统计学习的扩展
    const statisticalResult = this.expandByStatistics(query);
    if (statisticalResult.expanded.length > 0) {
      statisticalResult.expanded.forEach((word) => allExpansions.add(word));
      totalConfidence += statisticalResult.confidence * 0.6;
      sources.push('statistical');
    }

    // 4. 语义扩展（模拟）
    const semanticResult = await this.expandBySemantics(query);
    if (semanticResult.expanded.length > 0) {
      semanticResult.expanded.forEach((word) => allExpansions.add(word));
      totalConfidence += semanticResult.confidence * 0.7;
      sources.push('semantic');
    }

    return {
      original: query,
      expanded: Array.from(allExpansions),
      confidence: Math.min(totalConfidence / sources.length, 1.0),
      source: (sources[0] as any) || 'manual',
    };
  }

  /**
   * 手动配置扩展
   */
  private expandByManual(query: string): KeywordExpansionResult {
    const words = query.split(/\s+/);
    const expansions = new Set<string>();

    words.forEach((word) => {
      if (this.manualExpansions[word]) {
        this.manualExpansions[word].forEach((expanded) =>
          expansions.add(expanded)
        );
      }
    });

    return {
      original: query,
      expanded: Array.from(expansions),
      confidence: 1.0, // 手动配置的置信度最高
      source: 'manual',
    };
  }

  /**
   * 基于词根的形态学扩展
   */
  private expandByMorphology(query: string): KeywordExpansionResult {
    const expansions = new Set<string>();

    // 中文词根扩展规则
    const morphologyRules = [
      { pattern: /攻略$/, replacements: ['指南', '路线', '玩法'] },
      { pattern: /摄影$/, replacements: ['拍照', '拍摄', '摄像'] },
      { pattern: /美食$/, replacements: ['餐厅', '小吃', '饮食'] },
      { pattern: /^(.+)攻略$/, replacements: ['$1指南', '$1路线', '$1玩法'] },
    ];

    morphologyRules.forEach((rule) => {
      if (rule.pattern.test(query)) {
        rule.replacements.forEach((replacement) => {
          const expanded = query.replace(rule.pattern, replacement);
          if (expanded !== query) {
            expansions.add(expanded);
          }
        });
      }
    });

    return {
      original: query,
      expanded: Array.from(expansions),
      confidence: 0.8,
      source: 'morphological',
    };
  }

  /**
   * 基于统计学习的扩展
   */
  private expandByStatistics(query: string): KeywordExpansionResult {
    const expansions = new Set<string>();

    // 从学习到的模式中获取扩展词
    const patterns = this.learnedPatterns.get(query);
    if (patterns) {
      // 按频率排序，取前5个
      const sortedPatterns = Array.from(patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      sortedPatterns.forEach(([word, frequency]) => {
        if (frequency > 2) {
          // 出现次数大于2的才算作扩展
          expansions.add(word);
        }
      });
    }

    return {
      original: query,
      expanded: Array.from(expansions),
      confidence: patterns ? 0.7 : 0.3,
      source: 'statistical',
    };
  }

  /**
   * 基于语义相似度的扩展（模拟实现）
   */
  private async expandBySemantics(
    query: string
  ): Promise<KeywordExpansionResult> {
    // 这里模拟语义扩展，实际实现需要词向量模型
    const semanticMap: { [key: string]: string[] } = {
      拍照: ['拍摄', '记录', '捕捉', '留下', '定格'],
      美食: ['食物', '菜肴', '饮食', '烹饪', '品尝'],
      旅游: ['出行', '旅行', '游览', '度假', '探索'],
      攻略: ['指南', '经验', '建议', '方法', '技巧'],
    };

    const expansions = semanticMap[query] || [];

    return {
      original: query,
      expanded: expansions,
      confidence: 0.6, // 语义扩展的置信度中等
      source: 'semantic',
    };
  }

  /**
   * 学习用户搜索模式
   */
  learnFromSearch(query: string, clickedResults: string[]) {
    // 从用户点击行为中学习相关性
    if (!this.learnedPatterns.has(query)) {
      this.learnedPatterns.set(query, new Map());
    }

    const patterns = this.learnedPatterns.get(query)!;
    clickedResults.forEach((result) => {
      // 提取结果中的关键词
      const keywords = this.extractKeywords(result);
      keywords.forEach((keyword) => {
        const currentCount = patterns.get(keyword) || 0;
        patterns.set(keyword, currentCount + 1);
      });
    });

    // 记录搜索历史
    this.searchHistory.push({ query, results: clickedResults });

    // 限制历史记录大小
    if (this.searchHistory.length > 1000) {
      this.searchHistory = this.searchHistory.slice(-500);
    }
  }

  /**
   * 从文本中提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简单的关键词提取逻辑
    const words = text.split(/[^\u4e00-\u9fa5a-zA-Z]+/);
    return words.filter(
      (word) =>
        word.length >= 2 &&
        ![
          '的',
          '了',
          '和',
          '是',
          '在',
          '有',
          '这',
          '那',
          '一个',
          '一些',
        ].includes(word)
    );
  }

  /**
   * 获取扩展统计信息
   */
  getStatistics() {
    return {
      manualExpansions: Object.keys(this.manualExpansions).length,
      learnedPatterns: this.learnedPatterns.size,
      searchHistorySize: this.searchHistory.length,
      totalLearnedWords: Array.from(this.learnedPatterns.values()).reduce(
        (sum, patterns) => sum + patterns.size,
        0
      ),
    };
  }

  /**
   * 保存学习到的模式
   */
  saveLearnedPatterns(): string {
    const data = {
      learnedPatterns: Array.from(this.learnedPatterns.entries()).map(
        ([query, patterns]) => ({
          query,
          patterns: Array.from(patterns.entries()),
        })
      ),
      searchHistory: this.searchHistory,
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * 加载学习到的模式
   */
  loadLearnedPatterns(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);

      // 恢复学习到的模式
      this.learnedPatterns.clear();
      data.learnedPatterns.forEach(({ query, patterns }: any) => {
        const patternMap = new Map(patterns);
        this.learnedPatterns.set(query, patternMap);
      });

      // 恢复搜索历史
      this.searchHistory = data.searchHistory || [];
    } catch (error) {
      console.error('加载学习模式失败:', error);
    }
  }
}

// 使用示例
export async function demonstrateAutoExpansion() {
  const expander = new AutoKeywordExpander();

  const queries = ['拍照', '美食攻略', '悉尼旅游'];

  console.log('🤖 自动化关键词扩展演示');
  console.log('='.repeat(50));

  for (const query of queries) {
    console.log(`\n🔍 查询: "${query}"`);

    const result = await expander.expandKeyword(query);

    console.log(`📊 扩展结果 (${result.source}):`);
    result.expanded.forEach((word) => console.log(`  • ${word}`));
    console.log(`🎯 置信度: ${(result.confidence * 100).toFixed(1)}%`);
  }

  // 模拟学习过程
  console.log('\n🧠 学习过程演示:');
  expander.learnFromSearch('拍照', [
    '悉尼拍照机位',
    '悉尼摄影攻略',
    '拍照技巧分享',
  ]);
  expander.learnFromSearch('拍照', [
    '悉尼拍照机位',
    '拍照角度选择',
    '摄影设备推荐',
  ]);

  const newResult = await expander.expandKeyword('拍照');
  console.log(`\n📈 学习后的扩展结果:`);
  newResult.expanded.forEach((word) => console.log(`  • ${word}`));

  console.log('\n📊 统计信息:', expander.getStatistics());
}
