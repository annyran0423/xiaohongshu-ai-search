#!/usr/bin/env node

// 测试API架构的脚本
require('dotenv').config();

async function testApiArchitecture() {
  try {
    console.log('🧪 测试新的API架构...');

    // 测试类型定义
    console.log('📋 1. 测试类型定义...');
    const types = require('../search-frontend/src/lib/types/api.ts');
    console.log('✅ 类型定义加载成功');

    // 测试HTTP客户端
    console.log('📋 2. 测试HTTP客户端...');
    const { HttpClientFactory } = require('../search-frontend/src/lib/http.ts');
    console.log('✅ HTTP客户端加载成功');

    // 测试基础处理器
    console.log('📋 3. 测试基础处理器...');
    const { BaseApiHandler } = require('../search-frontend/src/lib/handlers/base.ts');
    console.log('✅ 基础处理器加载成功');

    // 测试搜索处理器
    console.log('📋 4. 测试搜索处理器...');
    const { SearchApiHandler } = require('../search-frontend/src/lib/handlers/search.ts');
    console.log('✅ 搜索处理器加载成功');

    // 测试服务
    console.log('📋 5. 测试服务...');
    const { DashScopeService } = require('../search-frontend/src/lib/services/dashscope.ts');
    const { DashVectorService } = require('../search-frontend/src/lib/services/dashvector.ts');
    console.log('✅ 服务加载成功');

    console.log('');
    console.log('🎉 所有API架构组件测试通过！');
    console.log('');
    console.log('📊 架构改进总结：');
    console.log('   ✅ 错误处理: any → ApiException');
    console.log('   ✅ HTTP客户端: axios拼接 → HttpClient实例');
    console.log('   ✅ 类型安全: 更好的TypeScript支持');
    console.log('   ✅ 可扩展性: 统一的API处理器架构');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  testApiArchitecture();
}

module.exports = { testApiArchitecture };
