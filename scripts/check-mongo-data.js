#!/usr/bin/env node

// 检查 MongoDB 中笔记数据的脚本
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';

// 笔记模型（与 insert-test-data.js 保持一致）
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

async function checkMongoData() {
  try {
    console.log('🔍 检查 MongoDB 数据');
    console.log('======================');

    // 连接数据库
    console.log('📪 连接 MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    // 获取集合统计信息
    console.log('📊 集合统计信息:');
    console.log(`   • 数据库名: ${mongoose.connection.db.databaseName}`);
    console.log('');

    // 获取笔记数量
    const totalCount = await Note.countDocuments();
    console.log(`📋 笔记总数: ${totalCount}`);
    console.log('');

    if (totalCount === 0) {
      console.log('⚠️  没有找到笔记数据，请先运行: npm run insert-notes');
      return;
    }

    // 显示前5条笔记的详细信息
    console.log('📝 笔记数据详情（前5条）:');
    console.log('='.repeat(80));

    const notes = await Note.find({}).limit(5).sort({ createdAt: -1 });

    notes.forEach((note, index) => {
      console.log(`${index + 1}. ${note.title}`);
      console.log(`   📝 笔记ID: ${note.noteId}`);
      console.log(`   👤 作者: ${note.author || '未知'}`);
      console.log(`   🏷️  标签: ${note.tags.length > 0 ? note.tags.slice(0, 3).join(', ') + (note.tags.length > 3 ? '...' : '') : '无'}`);
      console.log(`   📏 内容长度: ${note.content.length} 字符`);
      console.log(`   🔗 URL: ${note.url ? note.url.substring(0, 50) + '...' : '无'}`);
      console.log(`   🖼️  图片数量: ${note.images ? note.images.length : 0}`);
      console.log(`   📊 统计信息: ${note.stats ? JSON.stringify(note.stats) : '无'}`);
      console.log(`   📅 创建时间: ${note.createdAt.toLocaleString()}`);
      console.log('-'.repeat(80));
    });

    // 显示数据完整性检查
    console.log('🔍 数据完整性检查:');
    try {
      const notesWithUrl = await Note.countDocuments({ url: { $exists: true, $ne: '' } });
      const notesWithTags = await Note.countDocuments({ tags: { $exists: true, $size: { $gt: 0 } } });
      const notesWithImages = await Note.countDocuments({ images: { $exists: true, $size: { $gt: 0 } } });

      console.log(`   ✅ 包含URL的笔记: ${notesWithUrl}/${totalCount}`);
      console.log(`   ✅ 包含标签的笔记: ${notesWithTags}/${totalCount}`);
      console.log(`   ✅ 包含图片的笔记: ${notesWithImages}/${totalCount}`);
    } catch (error) {
      console.log(`   ⚠️  完整性检查跳过: ${error.message}`);
    }
    console.log('');

    // 显示字段分布统计
    console.log('📊 字段完整性统计:');
    const fields = ['url', 'tags', 'author', 'stats', 'images'];
    for (const field of fields) {
      const count = await Note.countDocuments({ [field]: { $exists: true } });
      const percentage = ((count / totalCount) * 100).toFixed(1);
      console.log(`   • ${field}: ${count}/${totalCount} (${percentage}%)`);
    }

    console.log('');
    console.log('🎉 数据检查完成！');

  } catch (error) {
    console.error('❌ 检查数据失败:', error.message);
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
  checkMongoData();
}

module.exports = { checkMongoData };
