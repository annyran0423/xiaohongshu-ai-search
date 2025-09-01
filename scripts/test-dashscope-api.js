#!/usr/bin/env node

// 测试DashScope API连接的脚本
require('dotenv').config();
const axios = require('axios');

async function testDashScopeAPI() {
  try {
    console.log('🧪 测试 DashScope Embeddings API...');
    console.log('=====================================');

    // 检查环境变量
    const apiKey = process.env.DASHSCOPE_API_KEY;
    const endpoint = process.env.DASHSCOPE_ENDPOINT || 'dashscope.aliyuncs.com';

    if (!apiKey) {
      console.error('❌ 错误：未设置 DASHSCOPE_API_KEY 环境变量');
      console.log('请在 .env 文件中设置：');
      console.log('DASHSCOPE_API_KEY=your_api_key_here');
      process.exit(1);
    }

    console.log('✅ 环境变量检查通过');
    console.log(`   API Key: ${apiKey.substring(0, 10)}...`);
    console.log(`   Endpoint: ${endpoint}`);

    // 测试API调用
    console.log('\n🔄 发送API请求...');

    const testText = '这是一段测试文本，用于验证DashScope向量嵌入API';
    const requestData = {
      model: 'text-embedding-v2',
      input: testText,
      encoding_format: 'float'
    };

    console.log('📤 请求数据:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(
      `https://${endpoint}/compatible-mode/v1/embeddings`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('\n📥 API响应:');
    console.log(`   状态码: ${response.status}`);
    console.log(`   响应时间: ${response.headers['x-amzn-RequestId'] || 'N/A'}`);

    if (response.data && response.data.data && response.data.data[0]) {
      const embedding = response.data.data[0].embedding;
      console.log(`   向量维度: ${embedding.length}`);
      console.log(`   向量前5个值: [${embedding.slice(0, 5).join(', ')}]`);
      console.log(`   使用情况: ${JSON.stringify(response.data.usage || {})}`);

      console.log('\n🎉 API测试成功！');
      console.log('✅ DashScope Embeddings API工作正常');
      console.log('✅ 向量嵌入功能可用');
      console.log('✅ 可以进行后续的向量化处理');

    } else {
      console.log('⚠️ 响应格式异常:', JSON.stringify(response.data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ API测试失败:');

    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误信息: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.code === 'ENOTFOUND') {
      console.error('   网络错误：无法连接到DashScope服务器');
      console.error('   请检查网络连接或endpoint配置');
    } else {
      console.error(`   错误: ${error.message}`);
    }

    console.log('\n🔧 故障排除建议:');
    console.log('   1. 检查API Key是否正确');
    console.log('   2. 确认账户是否有足够余额');
    console.log('   3. 检查网络连接');
    console.log('   4. 确认endpoint配置正确');

    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testDashScopeAPI();
}

module.exports = { testDashScopeAPI };
