#!/usr/bin/env node

// 测试向量搜索的语义匹配效果
require('dotenv').config();

async function testSearch(query, withSummary = false) {
  console.log(`🔍 测试搜索："${query}"`);
  console.log('='.repeat(50));

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
        console.log('\n📋 搜索结果：');
        data.data.results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.title}`);
          console.log(`   📝 内容预览：${result.content.substring(0, 80)}...`);
          console.log(`   🏷️ 标签：${result.tags?.join(', ') || '无'}`);
          console.log(`   📊 分数：${result.score?.toFixed(4) || 'N/A'}`);
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

// 测试多个查询
async function runTests() {
  const testQueries = [
    '悉尼拍照',
    '悉尼拍照机位',
    '悉尼摄影攻略',
    '悉尼最佳拍照地点',
    '悉尼旅游',
    '悉尼美食'
  ];

  console.log('🧪 测试向量搜索的语义匹配效果');
  console.log('='.repeat(60));
  console.log('📊 数据库统计：18条笔记，拍照相关内容比例94.4%');
  console.log('');

  for (const query of testQueries) {
    await testSearch(query);
    // 短暂延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎯 分析结果：');
  console.log('如果"悉尼拍照"没有结果但其他查询有结果，说明向量搜索的语义匹配有问题');
  console.log('可能需要：1. 重新生成向量 2. 优化嵌入模型 3. 添加关键词扩展');
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testSearch, runTests };
