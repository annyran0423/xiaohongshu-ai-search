// 统一关键词配置管理
// 所有关键词扩展和主题冲突检测都从这里获取

export interface KeywordConfig {
  expansions: Record<string, string[]>;
  themes: Record<string, string[]>;
}

/**
 * 关键词扩展配置
 * 用于扩展用户搜索关键词，提高搜索覆盖率
 */
export const KEYWORD_EXPANSIONS: Record<string, string[]> = {
  拍照: ['摄影', '机位', '拍摄', '照相', '角度', '景点', '美景', '风景'],
  摄影: ['拍照', '机位', '拍摄', '镜头', '角度', '照片', '相片'],

  美食: ['餐厅', '吃', '美食', '探店', '必吃', '推荐', '美食攻略'],

  攻略: ['指南', '路线', '行程', '玩法', '推荐', '经验', '攻略'],
  旅游: ['旅行', '游览', '景点', '路线', '攻略', '玩法'],

  悉尼: ['Sydney', '雪梨', '澳洲', '澳大利亚', '新南威尔士'],

  买手店: [
    '精品店',
    '购物',
    '时尚',
    '品牌',
    '选品',
    '设计师',
    '独立设计师',
    '时尚买手',
    '概念店',
    '潮流',
  ],
  购物: ['买手店', '精品店', '商场', '品牌店', '消费', '采购', '选购'],
  时尚: ['买手店', '精品店', '潮流', '品牌', '设计师', '时装', '穿搭'],

  咖啡: ['咖啡馆', '咖啡店', '咖啡厅', '咖啡师', '手冲', '精品咖啡', '拉花'],
  咖啡店: [
    '咖啡馆',
    '咖啡厅',
    '咖啡师',
    '手冲咖啡',
    '精品咖啡',
    '拉花',
    '咖啡豆',
    '烘焙',
  ],
};

/**
 * 主题关键词配置
 * 用于检测内容主题冲突，确保搜索结果的相关性
 */
export const THEME_KEYWORDS: Record<string, string[]> = {
  买手店: [
    '精品店',
    '购物',
    '时尚',
    '品牌',
    '选品',
    '设计师',
    '时装',
    '穿搭',
    '潮流',
  ],
  购物: ['商场', '品牌店', '消费', '采购', '选购', '折扣', '促销'],

  美食: ['餐厅', '吃饭', '菜品', '口味', '厨师', '菜单', '食材'],

  咖啡: [
    '咖啡馆',
    '咖啡店',
    '咖啡厅',
    '拉花',
    '手冲',
    '豆子',
    '烘焙',
    '咖啡师',
    '精品咖啡',
    '咖啡豆',
  ],

  拍照: ['摄影', '机位', '角度', '镜头', '光线', '构图', '拍摄'],
  摄影: ['拍照', '机位', '拍摄', '镜头', '角度', '照片', '相片'],

  旅游: ['旅行', '游览', '景点', '路线', '攻略', '玩法'],
  攻略: ['指南', '路线', '行程', '玩法', '推荐', '经验'],
};

/**
 * 关键词工具类
 */
export class KeywordManager {
  /**
   * 获取关键词扩展
   */
  static expandKeywords(query: string): string[] {
    const expandedKeywords = new Set([query]);

    // 为每个关键词添加扩展
    query.split(/\s+/).forEach((word) => {
      if (KEYWORD_EXPANSIONS[word]) {
        KEYWORD_EXPANSIONS[word].forEach((expanded) =>
          expandedKeywords.add(expanded)
        );
      }
    });

    return Array.from(expandedKeywords);
  }

  /**
   * 检测主题冲突
   */
  static detectThemeConflict(
    query: string,
    content: string
  ): {
    hasConflict: boolean;
    conflictingThemes: string[];
    queryTheme: string | null;
  } {
    const keywords = query
      .toLowerCase()
      .split(/[\s,，]+/)
      .filter((word) => word.length > 1);
    const contentLower = content.toLowerCase();

    // 检查是否存在主题冲突
    const queryTheme = keywords.find((word) => THEME_KEYWORDS[word]);

    if (queryTheme) {
      const conflictingThemes = Object.keys(THEME_KEYWORDS).filter(
        (theme) =>
          theme !== queryTheme &&
          THEME_KEYWORDS[theme].some((conflictWord) =>
            contentLower.includes(conflictWord)
          )
      );

      return {
        hasConflict: conflictingThemes.length > 0,
        conflictingThemes,
        queryTheme,
      };
    }

    return { hasConflict: false, conflictingThemes: [], queryTheme: null };
  }

  /**
   * 获取主题关键词
   */
  static getThemeKeywords(theme: string): string[] {
    return THEME_KEYWORDS[theme] || [];
  }

  /**
   * 获取关键词扩展
   */
  static getKeywordExpansions(keyword: string): string[] {
    return KEYWORD_EXPANSIONS[keyword] || [];
  }

  /**
   * 添加新的关键词扩展
   */
  static addKeywordExpansion(keyword: string, expansions: string[]): void {
    KEYWORD_EXPANSIONS[keyword] = expansions;
  }

  /**
   * 添加新的主题关键词
   */
  static addThemeKeywords(theme: string, keywords: string[]): void {
    THEME_KEYWORDS[theme] = keywords;
  }

  /**
   * 获取所有支持的关键词
   */
  static getAllSupportedKeywords(): string[] {
    return Object.keys(KEYWORD_EXPANSIONS);
  }

  /**
   * 获取所有支持的主题
   */
  static getAllSupportedThemes(): string[] {
    return Object.keys(THEME_KEYWORDS);
  }
}

/**
 * 默认配置导出
 */
export const DEFAULT_KEYWORD_CONFIG: KeywordConfig = {
  expansions: KEYWORD_EXPANSIONS,
  themes: THEME_KEYWORDS,
};

export default KeywordManager;
