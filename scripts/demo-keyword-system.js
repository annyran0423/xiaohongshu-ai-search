#!/usr/bin/env node

// 演示统一关键词管理系统
require('dotenv').config();

// 模拟关键词管理器的功能（简化版）
const KEYWORD_EXPANSIONS = {
  拍照: ['摄影', '机位', '拍摄', '照相', '角度', '景点', '美景', '风景'],
  摄影: ['拍照', '机位', '拍摄', '镜头', '角度', '照片', '相片'],
  美食: ['餐厅', '吃', '美食', '探店', '必吃', '推荐', '美食攻略'],
  攻略: ['指南', '路线', '行程', '玩法', '推荐', '经验', '攻略'],
  旅游: ['旅行', '游览', '景点', '路线', '攻略', '玩法'],
  悉尼: ['Sydney', '雪梨', '澳洲', '澳大利亚', '新南威尔士'],
  买手店: ['精品店', '购物', '时尚', '品牌', '选品', '设计师', '独立设计师', '时尚买手', '概念店', '潮流'],
  购物: ['买手店', '精品店', '商场', '品牌店', '消费', '采购', '选购'],
  时尚: ['买手店', '精品店', '潮流', '品牌', '设计师', '时装', '穿搭'],
  咖啡: ['咖啡馆', '咖啡店', '咖啡厅', '咖啡师', '手冲', '精品咖啡', '拉花'],
};

const THEME_KEYWORDS = {
  买手店: ['精品店', '购物', '时尚', '品牌', '选品', '设计师', '时装', '穿搭', '潮流'],
  购物: ['商场', '品牌店', '消费', '采购', '选购', '折扣', '促销'],
  美食: ['餐厅', '吃饭', '菜品', '口味', '厨师', '菜单', '食材'],
  咖啡: ['咖啡馆', '咖啡店', '咖啡厅', '拉花', '手冲', '豆子', '烘焙'],
  拍照: ['摄影', '机位', '角度', '镜头', '光线', '构图', '拍摄'],
  摄影: ['拍照', '机位', '拍摄', '镜头', '角度', '照片', '相片'],
  旅游: ['旅行', '游览', '景点', '路线', '攻略', '玩法'],
  攻略: ['指南', '路线', '行程', '玩法', '推荐', '经验'],
};

// 简化的关键词管理器
const KeywordManager = {
  expandKeywords(query) {
    const expandedKeywords = new Set([query]);
    query.split(/\s+/).forEach((word) => {
      if (KEYWORD_EXPANSIONS[word]) {
        KEYWORD_EXPANSIONS[word].forEach((expanded) => expandedKeywords.add(expanded));
      }
    });
    return Array.from(expandedKeywords);
  },

  detectThemeConflict(query, content) {
    const keywords = query.toLowerCase().split(/[\s,，]+/).filter((word) => word.length > 1);
    const contentLower = content.toLowerCase();

    const queryTheme = keywords.find(word => THEME_KEYWORDS[word]);
    if (queryTheme) {
      const conflictingThemes = Object.keys(THEME_KEYWORDS).filter(theme =>
        theme !== queryTheme &&
        THEME_KEYWORDS[theme].some(conflictWord =>
          contentLower.includes(conflictWord)
        )
      );

      return {
        hasConflict: conflictingThemes.length > 0,
        conflictingThemes,
        queryTheme
      };
    }

    return { hasConflict: false, conflictingThemes: [], queryTheme: null };
  },

  getAllSupportedKeywords() {
    return Object.keys(KEYWORD_EXPANSIONS);
  },

  getAllSupportedThemes() {
    return Object.keys(THEME_KEYWORDS);
  },

  getKeywordExpansions(keyword) {
    return KEYWORD_EXPANSIONS[keyword] || [];
  },

  getThemeKeywords(theme) {
    return THEME_KEYWORDS[theme] || [];
  }
};

/**
 * 演示关键词扩展功能
 */
function demoKeywordExpansion() {
  console.log('🔍 关键词扩展演示');
  console.log('='.repeat(50));

  const testQueries = ['买手店', '美食', '咖啡', '拍照'];

  testQueries.forEach(query => {
    const expanded = KeywordManager.expandKeywords(query);
    console.log(`原关键词: "${query}"`);
    console.log(`扩展后: ${expanded.join(', ')}`);
    console.log('');
  });
}

/**
 * 演示主题冲突检测
 */
