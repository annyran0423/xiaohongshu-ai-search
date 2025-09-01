#!/usr/bin/env node

// 搜索数据库中与拍照相关的所有内容
require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB 配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';

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

// 拍照相关关键词
const photoKeywords = [
  '拍照', '摄影', '机位', '拍摄', '照相', '拍', 'photo', 'photography',
  'camera', '镜头', '角度', '景', '景点', '美景', '风景'
];

async function searchPhotoContent() {
  try {
    console.log('📸 搜索数据库中的拍照相关内容');
    console.log('='.repeat(60));

    console.log('🔍 连接 MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB 连接成功');

    // 搜索包含拍照关键词的内容
    console.log('\n📊 拍照相关内容搜索结果：');
    console.log('='.repeat(60));

    for (const keyword of photoKeywords) {
      const regex = new RegExp(keyword, 'i'); // 忽略大小写

      // 在标题和内容中搜索
      const results = await Note.find({
        $or: [
          { title: regex },
          { content: regex },
          { tags: regex }
        ]
      });

      if (results.length > 0) {
        console.log(`\n🔍 关键词 "${keyword}" 找到 ${results.length} 条相关内容：`);

        results.forEach((note, index) => {
          console.log(`${index + 1}. 标题：${note.title}`);
          console.log(`   📝 内容预览：${note.content.substring(0, 100)}...`);
          console.log(`   🏷️  标签：${note.tags.join(', ')}`);
          console.log(`   👤 作者：${note.author}`);
          console.log('');
        });
      }
    }

    // 统计所有笔记的关键词出现情况
    console.log('\n📈 总体统计：');
    const totalNotes = await Note.countDocuments();
    console.log(`📋 总笔记数：${totalNotes}`);

    let photoRelatedCount = 0;
    const allNotes = await Note.find({});

    for (const note of allNotes) {
      const fullText = (note.title + ' ' + note.content + ' ' + note.tags.join(' ')).toLowerCase();
      const hasPhotoKeyword = photoKeywords.some(keyword =>
        fullText.includes(keyword.toLowerCase())
      );

      if (hasPhotoKeyword) {
        photoRelatedCount++;
      }
    }

    console.log(`📸 拍照相关笔记数：${photoRelatedCount}`);
    console.log(`📊 拍照相关比例：${((photoRelatedCount / totalNotes) * 100).toFixed(1)}%`);

    // 显示所有笔记的标题，方便查看是否有相关内容
    console.log('\n📝 所有笔记标题：');
    console.log('='.repeat(60));

    const allTitles = await Note.find({}, 'title tags').sort({ createdAt: -1 });
    allTitles.forEach((note, index) => {
      console.log(`${index + 1}. ${note.title}`);
      console.log(`   🏷️ 标签：${note.tags.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📪 数据库连接已关闭');
    }
  }
}

// 运行搜索
if (require.main === module) {
  searchPhotoContent().catch(console.error);
}

module.exports = { searchPhotoContent };
