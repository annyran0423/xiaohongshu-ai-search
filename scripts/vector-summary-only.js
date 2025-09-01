#!/usr/bin/env node

// 仅使用向量数据库进行总结的示例
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';

// 笔记模型
const NoteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  url: { type: String },
  stats: { type: Object },
  images: [{ type: String }]
});

const Note = mongoose.model('Note', NoteSchema);

// 简单的向量搜索模拟
async function simpleVectorSearch(query, topK = 3) {
  // 模拟：基于关键词的简单搜索（实际应该是向量相似度搜索）
  const keywords = query.split(' ').filter(word => word.length > 1);

  const results = await Note.find({
    $or: [
      { title: { $regex: keywords.join('|'), $options: 'i' } },
      { content: { $regex: keywords.join('|'), $options: 'i' } },
      { tags: { $in: keywords } }
    ]
  }).limit(topK * 2); // 多取一些用于去重

  return results.slice(0, topK);
}

// 纯向量数据库的总结方法
async function summarizeWithVectorDBOnly(searchResults, query) {
  console.log('📊 使用向量数据库方法进行总结...');

  // 方法1: 简单的标题聚合
  const titles = searchResults.map(r => r.title);
  const titleSummary = titles.join('；');

  // 方法2: 标签聚合
  const allTags = searchResults.flatMap(r => r.tags || []);
  const uniqueTags = [...new Set(allTags)];
  const tagSummary = uniqueTags.slice(0, 10).join('、');

  // 方法3: 内容长度统计
  const avgLength = Math.round(
    searchResults.reduce((sum, r) => sum + r.content.length, 0) / searchResults.length
  );

  // 方法4: 作者统计
  const authors = searchResults.map(r => r.author).filter(a => a);
  const uniqueAuthors = [...new Set(authors)];

  // 生成简单的总结
  const summary = `
📋 搜索结果统计：
• 找到 ${searchResults.length} 篇相关内容
• 涉及主题：${titleSummary}
• 相关标签：${tagSummary}
• 平均内容长度：${avgLength} 字符
• 内容创作者：${uniqueAuthors.join('、')}

💡 简单分析：
这些内容主要围绕 ${query} 展开，涵盖了多个相关主题。
建议进一步阅读上述内容获取详细信息。
  `.trim();

  return summary;
}

// 主函数
async function demonstrateVectorOnlySummary(query = "悉尼旅游攻略") {
  try {
    console.log(`🔍 查询: "${query}"`);
    console.log('='.repeat(50));

    // 连接数据库
    await mongoose.connect(MONGODB_URI);
    console.log('✅ 数据库连接成功');

    // 执行搜索
    console.log('🔄 执行向量搜索...');
    const searchResults = await simpleVectorSearch(query, 3);

    console.log(`📊 找到 ${searchResults.length} 个结果:`);
    searchResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   👤 作者: ${result.author}`);
      console.log(`   🏷️  标签: ${result.tags?.slice(0, 3).join(', ')}`);
      console.log(`   📏 内容长度: ${result.content.length} 字符`);
      console.log('');
    });

    // 生成总结
    const summary = await summarizeWithVectorDBOnly(searchResults, query);

    console.log('📝 向量数据库生成的总结:');
    console.log('='.repeat(50));
    console.log(summary);

    // 对比展示
    console.log('\n🔄 与AI总结的对比:');
    console.log('='.repeat(50));
    console.log('向量数据库总结:');
    console.log('✅ 优点: 快速、无额外成本');
    console.log('❌ 缺点: 只能做简单统计，无法深度分析');
    console.log('❌ 缺点: 无法识别内容主题和趋势');
    console.log('❌ 缺点: 总结质量较差，可读性低');

    console.log('\nAI总结:');
    console.log('✅ 优点: 能深度理解内容，进行智能分析');
    console.log('✅ 优点: 能识别主题、趋势和洞察');
    console.log('✅ 优点: 生成自然流畅的总结文本');
    console.log('❌ 缺点: 需要额外API调用，有费用');

  } catch (error) {
    console.error('❌ 演示失败:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

// 运行演示
if (require.main === module) {
  const query = process.argv[2] || "悉尼旅游攻略";
  demonstrateVectorOnlySummary(query);
}

module.exports = { demonstrateVectorOnlySummary };