function demoThemeConflict() {
  console.log('🎯 主题冲突检测演示');
  console.log('='.repeat(50));

  const testCases = [
    {
      query: '买手店',
      content: '悉尼买手店推荐，精品店选品，时尚品牌集合',
      description: '买手店相关内容'
    },
    {
      query: '买手店',
      content: 'Spago餐厅，意面美食，咖啡馆推荐',
      description: '买手店搜索中的餐厅内容'
    },
    {
      query: '美食',
      content: '餐厅推荐，菜品介绍，厨师作品',
      description: '美食相关内容'
    },
    {
      query: '咖啡',
      content: '咖啡馆推荐，拉花技术，手冲咖啡',
      description: '咖啡相关内容'
    }
  ];

  testCases.forEach(testCase => {
    const conflict = KeywordManager.detectThemeConflict(testCase.query, testCase.content);
    console.log(`查询: "${testCase.query}"`);
    console.log(`内容: "${testCase.content}"`);
    console.log(`冲突检测: ${conflict.hasConflict ? '⚠️ 发现冲突' : '✅ 无冲突'}`);
    if (conflict.hasConflict) {
      console.log(`冲突主题: ${conflict.conflictingThemes.join(', ')}`);
    }
    console.log('');
  });
}

/**
 * 演示关键词管理
 */
function demoKeywordManagement() {
  console.log('🔧 关键词管理演示');
  console.log('='.repeat(50));

  console.log('当前支持的关键词:');
  const keywords = KeywordManager.getAllSupportedKeywords();
  console.log(keywords.join(', '));

  console.log('\n当前支持的主题:');
  const themes = KeywordManager.getAllSupportedThemes();
  console.log(themes.join(', '));

  console.log('\n买手店关键词扩展:');
  const boutiqueExpansions = KeywordManager.getKeywordExpansions('买手店');
  console.log(boutiqueExpansions.join(', '));

  console.log('\n买手店主题关键词:');
  const boutiqueThemes = KeywordManager.getThemeKeywords('买手店');
  console.log(boutiqueThemes.join(', '));
}

/**
 * 演示实际使用场景
 */
function demoRealWorldUsage() {
  console.log('🌟 实际使用场景演示');
  console.log('='.repeat(50));

  console.log('场景: 用户搜索"买手店"');
  console.log('1. 关键词扩展:');
  const query = '买手店';
  const expandedKeywords = KeywordManager.expandKeywords(query);
  console.log(`   扩展关键词: ${expandedKeywords.join(', ')}`);

  console.log('\n2. 搜索结果评估:');
  const searchResults = [
    { title: '悉尼买手店推荐', content: '精品店选品，时尚品牌集合，设计师作品展示' },
    { title: 'Spago餐厅介绍', content: '意面美食，咖啡馆推荐，悉尼美食攻略' },
    { title: '时尚购物指南', content: '品牌店推荐，消费攻略，折扣信息' }
  ];

  searchResults.forEach((result, index) => {
    const conflict = KeywordManager.detectThemeConflict(query, result.content);
    const relevanceScore = conflict.hasConflict ? 0.2 : 1.0; // 简化的评分逻辑
    console.log(`   结果${index + 1}: "${result.title}"`);
    console.log(`   相关性评分: ${relevanceScore}`);
    console.log(`   主题冲突: ${conflict.hasConflict ? '是' : '否'}`);
    if (conflict.hasConflict) {
      console.log(`   冲突原因: 包含 ${conflict.conflictingThemes.join(', ')} 主题`);
    }
    console.log('');
  });

  console.log('3. AI总结优化:');
  console.log('   AI会优先使用高相关性内容进行总结');
  console.log('   餐厅内容会被过滤掉，避免主题混杂');
  console.log('   最终结果只包含购物相关的实用攻略');
}

// 主函数
function main() {
  console.log('🎉 统一关键词管理系统演示');
  console.log('='.repeat(60));
  console.log('');

  demoKeywordExpansion();
  demoThemeConflict();
  demoKeywordManagement();
  demoRealWorldUsage();

  console.log('🎯 总结');
  console.log('='.repeat(60));
  console.log('✅ 关键词扩展: 提高搜索覆盖率');
  console.log('✅ 主题冲突检测: 确保内容相关性');
  console.log('✅ 统一管理: 一处配置，处处使用');
  console.log('✅ 维护便利: 命令行工具快速操作');
  console.log('\n🚀 现在搜索"买手店"将获得精准的购物相关结果！');
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  demoKeywordExpansion,
  demoThemeConflict,
  demoKeywordManagement,
  demoRealWorldUsage
};
