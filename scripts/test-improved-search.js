#!/usr/bin/env node

// 测试优化后的混合搜索效果
require('dotenv').config();

async function testImprovedSearch(query, withSummary = false) {
  console.log(`🔍 测试优化后的搜索："${query}"`);
  console.log('='.repeat(60));

  try {
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        topK: 10,
        withSummary: withSummary
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log(`✅ 搜索成功，返回 ${data.data?.totalResults || 0} 个结果`);

      if (data.data?.results && data.data.results.length > 0) {
        console.log('\n📋 搜索结果（按混合分数排序）：');
        data.data.results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.title}`);
          console.log(`   📝 内容预览：${result.content.substring(0, 80)}...`);

          // 检查是否包含拍照相关关键词
          const photoKeywords = ['拍照', '摄影', '机位', '拍摄', '照相', '拍', '角度', '景点'];
          const title = result.title.toLowerCase();
          const content = result.content.toLowerCase();
          const hasPhotoKeyword = photoKeywords.some(keyword =>
            title.includes(keyword.toLowerCase()) || content.includes(keyword.toLowerCase())
          );

          if (hasPhotoKeyword) {
            console.log(`   🎯 包含拍照关键词: ${photoKeywords.filter(k =>
              title.includes(k.toLowerCase()) || content.includes(k.toLowerCase())
            ).join(', ')}`);
          }

          console.log(`   📊 混合分数：${result.score?.toFixed(4) || 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('❌ 没有找到相关结果');
      }

      if (data.data?.summary) {
        console.log('\n🤖 AI总结：');
        console.log(data.data.summary);
      }
    } else {
      console.log(`❌ 搜索失败: ${data.message || '未知错误'}`);
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
  }

  console.log('');
}

// 测试优化效果
async function testOptimization() {
  const testQueries = [
    '悉尼拍照',
    '悉尼拍照机位',
    '悉尼摄影攻略',
    '悉尼最佳拍照地点'
  ];

  console.log('🧪 测试混合搜索优化效果');
  console.log('='.repeat(60));
  console.log('📊 优化策略:');
  console.log('1. 关键词扩展: "拍照" → ["摄影", "机位", "拍摄", "照相", "角度", "景点", "美景", "风景"]');
  console.log('2. 混合评分: 向量相似度 + 关键词匹配分数');
  console.log('3. 智能排序: 优先显示包含相关关键词的内容');
  console.log('');

  for (const query of testQueries) {
    await testImprovedSearch(query);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎯 优化效果分析:');
  console.log('✅ 现在搜索"悉尼拍照"应该能找到包含"摄影"、"机位"等关键词的内容');
  console.log('✅ 混合分数会优先显示最相关的结果');
  console.log('✅ 向量搜索的语义理解能力得到增强');
}

// 运行测试
if (require.main === module) {
  testOptimization().catch(console.error);
}

module.exports = { testImprovedSearch, testOptimization };
