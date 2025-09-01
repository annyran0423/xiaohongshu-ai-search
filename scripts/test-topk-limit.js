#!/usr/bin/env node

// 测试topK限制
require('dotenv').config();

async function testTopKLimit() {
  console.log('🧪 测试topK限制...\n');

  // 测试不同的topK值
  const testCases = [5, 10, 20, 50, 100];

  for (const topK of testCases) {
    console.log(`📊 测试topK = ${topK}`);

    try {
      const response = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: '美食探店',
          topK: topK,
          withSummary: false
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(`✅ topK=${topK} 成功，返回${data.data?.totalResults || 0}个结果`);
      } else {
        console.log(`❌ topK=${topK} 失败: ${data.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ topK=${topK} 请求失败: ${error.message}`);
    }

    console.log('');
  }

  console.log('🎉 测试完成！');
}

// 运行测试
if (require.main === module) {
  testTopKLimit().catch(console.error);
}

module.exports = { testTopKLimit };
