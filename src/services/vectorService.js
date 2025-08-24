const DashVectorClient = require('../utils/dashvector');
const DashScopeClient = require('../utils/dashscope');

class VectorService {
  constructor() {
    this.dashVectorClient = new DashVectorClient(
      process.env.DASHVECTOR_API_KEY,
      process.env.DASHVECTOR_ENDPOINT
    );
    
    this.dashScopeClient = new DashScopeClient(process.env.DASHSCOPE_API_KEY);
    
    this.collectionName = 'xiaohongshu_notes';
  }

  // 初始化向量数据库集合
  async initCollection(dimension = 1024) {
    try {
      // 先尝试删除已存在的集合
      try {
        await this.dashVectorClient.deleteCollection(this.collectionName);
      } catch (error) {
        // 如果集合不存在，忽略错误
        console.log('集合不存在，无需删除');
      }
      
      // 创建新的集合
      await this.dashVectorClient.createCollection(this.collectionName, dimension);
      console.log(`成功创建集合: ${this.collectionName}`);
    } catch (error) {
      console.error('初始化集合失败:', error);
      throw error;
    }
  }

  // 为笔记内容生成向量并存储
  async vectorizeAndStoreNote(note) {
    try {
      // 合并标题和内容用于向量化
      const text = `${note.detail.title} ${note.detail.content}`;
      
      // 生成向量
      const vector = await this.dashScopeClient.embedText(text);
      
      // 存储到向量数据库
      const doc = {
        id: note.noteId,
        vector: vector,
        fields: {
          noteId: note.noteId,
          title: note.detail.title,
          content: note.detail.content,
        },
      };
      
      await this.dashVectorClient.insertDocs(this.collectionName, [doc]);
      console.log(`成功向量化并存储笔记: ${note.noteId}`);
      
      return vector;
    } catch (error) {
      console.error(`向量化笔记失败 ${note.noteId}:`, error);
      throw error;
    }
  }

  // 批量向量化和存储笔记
  async batchVectorizeAndStoreNotes(notes) {
    try {
      // 提取所有需要向量化的文本
      const texts = notes.map(note => `${note.detail.title} ${note.detail.content}`);
      
      // 批量生成向量
      const vectors = await this.dashScopeClient.embedTexts(texts);
      
      // 准备存储文档
      const docs = notes.map((note, index) => ({
        id: note.noteId,
        vector: vectors[index],
        fields: {
          noteId: note.noteId,
          title: note.detail.title,
          content: note.detail.content,
        },
      }));
      
      // 批量存储到向量数据库
      await this.dashVectorClient.insertDocs(this.collectionName, docs);
      console.log(`成功批量向量化并存储 ${notes.length} 条笔记`);
      
      return vectors;
    } catch (error) {
      console.error('批量向量化笔记失败:', error);
      throw error;
    }
  }

  // 语义搜索
  async semanticSearch(query, topK = 5) {
    try {
      // 为查询文本生成向量
      const queryVector = await this.dashScopeClient.embedText(query);
      
      // 在向量数据库中搜索
      const results = await this.dashVectorClient.search(this.collectionName, queryVector, topK);
      
      return results;
    } catch (error) {
      console.error('语义搜索失败:', error);
      throw error;
    }
  }
}

module.exports = VectorService;
