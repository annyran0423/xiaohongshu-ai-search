const VectorService = require('../services/vectorService');

const vectorService = new VectorService();

// 中间件：为新添加的笔记生成向量
const vectorizeNote = async (req, res, next) => {
  try {
    const note = req.body;

    // 合并标题和内容生成向量
    const text = `${note.detail.title} ${note.detail.content}`;
    const vector = await vectorService.dashScopeClient.embedText(text);

    // 将向量添加到请求对象中，供后续中间件使用
    req.vectorizedData = vector;

    console.log('✅ 向量化处理完成');
    next(); // 继续到下一个中间件
  } catch (error) {
    console.error('向量化笔记失败:', error);
    res.status(500).json({ error: '向量化笔记失败' });
  }
};

// 中间件：语义搜索
const semanticSearch = async (req, res, next) => {
  try {
    const { query, topK } = req.query;

    if (!query) {
      return res.status(400).json({ error: '缺少查询参数' });
    }

    // 执行语义搜索
    const results = await vectorService.semanticSearch(query, parseInt(topK) || 20);

    // 将搜索结果添加到请求对象中
    req.searchResults = results;

    next();
  } catch (error) {
    console.error('语义搜索失败:', error);
    res.status(500).json({ error: '语义搜索失败' });
  }
};

module.exports = {
  vectorizeNote,
  semanticSearch,
};
