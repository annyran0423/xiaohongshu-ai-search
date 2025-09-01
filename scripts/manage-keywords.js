#!/usr/bin/env node

// 关键词管理工具
// 用于管理搜索关键词扩展和主题冲突检测配置

const fs = require('fs');
const path = require('path');

// 关键词配置文件路径
const KEYWORDS_CONFIG_PATH = path.join(
  __dirname,
  '../search-frontend/src/lib/config/keywords.ts'
);

/**
 * 读取关键词配置
 */
function readKeywordsConfig() {
  try {
    const content = fs.readFileSync(KEYWORDS_CONFIG_PATH, 'utf8');

    // 移除注释以便正确解析
    const cleanContent = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .replace(/\/\/.*$/gm, ''); // 移除单行注释

    // 简单的解析 - 匹配对象内容
    const expansionsMatch = cleanContent.match(/export const KEYWORD_EXPANSIONS:[\s\S]*?({[\s\S]*?});/);
    const themesMatch = cleanContent.match(/export const THEME_KEYWORDS:[\s\S]*?({[\s\S]*?});/);

    if (!expansionsMatch || !themesMatch) {
      throw new Error('无法解析关键词配置文件');
    }

    return {
      expansions: expansionsMatch[1],
      themes: themesMatch[1]
    };
  } catch (error) {
    console.error('读取关键词配置失败:', error.message);
    return null;
  }
}

/**
 * 写入关键词配置
 */
function writeKeywordsConfig(config) {
  try {
    let content = fs.readFileSync(KEYWORDS_CONFIG_PATH, 'utf8');

    // 更新关键词扩展配置
    content = content.replace(
      /(export const KEYWORD_EXPANSIONS: Record<string, string\[\]>\s*=\s*)({[\s\S]*?});/,
      `$1${config.expansions};`
    );

    // 更新主题关键词配置
    content = content.replace(
      /(export const THEME_KEYWORDS: Record<string, string\[\]>\s*=\s*)({[\s\S]*?});/,
      `$1${config.themes};`
    );

    fs.writeFileSync(KEYWORDS_CONFIG_PATH, content);
    console.log('✅ 关键词配置已更新');
  } catch (error) {
    console.error('写入关键词配置失败:', error.message);
  }
}

/**
 * 显示当前关键词配置
 */
function showKeywords() {
  console.log('📋 当前关键词配置');
  console.log('='.repeat(60));

  const config = readKeywordsConfig();
  if (!config) return;

  console.log('\n🔍 关键词扩展配置:');
  console.log(config.expansions);

  console.log('\n🎯 主题关键词配置:');
  console.log(config.themes);
}

/**
 * 添加新的关键词扩展
 */
function addKeywordExpansion(keyword, expansions) {
  console.log(`➕ 添加关键词扩展: ${keyword}`);
  console.log(`扩展词: ${expansions.join(', ')}`);

  const config = readKeywordsConfig();
  if (!config) return;

  // 使用文本替换添加新配置
  const newEntry = `  ${keyword}: ['${expansions.join("', '")}'],`;
  const updatedExpansions = config.expansions.replace(/}(\s*)$/m, `  ${keyword}: ['${expansions.join("', '")}'],\n}$1`);

  writeKeywordsConfig({
    expansions: updatedExpansions,
    themes: config.themes
  });
}

/**
 * 添加新的主题关键词
 */
function addThemeKeywords(theme, keywords) {
  console.log(`🎯 添加主题关键词: ${theme}`);
  console.log(`关键词: ${keywords.join(', ')}`);

  const config = readKeywordsConfig();
  if (!config) return;

  // 使用文本替换添加新配置
  const newEntry = `  ${theme}: ['${keywords.join("', '")}'],`;
  const updatedThemes = config.themes.replace(/}(\s*)$/m, `  ${theme}: ['${keywords.join("', '")}'],\n}$1`);

  writeKeywordsConfig({
    expansions: config.expansions,
    themes: updatedThemes
  });
}

