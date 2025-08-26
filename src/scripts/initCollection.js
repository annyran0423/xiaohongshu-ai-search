require('dotenv').config();
const VectorService = require('../services/vectorService');

async function initCollection() {
  console.log('🚀 开始初始化向量数据库集合...');

  // 检查必要的环境变量
  if (!process.env.DASHVECTOR_API_KEY) {
    console.error('❌ 缺少 DASHVECTOR_API_KEY 环境变量');
    console.log('请在 .env 文件中配置 DASHVECTOR_API_KEY');
    process.exit(1);
  }

  if (!process.env.DASHVECTOR_ENDPOINT) {
    console.error('❌ 缺少 DASHVECTOR_ENDPOINT 环境变量');
    console.log('请在 .env 文件中配置 DASHVECTOR_ENDPOINT');
    process.exit(1);
  }

  if (!process.env.DASHSCOPE_API_KEY) {
    console.error('❌ 缺少 DASHSCOPE_API_KEY 环境变量');
    console.log('请在 .env 文件中配置 DASHSCOPE_API_KEY');
    process.exit(1);
  }
  try {
    const vectorService = new VectorService();

    // 初始化集合
    await vectorService.initCollection(1024);

    console.log('✅ 向量数据库集合初始化成功');
  } catch (error) {
    console.error('❌ 向量数据库集合初始化失败:', error.message);
    process.exit(1);
  }
}

// 执行初始化
initCollection();
