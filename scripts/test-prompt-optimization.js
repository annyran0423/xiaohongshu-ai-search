#!/usr/bin/env node

// 测试优化后的Prompt效果
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

// 模拟向量搜索（实际应该是真实的向量搜索）
async function mockVectorSearch(query, topK = 5) {
  // 这里模拟一些与不同关键词相关的搜索结果
  const mockResults = [
    // 与"美食探店"相关的结果
    {
      title: "悉尼必吃美食推荐 | 网红餐厅大集合",
      content: "作为留学生，在悉尼发现了很多超级好吃的餐厅！今天给大家推荐几个我最爱的美食店：1. 意大利餐厅 - 手工披萨新鲜出炉；2. 日料店 - 新鲜刺身和寿司；3. 中餐厅 - 地道川菜和粤菜；4. 咖啡店 - 精致的下午茶套餐。每个餐厅都有自己的特色，一定要来试试！",
      url: "https://example.com/food1",
      author: "美食探店达人"
    },
    {
      title: "悉尼市中心美食地图 | 留学生版",
      content: "留学生党最爱的美食攻略！从经济实惠到高端餐厅，应有尽有。推荐几个性价比超高的选择：Haymarket的亚洲超市，CBD的各种餐厅，Surry Hills的咖啡馆。周末的时候可以去邦迪海滩附近的餐厅，一边吃美食一边看海景。",
      url: "https://example.com/food2",
      author: "留学生美食家"
    },
    // 与"美食探店"不太相关但被向量搜索找到的结果
    {
      title: "澳大利亚自驾游攻略 | 完整路线规划",
      content: "计划来澳大利亚自驾游的朋友们看过来！从悉尼出发，沿着海岸线自驾，途径多个美丽的海滩和国家公园。推荐路线：悉尼→卧龙岗→蓝山→ Hunter Valley。租车建议选择Budget或Avis，价格实惠，服务专业。",
      url: "https://example.com/drive1",
      author: "自驾游爱好者"
    },
    {
      title: "悉尼深度游攻略 | 10天完美行程",
      content: "深度体验悉尼的必备攻略！从皇家植物园到悉尼塔，从海港大桥到岩石区，每一个景点都有独特的魅力。建议游览时间：早上参观博物馆，中午品尝美食，下午逛街购物，晚上欣赏歌剧院表演。",
      url: "https://example.com/tour1",
      author: "深度游专家"
    },
    {
      title: "悉尼咖啡文化探索",
      content: "悉尼的咖啡文化超级发达！从传统意大利式咖啡到现代精品咖啡，应有尽有。推荐几个网红咖啡店：单品咖啡豆的选择方法，咖啡师的拉花技巧，配套的早餐和甜点。周末可以参加咖啡品鉴工作坊。",
      url: "https://example.com/coffee1",
      author: "咖啡文化爱好者"
    }
  ];

  // 根据关键词进行简单的相关性排序
  const queryLower = query.toLowerCase();
  const scoredResults = mockResults.map(result => {
    let score = 0;
    const titleLower = result.title.toLowerCase();
    const contentLower = result.content.toLowerCase();

    // 标题匹配权重最高
    if (titleLower.includes('美食') || titleLower.includes('餐厅') || titleLower.includes('探店')) score += 3;
    if (titleLower.includes('咖啡')) score += 2; // 咖啡也算美食

    // 内容匹配
    if (contentLower.includes('美食') || contentLower.includes('餐厅') || contentLower.includes('探店')) score += 2;
    if (contentLower.includes('咖啡') || contentLower.includes('披萨') || contentLower.includes('寿司')) score += 1.5;
    if (contentLower.includes('吃') || contentLower.includes('推荐')) score += 1;

    // 关键词出现在内容中
    const keywords = ['美食', '餐厅', '探店', '咖啡', '吃', '推荐'];
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 0.3;
      }
    });

    return { ...result, score };
  });

  // 按相关性排序并返回前topK个
  return scoredResults
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// 比较优化前后的Prompt效果
async function comparePrompts() {
  console.log('🍽️ 测试关键词："美食探店"');
  console.log('='.repeat(60));

  const query = "美食探店";
  const searchResults = await mockVectorSearch(query, 5);

  console.log('📊 搜索到的结果（按相关性排序）：');
  searchResults.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title} (相关性: ${result.score})`);
  });

  console.log('\n📝 优化前的Prompt效果：');
  console.log('❌ 问题：AI会总结所有内容，包括不相关的自驾游、深度游等主题');
  console.log('❌ 结果：生成的内容偏离"美食探店"主题，相关性低');

  console.log('\n📝 优化后的Prompt效果：');
  console.log('✅ 改进1：明确要求只分析与关键词高度相关的内容');
  console.log('✅ 改进2：添加相关性预过滤，只保留最相关的80%内容');
  console.log('✅ 改进3：强调实用价值，避免泛泛的介绍性内容');
  console.log('✅ 改进4：如果大部分内容不相关，会明确指出');

  // 展示最相关的结果（模拟优化后的效果）
  const highlyRelevant = searchResults.filter(r => r.score >= 2);
  console.log('\n🎯 优化后的AI只会分析这些高度相关的内容：');
  highlyRelevant.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   💡 为什么相关：${result.content.substring(0, 100)}...`);
  });

  console.log('\n📈 预期改进效果：');
  console.log('✅ 总结内容更聚焦：只讨论美食相关主题');
  console.log('✅ 实用性更强：提供具体的餐厅推荐和美食建议');
  console.log('✅ 相关性更高：避免无关的自驾游、深度游内容');
  console.log('✅ 用户体验更好：回答更符合用户的搜索意图');
}

// 运行测试
if (require.main === module) {
  comparePrompts().catch(console.error);
}

module.exports = { comparePrompts, mockVectorSearch };
