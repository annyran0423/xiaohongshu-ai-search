#!/usr/bin/env node

// 插入小红书笔记数据的脚本
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';
const NOTES_DIR = path.join(__dirname, '..', 'notes');

// 笔记模型
const NoteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  url: { type: String },
  stats: { type: Object },
  images: [{ type: String }]
});

const Note = mongoose.model('Note', NoteSchema);

// 验证环境变量
function validateEnv() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }
}

// 读取notes目录中的所有JSON文件
function readNoteFiles() {
  try {
    console.log(`📂 读取目录: ${NOTES_DIR}`);

    if (!fs.existsSync(NOTES_DIR)) {
      throw new Error(`notes目录不存在: ${NOTES_DIR}`);
    }

    const files = fs.readdirSync(NOTES_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(NOTES_DIR, file));

    console.log(`📋 找到 ${files.length} 个笔记文件`);

    const notes = [];
    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const noteData = JSON.parse(content);

        // 转换为我们需要的格式
        const note = {
          noteId: noteData.noteId,
          title: noteData.detail?.title || '无标题',
          content: noteData.detail?.content || '',
          author: noteData.detail?.author || '匿名用户',
          tags: extractTags(noteData.detail?.content || ''),
          createdAt: new Date(noteData.timestamp),
          updatedAt: new Date(noteData.timestamp),
          stats: noteData.detail?.stats || {},
          images: noteData.detail?.images || [],
          url: noteData.originalInput || '',
        };

        notes.push(note);
      } catch (error) {
        console.error(`❌ 读取文件失败 ${file}:`, error.message);
      }
    }

    console.log(`✅ 成功读取 ${notes.length} 个笔记`);
    return notes;

  } catch (error) {
    console.error('❌ 读取笔记文件失败:', error.message);
    throw error;
  }
}

// 从内容中提取标签（简单的实现）
function extractTags(content) {
  const tagPattern = /#([\u4e00-\u9fa5a-zA-Z0-9]+)/g;
  const tags = [];
  let match;

  while ((match = tagPattern.exec(content)) !== null) {
    tags.push(match[1]);
  }

  return [...new Set(tags)]; // 去重
}

// 插入笔记数据
async function insertNoteData() {
  try {
    console.log('🚀 开始插入小红书笔记数据...');
    console.log('================================');

    // 验证环境变量
    validateEnv();

    // 读取笔记文件
    const notes = readNoteFiles();

    if (notes.length === 0) {
      console.log('⚠️ 没有找到笔记数据，请检查notes目录');
      return;
    }

    // 连接数据库
    console.log('📪 连接 MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      // 新版本mongoose默认启用这些选项，不需要显式设置
    });
    console.log('✅ MongoDB 连接成功');

    // 清空现有数据
    console.log('🗑️ 清空现有数据...');
    await Note.deleteMany({});
    console.log('✅ 现有数据已清空');

    // 插入笔记数据（处理重复）
    console.log('📝 插入笔记数据...');

    let successCount = 0;
    let duplicateCount = 0;
    const insertedNotes = [];

    for (const note of notes) {
      try {
        const existingNote = await Note.findOne({ noteId: note.noteId });
        if (existingNote) {
          duplicateCount++;
          console.log(`⚠️ 笔记已存在，跳过: ${note.noteId}`);
          continue;
        }

        const insertedNote = await Note.create(note);
        insertedNotes.push(insertedNote);
        successCount++;
      } catch (error) {
        console.error(`❌ 插入笔记失败 ${note.noteId}:`, error.message);
      }
    }

    console.log(`✅ 成功插入 ${successCount} 条笔记数据`);
    if (duplicateCount > 0) {
      console.log(`⚠️ 跳过重复笔记 ${duplicateCount} 条`);
    }
    console.log('');

    // 显示插入的数据（前10条）
    console.log('📋 插入的笔记数据（前10条）：');
    const displayCount = Math.min(10, insertedNotes.length);
    for (let i = 0; i < displayCount; i++) {
      const note = insertedNotes[i];
      console.log(`${i + 1}. ${note.title} (${note.noteId})`);
      console.log(`   标签: ${note.tags.slice(0, 3).join(', ')}${note.tags.length > 3 ? '...' : ''}`);
      console.log(`   作者: ${note.author}`);
      console.log(`   内容长度: ${note.content.length} 字符`);
      console.log('');
    }

    if (insertedNotes.length > 10) {
      console.log(`... 还有 ${insertedNotes.length - 10} 条笔记`);
    }

    console.log('🎉 小红书笔记数据插入完成！');

  } catch (error) {
    console.error('❌ 插入笔记数据失败:', error.message);
    process.exit(1);
  } finally {
    // 关闭数据库连接
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📪 数据库连接已关闭');
    }
  }
}

// 运行脚本
if (require.main === module) {
  insertNoteData();
}

module.exports = { insertNoteData };
