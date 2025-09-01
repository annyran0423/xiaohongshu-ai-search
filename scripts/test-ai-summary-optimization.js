#!/usr/bin/env node

// 测试优化后的AI总结效果
require('dotenv').config();

async function testOptimizedSummary(query, withSummary = true) {
  console.log(`🧪 测试优化后的AI总结："${query}"`);
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
        console.log('\n📋 搜索结果（按优化后的相关性排序）：');
        data.data.results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.title}`);
          console.log(`   📝 内容预览：${result.content.substring(0, 80)}...`);

          // 检查相关性评分
          if (result.score !== undefined) {
            console.log(`   📊 相关性分数：${result.score?.toFixed(3) || 'N/A'}`);
          }

          console.log('');
        });
      }

      if (data.data?.summary) {
        console.log('\n🤖 优化后的AI总结（实用建议在前）：');
        console.log('='.repeat(50));
        console.log(data.data.summary);

        // 分析总结结构
        console.log('\n📊 总结结构分析：');
        const summary = data.data.summary;

        if (summary.includes('### 🔍 实用建议总结')) {
          console.log('✅ 包含"实用建议总结"部分');
        } else {
          console.log('❌ 缺少"实用建议总结"部分');
        }

        if (summary.includes('### 📝 核心攻略内容')) {
          console.log('✅ 包含"核心攻略内容"部分');
        } else {
          console.log('❌ 缺少"核心攻略内容"部分');
        }

        if (summary.includes('### 💡 经验分享')) {
          console.log('✅ 包含"经验分享"部分');
        } else {
          console.log('❌ 缺少"经验分享"部分');
        }
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
async function testOptimizationResults() {
  const testQueries = [
    '悉尼拍照',
    '悉尼摄影攻略',
    '悉尼美食'
  ];

  console.log('🧪 测试AI总结优化效果');
  console.log('='.repeat(60));
  console.log('📊 优化内容：');
  console.log('1. 改进内容筛选：只保留相关性评分>=2.0的内容');
  console.log('2. 重新设计结构：实用建议在前，具体内容在后');
  console.log('3. 优化相关性算法：考虑关键词密度和内容质量');
  console.log('');

  for (const query of testQueries) {
    await testOptimizedSummary(query);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 增加延迟
  }

  console.log('🎯 优化效果预期：');
  console.log('✅ 过滤掉不相关内容，只显示高质量相关内容');
  console.log('✅ 总结结构更清晰：实用建议→核心内容→经验分享');
  console.log('✅ 响应更精准，直接回答用户搜索意图');
}

// 运行测试
if (require.main === module) {
  testOptimizationResults().catch(console.error);
}

module.exports = { testOptimizedSummary, testOptimizationResults };
