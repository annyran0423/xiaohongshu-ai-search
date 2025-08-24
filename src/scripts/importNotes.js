require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');

// MongoDB 连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xiaohongshu';

// 小红书笔记数据模型
const noteSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true },
  originalInput: { type: String },
  timestamp: { type: Date, default: Date.now },
  detail: {
    id: { type: String },
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    stats: {
      likes: { type: String, default: "0" },
      comments: { type: String, default: "0" },
      collects: { type: String, default: "0" }
    },
    images: [{ type: String }],
    url: { type: String }
  },
  comments: [{ type: mongoose.Schema.Types.Mixed }],
  vector: { type: [Number], default: [] },
}, {
  timestamps: true
});

const Note = mongoose.model('Note', noteSchema);

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  }
}

async function importSingleNote(noteData) {
  try {
    // 检查是否已存在
    const existingNote = await Note.findOne({ noteId: noteData.noteId });
    if (existingNote) {
      console.log(`⚠️  笔记 ${noteData.noteId} 已存在，跳过`);
      return { success: false, reason: 'already_exists' };
    }

    // 创建新笔记
    const note = new Note({
      noteId: noteData.noteId,
      originalInput: noteData.originalInput,
      timestamp: noteData.timestamp ? new Date(noteData.timestamp) : new Date(),
      detail: noteData.detail,
      comments: noteData.comments || [],
      vector: [] // 向量化将在后续处理
    });

    await note.save();
    console.log(`✅ 成功导入笔记: ${noteData.detail.title} (${noteData.noteId})`);
    return { success: true, note };
  } catch (error) {
    console.error(`❌ 导入笔记失败 ${noteData.noteId}:`, error.message);
    return { success: false, reason: 'save_error', error: error.message };
  }
}

async function importFromDirectory(directoryPath) {
  try {
    const files = fs.readdirSync(directoryPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    console.log(`📁 发现 ${jsonFiles.length} 个 JSON 文件`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const file of jsonFiles) {
      const filePath = path.join(directoryPath, file);
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const noteData = JSON.parse(fileContent);

        const result = await importSingleNote(noteData);
        if (result.success) {
          successCount++;
        } else if (result.reason === 'already_exists') {
          skipCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ 解析文件失败 ${file}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 导入统计:');
    console.log(`✅ 成功导入: ${successCount} 个`);
    console.log(`⚠️  跳过重复: ${skipCount} 个`);
    console.log(`❌ 导入失败: ${errorCount} 个`);
    console.log(`📝 总计处理: ${jsonFiles.length} 个文件`);

  } catch (error) {
    console.error('❌ 读取目录失败:', error);
  }
}

async function importFromFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const noteData = JSON.parse(fileContent);

    const result = await importSingleNote(noteData);
    if (result.success) {
      console.log('✅ 单个文件导入成功');
    } else {
      console.log(`❌ 单个文件导入失败: ${result.reason}`);
    }
  } catch (error) {
    console.error('❌ 导入单个文件失败:', error);
  }
}

// 主函数
async function main() {
  await connectToDatabase();

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  导入单个文件: node importNotes.js /path/to/note.json');
    console.log('  导入目录中所有JSON: node importNotes.js /path/to/directory/');
    process.exit(1);
  }

  const targetPath = args[0];

  // 检查路径是否存在
  if (!fs.existsSync(targetPath)) {
    console.error('❌ 路径不存在:', targetPath);
    process.exit(1);
  }

  const stats = fs.statSync(targetPath);

  if (stats.isDirectory()) {
    console.log('📁 批量导入目录:', targetPath);
    await importFromDirectory(targetPath);
  } else if (stats.isFile() && targetPath.endsWith('.json')) {
    console.log('📄 导入单个文件:', targetPath);
    await importFromFile(targetPath);
  } else {
    console.error('❌ 请提供有效的 JSON 文件或包含 JSON 文件的目录');
    process.exit(1);
  }

  await mongoose.disconnect();
  console.log('🔌 数据库连接已关闭');
}

// 运行脚本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { importSingleNote, importFromDirectory, importFromFile };
