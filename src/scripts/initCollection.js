const VectorService = require('../services/vectorService');

async function initCollection() {
  try {
    const vectorService = new VectorService();
    
    // 初始化集合
    await vectorService.initCollection(1024);
    
    console.log('向量数据库集合初始化成功');
  } catch (error) {
    console.error('向量数据库集合初始化失败:', error);
  }
}

// 执行初始化
initCollection();