/**
 * 移除关键词扩展
 */
function removeKeywordExpansion(keyword) {
  console.log(`➖ 移除关键词扩展: ${keyword}`);

  const config = readKeywordsConfig();
  if (!config) return;

  // 使用正则表达式移除特定的关键词条目
  const keywordRegex = new RegExp(`\\s*${keyword}: \\[.*\\],?\\s*\\n`, 'g');
  const updatedExpansions = config.expansions.replace(keywordRegex, '');

  writeKeywordsConfig({
    expansions: updatedExpansions,
    themes: config.themes
  });
}

/**
 * 移除主题关键词
 */
function removeThemeKeywords(theme) {
  console.log(`🎯 移除主题关键词: ${theme}`);

  const config = readKeywordsConfig();
  if (!config) return;

  // 使用正则表达式移除特定的主题条目
  const themeRegex = new RegExp(`\\s*${theme}: \\[.*\\],?\\s*\\n`, 'g');
  const updatedThemes = config.themes.replace(themeRegex, '');

  writeKeywordsConfig({
    expansions: config.expansions,
    themes: updatedThemes
  });
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('🔧 关键词管理工具使用说明');
  console.log('='.repeat(60));
  console.log('');
  console.log('📋 查看当前配置:');
  console.log('  node scripts/manage-keywords.js show');
  console.log('');
  console.log('➕ 添加关键词扩展:');
  console.log('  node scripts/manage-keywords.js add-expansion 关键词 扩展词1,扩展词2,扩展词3');
  console.log('  示例: node scripts/manage-keywords.js add-expansion 酒店 住宿,宾馆,旅店');
  console.log('');
  console.log('🎯 添加主题关键词:');
  console.log('  node scripts/manage-keywords.js add-theme 主题 关键词1,关键词2,关键词3');
  console.log('  示例: node scripts/manage-keywords.js add-theme 酒店 住宿,宾馆,预订,入住');
  console.log('');
  console.log('➖ 移除关键词扩展:');
  console.log('  node scripts/manage-keywords.js remove-expansion 关键词');
  console.log('  示例: node scripts/manage-keywords.js remove-expansion 酒店');
  console.log('');
  console.log('🎯 移除主题关键词:');
  console.log('  node scripts/manage-keywords.js remove-theme 主题');
  console.log('  示例: node scripts/manage-keywords.js remove-theme 酒店');
  console.log('');
  console.log('📚 显示帮助:');
  console.log('  node scripts/manage-keywords.js help');
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'show':
      showKeywords();
      break;

    case 'add-expansion':
      if (args.length < 3) {
        console.error('❌ 参数不足。使用方法: add-expansion 关键词 扩展词列表');
        process.exit(1);
      }
      const keyword = args[1];
      const expansions = args[2].split(',').map(s => s.trim());
      addKeywordExpansion(keyword, expansions);
      break;

    case 'add-theme':
      if (args.length < 3) {
        console.error('❌ 参数不足。使用方法: add-theme 主题 关键词列表');
        process.exit(1);
      }
      const theme = args[1];
      const themeKeywords = args[2].split(',').map(s => s.trim());
      addThemeKeywords(theme, themeKeywords);
      break;

    case 'remove-expansion':
      if (args.length < 2) {
        console.error('❌ 参数不足。使用方法: remove-expansion 关键词');
        process.exit(1);
      }
      removeKeywordExpansion(args[1]);
      break;

    case 'remove-theme':
      if (args.length < 2) {
        console.error('❌ 参数不足。使用方法: remove-theme 主题');
        process.exit(1);
      }
      removeThemeKeywords(args[1]);
      break;

    case 'help':
    default:
      showHelp();
      break;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  readKeywordsConfig,
  writeKeywordsConfig,
  showKeywords,
  addKeywordExpansion,
  addThemeKeywords,
  removeKeywordExpansion,
  removeThemeKeywords
};
