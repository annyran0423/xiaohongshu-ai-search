#!/usr/bin/env node

// 测试 DashScope 文本生成和总结功能
require('dotenv').config();
const axios = require('axios');

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
const DASHSCOPE_ENDPOINT = process.env.DASHSCOPE_ENDPOINT || 'dashscope.aliyuncs.com';

// 测试文本生成
async function testTextGeneration() {
  try {
    console.log('🔄 测试 DashScope 文本生成...');

    const messages = [
      {
        role: 'system',
        content: '你是一个专业的AI助手，请简洁地回答问题。',
      },
      {
        role: 'user',
        content: '请介绍一下悉尼的旅游景点。',
      },
    ];

    const requestData = {
      model: 'qwen-turbo',
      input: {
        messages,
      },
      parameters: {
        max_tokens: 500,
        temperature: 0.3,
      },
    };

    console.log('📡 发送请求到:', `https://${DASHSCOPE_ENDPOINT}/api/v1/services/aigc/text-generation/generation`);
    console.log('🔑 API Key 前缀:', DASHSCOPE_API_KEY.substring(0, 10) + '...');

    const response = await axios.post(
      `https://${DASHSCOPE_ENDPOINT}/api/v1/services/aigc/text-generation/generation`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    console.log('✅ 文本生成成功!');
    console.log('📄 完整响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('📄 生成的内容:');
    console.log(response.data?.output?.text || '内容为空');

  } catch (error) {
    console.error('❌ 文本生成失败:');
    console.error('错误信息:', error.message);
    if (error.response) {
      console.error('API响应状态:', error.response.status);
      console.error('API响应数据:', error.response.data);
    }
  }
}

// 测试简单总结
async function testSimpleSummary() {
  try {
    console.log('\n🔄 测试简单总结功能...');

    const mockSearchResults = [
      {
        title: '悉尼旅游攻略｜6天5晚行程分享',
        content: '悉尼是一个美丽的城市，有很多值得游览的地方...',
        url: 'https://example.com/1'
      }
    ];

    const prompt = `请总结以下搜索结果：${JSON.stringify(mockSearchResults)}`;

    const messages = [
      {
        role: 'system',
        content: '你是一个专业的内容分析助手，请提供简洁的总结。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await axios.post(
      `https://${DASHSCOPE_ENDPOINT}/api/v1/services/aigc/text-generation/generation`,
      {
        model: 'qwen-turbo',
        input: { messages },
        parameters: {
          max_tokens: 300,
          temperature: 0.3,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    console.log('✅ 总结功能测试成功!');
    console.log('📄 总结结果:');
    console.log(response.data?.output?.text || '内容为空');

  } catch (error) {
    console.error('❌ 总结功能测试失败:');
    console.error('错误信息:', error.message);
    if (error.response) {
      console.error('API响应状态:', error.response.status);
      console.error('API响应数据:', error.response.data);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始测试 DashScope 文本生成功能');
  console.log('=====================================');

  // 检查环境变量
  if (!DASHSCOPE_API_KEY) {
    console.error('❌ DASHSCOPE_API_KEY 环境变量未设置');
    process.exit(1);
  }

  console.log('✅ 环境变量检查通过');

  // 测试文本生成
  await testTextGeneration();

  // 测试总结功能
  await testSimpleSummary();

  console.log('\n🎉 测试完成！');
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = { testTextGeneration, testSimpleSummary };
